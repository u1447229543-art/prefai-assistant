/**
 * Builds complete locale modules from JSON data files.
 * Run: node scripts/build-locales.mjs
 */
import fs from 'fs';
import path from 'path';

const LOCALES = ['ka', 'es', 'ar', 'zh', 'hi', 'bn', 'pt'];
const outDir = path.join('src', 'i18n', 'locales');
const dataDir = path.join('scripts', 'locale-data');

fs.mkdirSync(outDir, { recursive: true });

for (const lang of LOCALES) {
  const dataPath = path.join(dataDir, `${lang}.json`);
  if (!fs.existsSync(dataPath)) {
    console.error(`Missing ${dataPath}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const keys = Object.keys(data);
  const lines = keys.map((k) => {
    const v = data[k].replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `  ${k}: '${v}',`;
  });
  const content = `/** Auto-generated — ${keys.length} keys */\nexport const ${lang}: Record<string, string> = {\n${lines.join('\n')}\n};\n`;
  fs.writeFileSync(path.join(outDir, `${lang}.ts`), content);
  console.log(`${lang}: ${keys.length} keys`);
}
