const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory() && !f.includes('node_modules') && f !== '.git') walk(p, files);
    else if (/\.(tsx|ts)$/.test(f)) files.push(p);
  }
  return files;
}

const trans = fs.readFileSync(path.join(ROOT, 'src/i18n/translations.ts'), 'utf8');
const keyMatch = trans.match(/export type TranslationKey =([\s\S]*?);/);
const masterKeys = new Set();
if (keyMatch) {
  for (const m of keyMatch[1].matchAll(/'([^']+)'/g)) masterKeys.add(m[1]);
}

const enMatch = trans.match(/const en: Record<TranslationKey, string> = \{([\s\S]*?)\n\};/);
const enKeys = new Set();
if (enMatch) {
  for (const m of enMatch[1].matchAll(/^\s*([a-zA-Z0-9_]+):/gm)) enKeys.add(m[1]);
}

const frMatch = trans.match(/const fr: Record<TranslationKey, string> = \{([\s\S]*?)\n\};/);
const frKeys = new Set();
if (frMatch) {
  for (const m of frMatch[1].matchAll(/^\s*([a-zA-Z0-9_]+):/gm)) frKeys.add(m[1]);
}

console.log('MASTER_KEYS', masterKeys.size);
console.log('EN_KEYS', enKeys.size);
console.log('FR_KEYS', frKeys.size);

const files = walk(path.join(ROOT, 'src'));
const usedKeys = new Map();
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/\bt\(\s*['"]([^'"]+)['"]\s*[,)]/g)) {
      const k = m[1];
      if (!usedKeys.has(k)) usedKeys.set(k, []);
      usedKeys.get(k).push({ file: path.relative(ROOT, file).replace(/\\/g, '/'), line: i + 1 });
    }
  });
}

const missing = [...usedKeys.keys()].filter((k) => !masterKeys.has(k)).sort();
console.log('\n=== MISSING FROM TranslationKey (used via t()) ===');
for (const k of missing) {
  for (const loc of usedKeys.get(k)) {
    console.log(`${k} | ${loc.file}:${loc.line}`);
  }
}
console.log('MISSING_COUNT', missing.length);

const missingEn = [...masterKeys].filter((k) => !enKeys.has(k));
const missingFr = [...masterKeys].filter((k) => !frKeys.has(k));
console.log('\n=== IN TYPE BUT NOT IN EN ===', missingEn.join(', ') || '(none)');
console.log('=== IN TYPE BUT NOT IN FR ===', missingFr.join(', ') || '(none)');

// Scan screens + components for likely hardcoded UI strings in JSX text / placeholders / Alert / title=
const SCAN_DIRS = [
  path.join(ROOT, 'src/screens'),
  path.join(ROOT, 'src/components'),
];

const IGNORE_LINE =
  /StyleSheet|fontWeight|fontSize|flexDirection|alignItems|justifyContent|backgroundColor|borderColor|color:\s|import |from '|require\(|glyphMap|RouteProp|keyof|type |interface |export |console\.|\/\/|\/\*|\* |Platform\.|Dimensions|StatusBar|Keyboard|SafeArea|LinearGradient|Ionicons\.|name=\{|name:\s*'[a-z-]+'|variant=|animationType|keyboardType|returnKeyType|autoCapitalize|autoCorrect|secureTextEntry|numberOfLines|hitSlop|edges=|testID|accessibility/;

const STRING_RE =
  /(?<![.\w])(?:title|subtitle|placeholder|label|text|message|heading|description|emptyText|confirmText|cancelText)\s*=\s*['"`]([^'"`]{2,})['"`]/g;
const JSX_TEXT_RE = />\s*([A-Za-zÀ-ÿ][^<{]{1,120}?)\s*</g;
const ALERT_RE = /Alert\.alert\(\s*['"`]([^'"`]+)['"`]/g;
const SET_ERROR_RE = /set(?:Error|UploadError|SaveError|LocError|Msg)\(\s*['"`]([^'"`]{3,})['"`]/g;
const QUOTED_UI_RE =
  /['"`]((?:[A-ZÀ-Ÿ][^'"`]{4,80})|(?:What if|Couldn't|No exact|e\.g\.|Type your|Select |Delete |Search |Month|Year|Day|MOST POPULAR|Current Plan|Translation unavailable|Session expired|AI Reply|The server|live map|general info|Open in|Couldn't reach|Select day|Select month|Select year|January|February|March|April|May|June|July|August|September|October|November|December)[^'"`]*)['"`]/g;

console.log('\n=== HARDCODED CANDIDATES (screens + components) ===');
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (IGNORE_LINE.test(line)) return;
      if (/t\(['"]/.test(line) && !/['"`][A-Za-z][^'"`]{8,}['"`]/.test(line.replace(/t\(['"][^'"]+['"]\)/g, ''))) {
        // mostly translated — still check leftover hardcoded
      }
      const hits = [];
      let m;
      const patterns = [STRING_RE, ALERT_RE, SET_ERROR_RE];
      for (const re of patterns) {
        re.lastIndex = 0;
        while ((m = re.exec(line))) hits.push(m[1]);
      }
      // JSX children text on same line
      JSX_TEXT_RE.lastIndex = 0;
      while ((m = JSX_TEXT_RE.exec(line))) {
        const t = m[1].trim();
        if (t && !/^\{/.test(t) && /[A-Za-zÀ-ÿ]/.test(t) && t.length > 1) hits.push(t);
      }
      // Additional quoted English/French UI strings (heuristic)
      if (
        /Text|placeholder|Alert|setError|title=|subtitle=|NeonButton|Header|EmptyState|SectionLabel|label:/.test(
          line
        ) ||
        /['"`](What if|Couldn't|e\.g\.|Type your|Select |Delete "|Search |Month|Year|Translation unavailable|Session expired)/.test(
          line
        )
      ) {
        QUOTED_UI_RE.lastIndex = 0;
        while ((m = QUOTED_UI_RE.exec(line))) {
          const s = m[1];
          if (
            /^(flex|row|column|center|absolute|relative|contain|cover|bold|normal|none|auto|hidden|visible|transparent|white|black|sm|md|lg|xl|top|bottom|left|right|slide|fade|cancel|destructive|ghost|blue|red)/i.test(
              s
            )
          )
            continue;
          if (/^[a-z]+(-[a-z]+)+$/.test(s)) continue; // icon names
          if (/^#[0-9A-Fa-f]/.test(s)) continue;
          if (/^rgba?\(/.test(s)) continue;
          if (/^https?:/.test(s)) continue;
          if (/^\d/.test(s)) continue;
          hits.push(s);
        }
      }
      const uniq = [...new Set(hits)].filter((h) => h && !/^\$\{/.test(h));
      for (const h of uniq) {
        // skip if the only string on line is a t() key
        if (/^[a-z][a-zA-Z0-9]*$/.test(h) && masterKeys.has(h)) continue;
        console.log(`${rel}:${i + 1} | ${JSON.stringify(h)}`);
      }
    });
  }
}

// Journey titles count
const journeys = fs.readFileSync(path.join(ROOT, 'src/constants/journeys.ts'), 'utf8');
const journeyTitles = [...journeys.matchAll(/^\s+title:\s*'([^']+)'/gm)].map((m) => m[1]);
console.log('\n=== JOURNEY title: COUNT', journeyTitles.length);
console.log('Sample titles:', journeyTitles.slice(0, 8).join(' | '));

// Eligibility
const eligPath = path.join(ROOT, 'src/constants/eligibility.ts');
if (fs.existsSync(eligPath)) {
  const elig = fs.readFileSync(eligPath, 'utf8');
  const q = [...elig.matchAll(/question:\s*'([^']+)'/g)].map((m) => m[1]);
  const labels = [...elig.matchAll(/label:\s*'([^']+)'/g)].map((m) => m[1]);
  console.log('\n=== ELIGIBILITY questions:', q.length);
  q.forEach((s, i) => console.log(`Q${i + 1}: ${s}`));
  console.log('option labels sample:', labels.slice(0, 10).join(' | '));
  const disc = elig.match(/ELIGIBILITY_DISCLAIMER\s*=\s*'([^']+)'/);
  if (disc) console.log('DISCLAIMER:', disc[1].slice(0, 120));
}
