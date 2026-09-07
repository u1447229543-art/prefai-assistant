import type { Answers, BenefitResult } from '../constants/eligibility';
import type { JourneyId } from '../constants/journeys';
import { MES_AIDES_BENEFITS as RAW_BENEFITS } from '../data/mesAidesBenefits';

/** Slim catalog row (synced from Mes Aides /api/benefits). */
export type MesAidesCondition = {
  type: string;
  operator?: string;
  value?: number | string | boolean;
  values?: string[];
};

export type MesAidesBenefit = {
  id: string;
  slug: string;
  label: string;
  description: string;
  institution?: string;
  link?: string;
  amount?: number;
  unit?: string;
  periodicite?: string;
  source: 'javascript' | 'openfisca';
  conditions: MesAidesCondition[];
};

export const MES_AIDES_BENEFITS = RAW_BENEFITS as unknown as MesAidesBenefit[];

/** Age bracket → inclusive [min, max] for conservative matching. */
const AGE_BRACKETS: Record<string, [number, number]> = {
  under18: [0, 17],
  '18to25': [18, 25],
  '26to35': [26, 35],
  '36to50': [36, 50],
  over50: [51, 120],
};

/**
 * Catalog aids that overlap our built-in benefit ids — skip when builtin already matched.
 * Patterns match slug or label (lowercase).
 */
const DEDUPE_PATTERNS: { builtinId: string; patterns: RegExp[] }[] = [
  { builtinId: 'rsa', patterns: [/\brsa\b/, /revenu.de.solidarite/] },
  { builtinId: 'apl', patterns: [/\bapl\b/, /aide.personnalisee.au.logement/, /aide_logement/] },
  { builtinId: 'prime', patterns: [/prime.d.?activite/, /\bppa\b/] },
  { builtinId: 'css', patterns: [/\bcss\b/, /complementaire.sante.solidaire/, /cmu/] },
  { builtinId: 'ada', patterns: [/\bada\b/, /allocation.pour.demandeur/] },
  { builtinId: 'caf', patterns: [/^caf$/, /caisse.d.?allocations.familiales/] },
  { builtinId: 'cpam', patterns: [/\bcpam\b/, /\bameli\b/, /assurance.maladie/] },
  { builtinId: 'crous', patterns: [/\bcrous\b/] },
  { builtinId: 'francetravail', patterns: [/france.travail/, /pole.emploi/, /pôle.emploi/] },
];

const MAX_CATALOG_RESULTS = 12;

function agePasses(condition: MesAidesCondition, ageId: string | undefined): boolean {
  if (!ageId || !AGE_BRACKETS[ageId]) return false;
  const [lo, hi] = AGE_BRACKETS[ageId];
  const raw = condition.value;
  const threshold = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(threshold)) return false;
  const op = condition.operator || '>=';
  // Entire bracket must satisfy the inequality (conservative).
  if (op === '>=' || op === '>') return lo >= threshold;
  if (op === '<=' || op === '<') return hi <= threshold;
  if (op === '=' || op === '==' || op === '===' || op === 'egal' || op === 'égal') {
    return lo <= threshold && threshold <= hi;
  }
  return false;
}

function departmentPasses(condition: MesAidesCondition, departmentCode: string | undefined): boolean {
  if (!departmentCode || departmentCode === 'skip') return false;
  const values = Array.isArray(condition.values) ? condition.values.map(String) : [];
  if (values.length === 0 && condition.value != null) values.push(String(condition.value));
  const normalized = departmentCode.replace(/^0+/, '') || departmentCode;
  return values.some((v) => {
    const code = String(v).replace(/^0+/, '') || String(v);
    return code === normalized || String(v) === departmentCode;
  });
}

function conditionsPass(benefit: MesAidesBenefit, answers: Answers): boolean {
  const conditions = benefit.conditions || [];
  if (conditions.length === 0) return false;
  for (const c of conditions) {
    if (c.type === 'age') {
      if (!agePasses(c, answers.age)) return false;
    } else if (c.type === 'departements') {
      if (!departmentPasses(c, answers.department)) return false;
    } else {
      return false;
    }
  }
  return true;
}

function overlapsBuiltin(benefit: MesAidesBenefit, builtinIds: Set<string>): boolean {
  const hay = `${benefit.slug} ${benefit.label}`.toLowerCase();
  for (const row of DEDUPE_PATTERNS) {
    if (!builtinIds.has(row.builtinId)) continue;
    if (row.patterns.some((re) => re.test(hay))) return true;
  }
  return false;
}

function guessJourney(benefit: MesAidesBenefit): JourneyId | undefined {
  const hay = `${benefit.slug} ${benefit.label} ${benefit.institution || ''}`.toLowerCase();
  if (/asile|ofpra|ofii|\bada\b/.test(hay)) return 'asylum';
  if (/crous|etudiant|étudiant|bourse/.test(hay)) return 'student';
  if (/travail|emploi|france.travail|pole.emploi|activité|activite/.test(hay)) return 'work';
  if (/santé|sante|cpam|ameli|css|mutuelle/.test(hay)) return 'health';
  if (/caf|logement|apl|rsa|famille/.test(hay)) return 'caf';
  return undefined;
}

function formatEstimate(benefit: MesAidesBenefit): string | undefined {
  if (typeof benefit.amount !== 'number') return undefined;
  const unit = benefit.unit === '€' || !benefit.unit ? '€' : benefit.unit;
  const period =
    benefit.periodicite === 'mensuelle'
      ? '/month'
      : benefit.periodicite === 'annuelle'
        ? '/year'
        : benefit.periodicite === 'ponctuelle'
          ? ''
          : benefit.periodicite
            ? ` (${benefit.periodicite})`
            : '';
  return `≈ ${benefit.amount} ${unit}${period}`.trim();
}

/**
 * Match synced Mes Aides catalog rows against quiz answers.
 * Additive only — caller merges with built-in evaluateEligibility results.
 */
export function matchMesAidesBenefits(
  answers: Answers,
  builtinResults: BenefitResult[] = []
): BenefitResult[] {
  const builtinIds = new Set(builtinResults.map((r) => r.id));
  const out: BenefitResult[] = [];

  for (const benefit of MES_AIDES_BENEFITS) {
    if (out.length >= MAX_CATALOG_RESULTS) break;
    if (!conditionsPass(benefit, answers)) continue;
    if (overlapsBuiltin(benefit, builtinIds)) continue;

    const institution = benefit.institution ? `${benefit.institution}: ` : '';
    const explanation =
      benefit.description ||
      `${institution}Listed in the Mes Aides / 1jeune1solution catalog. Verify with the issuing authority.`;

    out.push({
      id: `mes-aides:${benefit.slug}`,
      emoji: '📋',
      displayName: benefit.label,
      displayExplanation: explanation,
      displayEstimate: formatEstimate(benefit),
      sourceUrl: benefit.link,
      journeyId: guessJourney(benefit),
    });
  }

  return out;
}
