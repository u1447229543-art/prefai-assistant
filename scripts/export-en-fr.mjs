import fs from 'fs';

const src = fs.readFileSync('src/i18n/translations.ts', 'utf8');

function extractBlock(name) {
  const re = new RegExp(`const ${name}\\b`);
  const m = src.match(re);
  if (!m) return null;
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
  return src.slice(start + 1, i - 1);
}

function parseBlock(body) {
  const obj = {};
  const keyRe = /^  ([a-zA-Z0-9_]+): /gm;
  const matches = [...body.matchAll(keyRe)];
  for (let i = 0; i < matches.length; i++) {
    const key = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : body.length;
    let raw = body.slice(start, end).trim();
    if (raw.endsWith(',')) raw = raw.slice(0, -1).trim();
    if (raw.startsWith("'") && raw.endsWith("'")) obj[key] = raw.slice(1, -1).replace(/\\'/g, "'");
    else if (raw.startsWith('"') && raw.endsWith('"')) obj[key] = raw.slice(1, -1).replace(/\\"/g, '"');
    else obj[key] = raw;
  }
  return obj;
}

const langs = ['en', 'fr', 'ru'];
fs.mkdirSync('scripts/locale-data', { recursive: true });
for (const lang of langs) {
  const body = extractBlock(lang);
  const obj = parseBlock(body);
  fs.writeFileSync(`scripts/locale-data/${lang}.json`, JSON.stringify(obj, null, 2));
  console.log(`${lang}: ${Object.keys(obj).length} keys`);
}
