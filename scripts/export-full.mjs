import fs from 'fs';

const src = fs.readFileSync('src/i18n/translations.ts', 'utf8');

function extractBody(name) {
  const m = src.match(new RegExp(`const ${name}\\b`));
  if (!m) return '';
  let i = src.indexOf('{', m.index);
  let depth = 0;
  const start = i + 1;
  for (i++; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      if (depth === 0) break;
      depth--;
    }
  }
  return src.slice(start, i).trim();
}

function parseBody(body) {
  const obj = {};
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const inline = line.match(/^  ([a-zA-Z0-9_]+): ('|")(.+?)\2,?$/);
    if (inline) {
      obj[inline[1]] = inline[3];
      continue;
    }
    const keyOnly = line.match(/^  ([a-zA-Z0-9_]+):$/);
    if (keyOnly) {
      const key = keyOnly[1];
      const valLine = lines[++i]?.trim() ?? '';
      const m = valLine.match(/^('|")([\s\S]*)\1,?$/);
      obj[key] = m ? m[2] : valLine;
    }
  }
  return obj;
}

const en = parseBody(extractBody('en'));
const fr = parseBody(extractBody('fr'));
const ru = parseBody(extractBody('ru'));

console.log('en', Object.keys(en).length);
console.log('fr', Object.keys(fr).length);
console.log('ru', Object.keys(ru).length);

const missingInEn = Object.keys(fr).filter((k) => !(k in en));
console.log('fr keys missing in en parse:', missingInEn);

fs.mkdirSync('scripts/locale-data', { recursive: true });
fs.writeFileSync('scripts/locale-data/en-full.json', JSON.stringify(en, null, 2));
fs.writeFileSync('scripts/locale-data/fr-full.json', JSON.stringify(fr, null, 2));
fs.writeFileSync('scripts/locale-data/ru-full.json', JSON.stringify(ru, null, 2));
