/**
 * Offline translator for DailyQuestion bank (ka → other app languages).
 *
 * Usage:
 *   npm run translate:daily-questions
 *
 * Writes:
 *   - backend/data/dailyQuestions.seed.json (adds question_i18n / explanation_i18n)
 *   - scripts/translate-daily-questions.report.json (NEEDS_REVIEW + failures)
 *   - MongoDB DailyQuestion docs when MONGODB_URI is set (use: railway run -- npm run …)
 *
 * Does NOT invent translations on parse failure — skips and records a failure.
 */

const fs = require('fs');
const path = require('path');
const dns = require('dns');

const ROOT = path.resolve(__dirname, '..');
const WORKSPACE = path.resolve(ROOT, '..');
const SEED_PATH = path.join(WORKSPACE, 'backend', 'data', 'dailyQuestions.seed.json');
const REPORT_PATH = path.join(ROOT, 'scripts', 'translate-daily-questions.report.json');

const TARGET_LANGS = ['en', 'fr', 'es', 'ru', 'ar', 'bn', 'zh', 'hi', 'pt'];
const LANG_NAMES = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  ru: 'Russian',
  ar: 'Arabic',
  bn: 'Bengali',
  zh: 'Chinese (Mandarin)',
  hi: 'Hindi',
  pt: 'Portuguese',
};

/** Official French terms — keep Latin form inside every language. */
const FRENCH_TERMS = [
  "droit à l'erreur",
  'droit à l’erreur',
  'PACS',
  'Pacte civil de solidarité',
  'CPAM',
  'CAF',
  'ANEF',
  'Carte Vitale',
  'FranceConnect',
  'Défenseur des droits',
  'Assurance Maladie',
  'résidence principale',
  'titre de séjour',
  'Assemblée nationale',
  'Sénat',
  'Conseil constitutionnel',
  'Service-Public.fr',
  'Allô Service Public',
  'numéro de sécurité sociale',
  'dépôt de garantie',
  'location meublée',
  'location vide',
  'non-meublé',
  'meublé',
  'notice period',
  'silence vaut accord',
  'durée légale du travail',
  'Code civil',
  'Code Napoléon',
  'La Marseillaise',
  'Liberté, Égalité, Fraternité',
  'Roi-Soleil',
  'Mont-Saint-Michel',
  'Élysée',
  'Vie-publique',
  'Préfecture',
];

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
} catch {
  /* ignore */
}

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

function loadMongoUri() {
  if ((process.env.MONGODB_URI || '').trim()) return process.env.MONGODB_URI.trim();
  const file = path.join(WORKSPACE, 'backend', '.env');
  if (!fs.existsSync(file)) return '';
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^MONGODB_URI=(.+)$/);
    if (m) {
      const v = m[1].trim().replace(/^["']|["']$/g, '');
      if (v) return v;
    }
  }
  return '';
}

function looksSensitive(text) {
  if (!text) return false;
  if (/\d/.test(text)) return true; // numbers / dates / thresholds
  const lower = text.toLowerCase();
  for (const term of FRENCH_TERMS) {
    if (lower.includes(term.toLowerCase())) return true;
  }
  // Common institution / legal markers in Latin or Georgian contexts
  if (
    /\b(UNESCO|NATO|D-Day|Kipferl|ANEF|PACS|CPAM|CAF|OFII|URSSAF|CNI)\b/i.test(text)
  ) {
    return true;
  }
  return false;
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
      temperature: 0.15,
      response_format: { type: 'json_object' },
      messages,
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${raw.slice(0, 500)}`);
  const data = JSON.parse(raw);
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('OpenAI response missing message content');
  }
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`OpenAI JSON parse failed: ${err.message}`);
  }
}

function validateTranslations(parsed) {
  if (!parsed || typeof parsed !== 'object') return 'root not an object';
  const bag = parsed.translations && typeof parsed.translations === 'object'
    ? parsed.translations
    : parsed;
  for (const lang of TARGET_LANGS) {
    const row = bag[lang];
    if (!row || typeof row !== 'object') return `missing language object: ${lang}`;
    if (typeof row.question !== 'string' || !row.question.trim()) {
      return `missing/empty question for ${lang}`;
    }
    if (typeof row.explanation !== 'string' || !row.explanation.trim()) {
      return `missing/empty explanation for ${lang}`;
    }
  }
  return null;
}

function extractTranslations(parsed) {
  const bag = parsed.translations && typeof parsed.translations === 'object'
    ? parsed.translations
    : parsed;
  const out = {};
  for (const lang of TARGET_LANGS) {
    out[lang] = {
      question: String(bag[lang].question).trim(),
      explanation: String(bag[lang].explanation).trim(),
    };
  }
  return out;
}

async function translateOne(apiKey, item) {
  const langList = TARGET_LANGS.map((c) => `${c} (${LANG_NAMES[c]})`).join(', ');
  const terms = FRENCH_TERMS.join('; ');
  const prompt =
    `You translate PrefAI "True or False?" daily quiz items for immigrants in France.\n` +
    `Source language: Georgian (ka).\n` +
    `Target languages: ${langList}.\n\n` +
    `Return STRICT JSON only in this shape:\n` +
    `{\n` +
    `  "translations": {\n` +
    `    "en": { "question": string, "explanation": string },\n` +
    `    "fr": { "question": string, "explanation": string },\n` +
    `    "es": { "question": string, "explanation": string },\n` +
    `    "ru": { "question": string, "explanation": string },\n` +
    `    "ar": { "question": string, "explanation": string },\n` +
    `    "bn": { "question": string, "explanation": string },\n` +
    `    "zh": { "question": string, "explanation": string },\n` +
    `    "hi": { "question": string, "explanation": string },\n` +
    `    "pt": { "question": string, "explanation": string }\n` +
    `  }\n` +
    `}\n\n` +
    `Rules:\n` +
    `- Faithful True/False wording; do not change the truth value implied by the source.\n` +
    `- Keep numbers, years, and legal thresholds exactly as in the source (do not convert calendars).\n` +
    `- For French administrative/legal proper terms with no safe equivalent, KEEP the official French ` +
    `Latin form inside the sentence (do not force-translate). Examples: ${terms}.\n` +
    `- Do not invent sources, URLs, fees, or deadlines absent from the source.\n` +
    `- Do not add the answer leaking beyond what the explanation already says.\n\n` +
    `SOURCE questionNumber: ${item.questionNumber}\n` +
    `SOURCE category: ${item.category}\n` +
    `SOURCE question (ka): ${JSON.stringify(item.question)}\n` +
    `SOURCE explanation (ka): ${JSON.stringify(item.explanation)}`;

  return openaiJson(apiKey, [
    {
      role: 'system',
      content:
        'You are a careful translator for French bureaucracy quiz content. Prefer accuracy over fluency. Reply with JSON only.',
    },
    { role: 'user', content: prompt },
  ]);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const apiKey = loadEnvKey();
  if (!apiKey) {
    console.error('OPENAI_API_KEY / EXPO_PUBLIC_OPENAI_API_KEY not found');
    process.exit(1);
  }
  if (!fs.existsSync(SEED_PATH)) {
    console.error(`Seed file missing: ${SEED_PATH}`);
    process.exit(1);
  }

  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  if (!Array.isArray(seed) || seed.length !== 90) {
    console.error(`Expected 90 seed items, got ${Array.isArray(seed) ? seed.length : typeof seed}`);
    process.exit(1);
  }

  const needsReview = [];
  const failures = [];
  const perLang = Object.fromEntries(TARGET_LANGS.map((l) => [l, { question: 0, explanation: 0 }]));
  let apiCalls = 0;
  let translatedQuestions = 0;

  console.log(`Translating ${seed.length} questions → ${TARGET_LANGS.length} langs (question+explanation)`);
  console.log(`Expected successful field writes: ${seed.length * TARGET_LANGS.length * 2}`);

  for (let i = 0; i < seed.length; i++) {
    const item = seed[i];
    const qn = item.questionNumber;
    process.stdout.write(`[${i + 1}/${seed.length}] Q${qn}… `);
    try {
      const parsed = await translateOne(apiKey, item);
      apiCalls += 1;
      const err = validateTranslations(parsed);
      if (err) {
        failures.push({
          questionNumber: qn,
          reason: `parse/validate: ${err}`,
        });
        console.log(`FAIL ${err}`);
        await sleep(400);
        continue;
      }
      const tr = extractTranslations(parsed);
      if (!item.question_i18n || typeof item.question_i18n !== 'object') item.question_i18n = {};
      if (!item.explanation_i18n || typeof item.explanation_i18n !== 'object') {
        item.explanation_i18n = {};
      }

      const qSensitive = looksSensitive(item.question);
      const eSensitive = looksSensitive(item.explanation);

      for (const lang of TARGET_LANGS) {
        item.question_i18n[lang] = tr[lang].question;
        item.explanation_i18n[lang] = tr[lang].explanation;
        perLang[lang].question += 1;
        perLang[lang].explanation += 1;

        const qFlag =
          qSensitive ||
          looksSensitive(tr[lang].question);
        const eFlag =
          eSensitive ||
          looksSensitive(tr[lang].explanation);

        if (qFlag) {
          needsReview.push({
            questionNumber: qn,
            language: lang,
            field: 'question',
            original: item.question,
            translated: tr[lang].question,
            reason: 'number/date/threshold/institution',
          });
        }
        if (eFlag) {
          needsReview.push({
            questionNumber: qn,
            language: lang,
            field: 'explanation',
            original: item.explanation,
            translated: tr[lang].explanation,
            reason: 'number/date/threshold/institution',
          });
        }
      }
      translatedQuestions += 1;
      console.log('ok');
    } catch (e) {
      apiCalls += 1;
      failures.push({
        questionNumber: qn,
        reason: e.message || String(e),
      });
      console.log(`FAIL ${e.message || e}`);
    }
    await sleep(350);
  }

  fs.writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2) + '\n', 'utf8');
  console.log(`Wrote seed with i18n: ${SEED_PATH}`);

  const report = {
    generatedAt: new Date().toISOString(),
    sourceLang: 'ka',
    targetLangs: TARGET_LANGS,
    apiCalls,
    translatedQuestions,
    expectedFieldWrites: seed.length * TARGET_LANGS.length * 2,
    actualFieldWrites: Object.values(perLang).reduce(
      (n, x) => n + x.question + x.explanation,
      0
    ),
    perLanguage: perLang,
    needsReviewCount: needsReview.length,
    needsReview,
    failures,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(`Wrote report: ${REPORT_PATH}`);
  console.log(
    `Summary: questions_ok=${translatedQuestions}/90 apiCalls=${apiCalls} fields=${report.actualFieldWrites} needsReview=${needsReview.length} failures=${failures.length}`
  );

  const mongoUri = loadMongoUri();
  if (!mongoUri) {
    console.log('MONGODB_URI not set — skipped DB upsert (seed+report only).');
    return;
  }

  const mongoose = require(path.join(WORKSPACE, 'backend', 'node_modules', 'mongoose'));
  await mongoose.connect(mongoUri);
  const DailyQuestion = require(path.join(WORKSPACE, 'backend', 'models', 'DailyQuestion'));
  let upserted = 0;
  for (const item of seed) {
    if (!item.question_i18n || !item.explanation_i18n) continue;
    const hasAny = TARGET_LANGS.some((l) => item.question_i18n[l] && item.explanation_i18n[l]);
    if (!hasAny) continue;
    await DailyQuestion.updateOne(
      { questionNumber: item.questionNumber },
      {
        $set: {
          question_i18n: item.question_i18n,
          explanation_i18n: item.explanation_i18n,
        },
      }
    );
    upserted += 1;
  }
  console.log(`Mongo updated i18n on ${upserted} documents`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
