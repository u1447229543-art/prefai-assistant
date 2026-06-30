/** Translate fr-full.json values to target language via MyMemory API. */
import fs from 'fs';

const pair = process.argv[2]; // e.g. fr|es
const outCode = process.argv[3]; // e.g. es
if (!pair || !outCode) {
  console.error('Usage: node scripts/translate-from-fr.mjs fr|es es');
  process.exit(1);
}

const fr = JSON.parse(fs.readFileSync('scripts/locale-data/fr-full.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('scripts/locale-data/en-full.json', 'utf8'));
const out = { appName: 'PrefAI Assistant' };

async function translate(text) {
  if (!text?.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 480))}&langpair=${pair}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.responseData?.translatedText || text;
}

const keys = [...new Set([...Object.keys(en), ...Object.keys(fr)])];
for (let i = 0; i < keys.length; i++) {
  const key = keys[i];
  const src = fr[key] ?? en[key];
  if (['appName', 'catCaf', 'catCpam'].includes(key) || src === 'CAF' || src === 'CPAM') {
    out[key] = en[key] ?? src;
  } else {
    out[key] = await translate(src);
    await new Promise((r) => setTimeout(r, 180));
  }
  if ((i + 1) % 25 === 0) console.log(`${outCode}: ${i + 1}/${keys.length}`);
}

fs.writeFileSync(`scripts/locale-data/${outCode}.json`, JSON.stringify(out, null, 2));
console.log(`${outCode}: ${Object.keys(out).length} keys`);
