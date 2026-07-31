/**
 * One-time / offline script: translate journey step title+purpose into FR + i18n langs,
 * then write static fields back into src/constants/journeys.ts.
 *
 * Usage:
 *   node scripts/translate-journey-steps.cjs arrived
 *   node scripts/translate-journey-steps.cjs arrived ka,en
 *
 * Reads EXPO_PUBLIC_OPENAI_API_KEY or OPENAI_API_KEY from france-assistant/.env
 * or backend/.env. Does NOT run at app runtime.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JOURNEYS_PATH = path.join(ROOT, 'src', 'constants', 'journeys.ts');
const WORKSPACE = path.resolve(ROOT, '..');

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
        if (v) return v;
      }
    }
  }
  return (process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY || '').trim();
}

function escapeTsString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function extractArrivedSteps(source) {
  const journeyMatch = source.match(/id:\s*'arrived'[\s\S]*?steps:\s*\[([\s\S]*?)\n\s*\],\n\s*\},/);
  if (!journeyMatch) throw new Error('Could not find arrived journey steps block');
  const block = journeyMatch[1];
  const steps = [];
  const stepRe = /id:\s*'([^']+)'[\s\S]*?title:\s*'((?:\\'|[^'])*)'[\s\S]*?purpose:\s*'((?:\\'|[^'])*)'/g;
  let m;
  while ((m = stepRe.exec(block)) !== null) {
    steps.push({
      id: m[1],
      title: m[2].replace(/\\'/g, "'"),
      purpose: m[3].replace(/\\'/g, "'"),
    });
  }
  return steps;
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
    `- title_i18n.en and purpose_i18n.en may match the English source (light polish OK).\n` +
    `- If unsure about a legal nuance, set confidence to "low" or "medium".\n` +
    `- Do not invent deadlines or fees not present in the source.\n\n` +
    `SOURCE title: ${JSON.stringify(step.title)}\n` +
    `SOURCE purpose: ${JSON.stringify(step.purpose)}`;

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
      messages: [
        {
          role: 'system',
          content:
            'You are a careful translator for French bureaucracy UI copy. Prefer accuracy over fluency. Reply with JSON only.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${raw.slice(0, 400)}`);
  }
  const data = JSON.parse(raw);
  const content = data?.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(content);
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

function injectIntoSource(source, stepId, injection) {
  const stepStart = source.indexOf(`id: '${stepId}'`);
  if (stepStart < 0) throw new Error(`Step ${stepId} not found`);
  const afterId = source.slice(stepStart);
  const nextStep = afterId.search(/\n\s*\},\n\s*\{/);
  const stepEndRel = nextStep > 0 ? nextStep : afterId.search(/\n\s*\},\n\s*\],/);
  if (stepEndRel < 0) throw new Error(`Could not bound step ${stepId}`);
  let stepChunk = afterId.slice(0, stepEndRel);

  stepChunk = stepChunk
    .replace(/\n\s*\/\/ NEEDS_REVIEW/g, '')
    .replace(/\n\s*title_fr:\s*'((?:\\'|[^'])*)',/g, '')
    .replace(/\n\s*purpose_fr:\s*'((?:\\'|[^'])*)',/g, '')
    .replace(/\n\s*title_i18n:\s*\{[^}]*\},/g, '')
    .replace(/\n\s*purpose_i18n:\s*\{[^}]*\},/g, '');

  const purposeRe = /(purpose:\s*'((?:\\'|[^'])*)',)/;
  if (!purposeRe.test(stepChunk)) throw new Error(`No purpose line in ${stepId}`);
  stepChunk = stepChunk.replace(purposeRe, `$1\n${injection}`);

  return source.slice(0, stepStart) + stepChunk + afterId.slice(stepEndRel);
}

async function main() {
  const journeyId = process.argv[2] || 'arrived';
  const langs = (process.argv[3] || 'en,ka').split(',').map((s) => s.trim()).filter(Boolean);
  if (journeyId !== 'arrived') {
    console.warn(`Note: extractor currently targets 'arrived' block; requested=${journeyId}`);
  }

  const apiKey = loadEnvKey();
  if (!apiKey) {
    console.error('No OPENAI API key found in .env');
    process.exit(1);
  }

  let source = fs.readFileSync(JOURNEYS_PATH, 'utf8');
  const steps = extractArrivedSteps(source);
  if (steps.length === 0) {
    console.error('No steps extracted');
    process.exit(1);
  }

  console.log(`Translating ${steps.length} steps for journey '${journeyId}' → langs=${langs.join(',')}`);
  const summary = [];

  for (const step of steps) {
    process.stdout.write(`  ${step.id}… `);
    try {
      const tr = await translateStep(apiKey, step, langs);
      const injection = buildInjection(tr, langs);
      source = injectIntoSource(source, step.id, injection);
      const flag = tr.confidence === 'high' ? 'ok' : `NEEDS_REVIEW(${tr.confidence})`;
      console.log(flag);
      summary.push({
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
      console.error(e.message || e);
      summary.push({ id: step.id, title: step.title, failed: true, error: String(e.message || e) });
    }
  }

  fs.writeFileSync(JOURNEYS_PATH, source, 'utf8');
  const reportPath = path.join(ROOT, 'scripts', 'translate-journey-steps.report.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\nWrote ${JOURNEYS_PATH}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
