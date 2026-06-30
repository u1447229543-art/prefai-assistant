/**
 * Auto-translate en.json to locale JSON files via MyMemory API.
 * Run: node scripts/auto-translate-locales.mjs
 */
import fs from 'fs';

const LANGS = [
  { code: 'ka', pair: 'en|ka' },
  { code: 'es', pair: 'en|es' },
  { code: 'ar', pair: 'en|ar' },
  { code: 'zh', pair: 'en|zh-CN' },
  { code: 'hi', pair: 'en|hi' },
  { code: 'bn', pair: 'en|bn' },
  { code: 'pt', pair: 'en|pt-BR' },
];

const ONLY = process.argv[2];
const TARGET_LANGS = ONLY ? LANGS.filter((l) => l.code === ONLY) : LANGS;

const KEEP_LITERAL = /^(CAF|CPAM|OFII|OFPRA|ANEF|PrefAI Assistant|Préfecture|Impôts|Pôle Emploi|France Travail|GUDA|SPADA)$/i;

function parseEnBlock() {
  const src = fs.readFileSync('src/i18n/translations.ts', 'utf8');
  const re = /const en\b/;
  const m = src.match(re);
  let i = src.indexOf('{', m.index);
  let depth = 0;
  const start = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  const body = src.slice(start + 1, i - 1);
  const obj = {};
  const keyRe = /^  ([a-zA-Z0-9_]+): /gm;
  const matches = [...body.matchAll(keyRe)];
  for (let j = 0; j < matches.length; j++) {
    const key = matches[j][1];
    const vs = matches[j].index + matches[j][0].length;
    const ve = j + 1 < matches.length ? matches[j + 1].index : body.length;
    let raw = body.slice(vs, ve).trim();
    if (raw.endsWith(',')) raw = raw.slice(0, -1).trim();
    if (raw.startsWith("'") && raw.endsWith("'")) obj[key] = raw.slice(1, -1).replace(/\\'/g, "'");
    else if (raw.startsWith('"') && raw.endsWith('"')) obj[key] = raw.slice(1, -1).replace(/\\"/g, '"');
    else obj[key] = raw;
  }
  return obj;
}

async function translate(text, pair) {
  if (!text || text.length < 2) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${pair}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseStatus !== 200) return text;
  return data.responseData.translatedText || text;
}

function preserveTerms(text) {
  return text
    .replace(/\bCAF\b/g, 'CAF')
    .replace(/\bCPAM\b/g, 'CPAM')
    .replace(/\bOFII\b/g, 'OFII')
    .replace(/\bOFPRA\b/g, 'OFPRA')
    .replace(/\bANEF\b/g, 'ANEF')
    .replace(/Préfecture/g, 'Préfecture')
    .replace(/Impôts/g, 'Impôts');
}

async function buildLang(code, pair, en) {
  const out = {};
  const keys = Object.keys(en);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = en[key];
    if (key === 'appName' || KEEP_LITERAL.test(val)) {
      out[key] = val;
    } else {
      out[key] = preserveTerms(await translate(val, pair));
      await new Promise((r) => setTimeout(r, 200));
    }
    if ((i + 1) % 20 === 0) console.log(`  ${code}: ${i + 1}/${keys.length}`);
  }
  return out;
}

const en = parseEnBlock();
console.log('English keys:', Object.keys(en).length);
fs.mkdirSync('scripts/locale-data', { recursive: true });
fs.writeFileSync('scripts/locale-data/en.json', JSON.stringify(en, null, 2));

for (const { code, pair } of TARGET_LANGS) {
  console.log(`Translating ${code}...`);
  const data = await buildLang(code, pair, en);
  fs.writeFileSync(`scripts/locale-data/${code}.json`, JSON.stringify(data, null, 2));
  console.log(`${code}: done (${Object.keys(data).length} keys)`);
}

console.log('Run: node scripts/build-locales.mjs');
