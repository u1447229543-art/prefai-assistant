/**
 * One-time / offline script: translate journey step fields into FR + i18n langs,
 * then write static fields back into src/constants/journeys.ts.
 *
 * Usage:
 *   npm run translate:journey-steps -- all
 *   npm run translate:journey-steps -- all en,ka --force
 *   npm run translate:journey-steps -- all en,ka --durations-only
 *
 * Reads EXPO_PUBLIC_OPENAI_API_KEY or OPENAI_API_KEY from france-assistant/.env
 * (first), then backend/.env. Does NOT run at app runtime.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JOURNEYS_PATH = path.join(ROOT, 'src', 'constants', 'journeys.ts');
const WORKSPACE = path.resolve(ROOT, '..');
const REPORT_PATH = path.join(ROOT, 'scripts', 'translate-journey-steps.report.json');

const ALL_JOURNEY_IDS = [
  'arrived',
  'residence',
  'student',
  'caf',
  'health',
  'work',
  'asylum',
  'nationality',
  'other',
];

function loadEnvKey() {
  const candidates = [
    path.join(ROOT, '.env'),
    path.join(WORKSPACE, 'backend', '.env'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^(?:EXPO_PUBLIC_)?OPENAI_API_KEY=(.+)$/);
      if (m) {
        const v = m[1].trim().replace(/^["']|["']$/g, '');
        if (v) return { key: v, file, varName: line.split('=')[0] };
      }
    }
  }
  const fromEnv =
    (process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY || '').trim();
  return fromEnv
    ? {
        key: fromEnv,
        file: 'process.env',
        varName: process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY' : 'EXPO_PUBLIC_OPENAI_API_KEY',
      }
    : { key: '', file: null, varName: null };
}

function escapeTsString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function getStepChunk(block, stepId) {
  const stepStart = block.indexOf(`id: '${stepId}'`);
  if (stepStart < 0) return '';
  const afterId = block.slice(stepStart);
  const nextStep = afterId.search(/\n\s*\},\n\s*\{/);
  const stepEndRel = nextStep > 0 ? nextStep : afterId.search(/\n\s*\},\n\s*$/);
  return stepEndRel > 0 ? afterId.slice(0, stepEndRel) : afterId;
}

function extractJourneySteps(source, journeyId) {
  const journeyRe = new RegExp(
    `id:\\s*'${journeyId}'[\\s\\S]*?steps:\\s*\\[([\\s\\S]*?)\\n\\s*\\],\\n\\s*\\},`
  );
  const journeyMatch = source.match(journeyRe);
  if (!journeyMatch) throw new Error(`Could not find journey '${journeyId}' steps block`);
  const block = journeyMatch[1];
  const steps = [];
  const stepRe =
    /id:\s*'([^']+)'[\s\S]*?title:\s*'((?:\\'|[^'])*)'[\s\S]*?purpose:\s*'((?:\\'|[^'])*)'/g;
  let m;
  while ((m = stepRe.exec(block)) !== null) {
    const stepId = m[1];
    const stepChunk = getStepChunk(block, stepId);
    const durMatch = stepChunk.match(/duration:\s*'((?:\\'|[^'])*)'/);
    const hasKa =
      /title_i18n:\s*\{[^}]*\bka\s*:/.test(stepChunk) &&
      /purpose_i18n:\s*\{[^}]*\bka\s*:/.test(stepChunk);
    const hasDurationKa = /duration_i18n:\s*\{[^}]*\bka\s*:/.test(stepChunk);

    steps.push({
      id: stepId,
      title: m[2].replace(/\\'/g, "'"),
      purpose: m[3].replace(/\\'/g, "'"),
      duration: durMatch ? durMatch[1].replace(/\\'/g, "'") : '',
      hasKa,
      hasDurationKa,
    });
  }
  return steps;
}

async function openaiJson(apiKey, messages) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages,
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${raw.slice(0, 400)}`);
  const data = JSON.parse(raw);
  return JSON.parse(data?.choices?.[0]?.message?.content ?? '{}');
}

async function translateStep(apiKey, step, langs) {
  const prompt =
    `You translate PrefAI journey step cards for immigrants in France.\n` +
    `Return STRICT JSON only with keys:\n` +
    `  title_fr (string), purpose_fr (string),\n` +
    `  title_i18n (object with keys: ${langs.join(', ')}),\n` +
    `  purpose_i18n (object with keys: ${langs.join(', ')}),\n` +
    `  confidence ("high" | "medium" | "low"),\n` +
    `  notes (string, optional).\n` +
    `Rules:\n` +
    `- Keep French administrative terms accurate (VLS-TS, RIB, justificatif de domicile, etc.).\n` +
    `- Keep named plans/documents in Latin script (e.g. plan Nuñez) — do not phonetically transliterate them.\n` +
    `- title_i18n.en and purpose_i18n.en may match the English source (light polish OK).\n` +
    `- If unsure about a legal nuance, set confidence to "low" or "medium".\n` +
    `- Do not invent deadlines or fees not present in the source.\n\n` +
    `SOURCE title: ${JSON.stringify(step.title)}\n` +
    `SOURCE purpose: ${JSON.stringify(step.purpose)}`;

  return openaiJson(apiKey, [
    {
      role: 'system',
      content:
        'You are a careful translator for French bureaucracy UI copy. Prefer accuracy over fluency. Reply with JSON only.',
    },
    { role: 'user', content: prompt },
  ]);
}

async function translateDuration(apiKey, duration, langs) {
  const prompt =
    `Translate this PrefAI journey step duration label for immigrants in France.\n` +
    `Return STRICT JSON only with keys:\n` +
    `  duration_fr (string),\n` +
    `  duration_i18n (object with keys: ${langs.join(', ')}),\n` +
    `  confidence ("high" | "medium" | "low").\n` +
    `Rules:\n` +
    `- Keep numbers and ranges intact (1–4, 55, etc.).\n` +
    `- Keep French admin terms in Latin (récépissé, Carte Vitale, NIA, ameli.fr).\n` +
    `- Keep named plans/documents in Latin (plan Nuñez).\n` +
    `- duration_i18n.en may match the English source.\n` +
    `- Be concise — this is a badge/label, not a sentence.\n\n` +
    `SOURCE duration: ${JSON.stringify(duration)}`;

  return openaiJson(apiKey, [
    {
      role: 'system',
      content: 'You translate short UI duration labels. Reply with JSON only.',
    },
    { role: 'user', content: prompt },
  ]);
}

function buildInjection(tr, langs) {
  const titleI18n = { ...(tr.title_i18n || {}) };
  const purposeI18n = { ...(tr.purpose_i18n || {}) };
  const tObj = {};
  const pObj = {};
  for (const lang of langs) {
    if (titleI18n[lang]) tObj[lang] = titleI18n[lang];
    if (purposeI18n[lang]) pObj[lang] = purposeI18n[lang];
  }

  const needsReview = tr.confidence === 'low' || tr.confidence === 'medium';
  const reviewLine = needsReview ? '        // NEEDS_REVIEW\n' : '';

  const titleI18nLit = `{ ${Object.entries(tObj)
    .map(([k, v]) => `${k}: '${escapeTsString(v)}'`)
    .join(', ')} }`;
  const purposeI18nLit = `{ ${Object.entries(pObj)
    .map(([k, v]) => `${k}: '${escapeTsString(v)}'`)
    .join(', ')} }`;

  return (
    `${reviewLine}` +
    `        title_fr: '${escapeTsString(tr.title_fr || '')}',\n` +
    `${reviewLine}` +
    `        purpose_fr: '${escapeTsString(tr.purpose_fr || '')}',\n` +
    `${reviewLine}` +
    `        title_i18n: ${titleI18nLit},\n` +
    `${reviewLine}` +
    `        purpose_i18n: ${purposeI18nLit},\n`
  );
}

function buildDurationInjection(tr, langs) {
  const durationI18n = { ...(tr.duration_i18n || {}) };
  const dObj = {};
  for (const lang of langs) {
    if (durationI18n[lang]) dObj[lang] = durationI18n[lang];
  }
  const lit = `{ ${Object.entries(dObj)
    .map(([k, v]) => `${k}: '${escapeTsString(v)}'`)
    .join(', ')} }`;
  return `        duration_i18n: ${lit},\n`;
}

function mutateStepChunk(source, stepId, mutator) {
  const stepStart = source.indexOf(`id: '${stepId}'`);
  if (stepStart < 0) throw new Error(`Step ${stepId} not found`);
  const afterId = source.slice(stepStart);
  const nextStep = afterId.search(/\n\s*\},\n\s*\{/);
  const stepEndRel = nextStep > 0 ? nextStep : afterId.search(/\n\s*\},\n\s*\],/);
  if (stepEndRel < 0) throw new Error(`Could not bound step ${stepId}`);
  let stepChunk = afterId.slice(0, stepEndRel);
  stepChunk = mutator(stepChunk);
  return source.slice(0, stepStart) + stepChunk + afterId.slice(stepEndRel);
}

function injectIntoSource(source, stepId, injection) {
  return mutateStepChunk(source, stepId, (stepChunk) => {
    let chunk = stepChunk
      .replace(/\n\s*\/\/ NEEDS_REVIEW[^\n]*/g, '')
      .replace(/\n\s*title_fr:\s*'((?:\\'|[^'])*)',/g, '')
      .replace(/\n\s*purpose_fr:\s*'((?:\\'|[^'])*)',/g, '')
      .replace(/\n\s*title_i18n:\s*\{[^}]*\},/g, '')
      .replace(/\n\s*purpose_i18n:\s*\{[^}]*\},/g, '');

    const purposeRe = /(purpose:\s*'((?:\\'|[^'])*)',)/;
    if (!purposeRe.test(chunk)) throw new Error(`No purpose line in ${stepId}`);
    return chunk.replace(purposeRe, `$1\n${injection}`);
  });
}

function injectDurationIntoSource(source, stepId, injection) {
  return mutateStepChunk(source, stepId, (stepChunk) => {
    let chunk = stepChunk.replace(/\n\s*duration_i18n:\s*\{[^}]*\},/g, '');
    const durationRe = /(duration:\s*'((?:\\'|[^'])*)',)/;
    if (!durationRe.test(chunk)) throw new Error(`No duration line in ${stepId}`);
    return chunk.replace(durationRe, `$1\n${injection}`);
  });
}

async function main() {
  const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')));
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const force = flags.has('--force');
  const durationsOnly = flags.has('--durations-only');
  const journeyArg = args[0] || 'all';
  const langs = (args[1] || 'en,ka').split(',').map((s) => s.trim()).filter(Boolean);

  const journeyIds = journeyArg === 'all' ? ALL_JOURNEY_IDS : [journeyArg];

  const { key: apiKey, file: keyFile, varName } = loadEnvKey();
  if (!apiKey) {
    console.error('No OPENAI API key found in .env');
    process.exit(1);
  }
  console.log(
    `Using key from ${keyFile} → ${varName} (${apiKey.slice(0, 10)}…${apiKey.slice(-6)})`
  );
  console.log(durationsOnly ? 'Mode: durations-only (title/purpose untouched)' : 'Mode: title/purpose');

  let source = fs.readFileSync(JOURNEYS_PATH, 'utf8');
  const summary = [];
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const journeyId of journeyIds) {
    const steps = extractJourneySteps(source, journeyId);
    console.log(`\n=== ${journeyId} (${steps.length} steps) ===`);
    if (steps.length === 0) {
      console.warn(`  No steps extracted for ${journeyId}`);
      continue;
    }

    for (const step of steps) {
      if (durationsOnly) {
        if (!step.duration) {
          console.log(`  ${step.id}… FAILED (no duration)`);
          failed += 1;
          summary.push({ journeyId, id: step.id, failed: true, error: 'no duration' });
          continue;
        }
        if (step.hasDurationKa && !force) {
          console.log(`  ${step.id}… skip (already has duration ka)`);
          skipped += 1;
          summary.push({
            journeyId,
            id: step.id,
            skipped: true,
            reason: 'already has duration ka',
            duration: step.duration,
          });
          continue;
        }

        process.stdout.write(`  ${step.id} duration… `);
        try {
          const tr = await translateDuration(apiKey, step.duration, langs);
          const injection = buildDurationInjection(tr, langs);
          source = injectDurationIntoSource(source, step.id, injection);
          console.log(tr.confidence === 'high' ? 'ok' : `NEEDS_REVIEW(${tr.confidence})`);
          ok += 1;
          summary.push({
            journeyId,
            id: step.id,
            duration: step.duration,
            duration_ka: tr.duration_i18n?.ka,
            duration_fr: tr.duration_fr,
            confidence: tr.confidence || 'unknown',
            needsReview: tr.confidence !== 'high',
          });
        } catch (e) {
          console.log('FAILED');
          console.error('   ', e.message || e);
          failed += 1;
          summary.push({
            journeyId,
            id: step.id,
            duration: step.duration,
            failed: true,
            error: String(e.message || e),
          });
        }
        continue;
      }

      if (step.hasKa && !force) {
        console.log(`  ${step.id}… skip (already has ka; use --force to redo)`);
        skipped += 1;
        summary.push({
          journeyId,
          id: step.id,
          title: step.title,
          skipped: true,
          reason: 'already has ka',
        });
        continue;
      }

      process.stdout.write(`  ${step.id}… `);
      try {
        const tr = await translateStep(apiKey, step, langs);
        const injection = buildInjection(tr, langs);
        source = injectIntoSource(source, step.id, injection);
        const flag = tr.confidence === 'high' ? 'ok' : `NEEDS_REVIEW(${tr.confidence})`;
        console.log(flag);
        ok += 1;
        summary.push({
          journeyId,
          id: step.id,
          title: step.title,
          confidence: tr.confidence || 'unknown',
          title_ka: tr.title_i18n?.ka,
          title_fr: tr.title_fr,
          needsReview: tr.confidence !== 'high',
          notes: tr.notes || '',
        });
      } catch (e) {
        console.log('FAILED');
        console.error('   ', e.message || e);
        failed += 1;
        summary.push({
          journeyId,
          id: step.id,
          title: step.title,
          failed: true,
          error: String(e.message || e),
        });
      }
    }
  }

  fs.writeFileSync(JOURNEYS_PATH, source, 'utf8');
  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      { mode: durationsOnly ? 'durations-only' : 'title-purpose', ok, skipped, failed, langs, journeys: journeyIds, steps: summary },
      null,
      2
    ),
    'utf8'
  );
  console.log(`\nDone: ok=${ok} skipped=${skipped} failed=${failed}`);
  console.log(`Wrote ${JOURNEYS_PATH}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
