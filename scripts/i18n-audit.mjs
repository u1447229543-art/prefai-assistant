import fs from 'fs';

const src = fs.readFileSync('src/i18n/translations.ts', 'utf8');

function extractBlock(name) {
  const re = new RegExp(`const ${name}\\b`);
  const m = src.match(re);
  if (!m) return {};
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
  const block = src.slice(start, i);
  const keys = {};
  const keyRe = /^  ([a-zA-Z0-9_]+):/gm;
  let km;
  while ((km = keyRe.exec(block))) keys[km[1]] = true;
  return keys;
}

function getEnValue(key) {
  const re = new RegExp(`^  ${key}: (.+?),\\r?\\n`, 'm');
  const m = src.match(re);
  if (!m) return '';
  let v = m[1].trim();
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  return v.slice(0, 80);
}

const en = extractBlock('en');
const langs = ['fr', 'es', 'ru', 'ar', 'ka', 'bn', 'zh', 'hi', 'pt'];
const enKeys = Object.keys(en).sort();

console.log('=== src/i18n FILES ===');
console.log('translations.ts  — main dictionary (all languages in one file)');
console.log('helpers.ts       — greetingKey(), getTaskTitle(), getCategoryLabel()');
console.log('');
console.log('Fallback: missing keys fall back to English via AppContext t()');
console.log('');
console.log(`English keys total: ${enKeys.length}`);
console.log('');

const summary = [];
for (const lang of langs) {
  const dict = extractBlock(lang);
  const missing = enKeys.filter((k) => !dict[k]);
  summary.push({ lang, missing, missingKeys: missing });
  const pct = (((enKeys.length - missing.length) / enKeys.length) * 100).toFixed(1);
  console.log(
    `${lang.toUpperCase().padEnd(3)}: ${String(enKeys.length - missing.length).padStart(3)}/${enKeys.length}  (${pct}% complete)  missing: ${missing.length}`
  );
}

console.log('\n=== ALL ENGLISH KEYS ===');
enKeys.forEach((k, i) => console.log(`${String(i + 1).padStart(3)}. ${k}`));

for (const { lang, missing, missingKeys } of summary) {
  console.log(`\n=== ${lang.toUpperCase()} — MISSING (${missing.length}) ===`);
  if (missing === 0) {
    console.log('(none — 100% complete)');
    continue;
  }
  const dict = extractBlock(lang);
  const have = enKeys.filter((k) => dict[k]);
  console.log(`Present (${have.length}): ${have.join(', ')}`);
  for (const k of missingKeys) {
    console.log(`  ${k}  →  "${getEnValue(k)}"`);
  }
}
