import { JourneyId } from './journeys';
import type { TranslationKey } from '../i18n/translations';

/**
 * Eligibility Checker data + scoring.
 *
 * IMPORTANT: this is a guidance tool only. The rules below are intentionally
 * simple, general criteria — they are NOT an official eligibility decision.
 *
 * All user-facing copy is stored as TranslationKey values and resolved via t().
 */

export interface EligOption {
  id: string;
  labelKey: TranslationKey;
}

export interface EligQuestion {
  id: string;
  questionKey: TranslationKey;
  options: EligOption[];
}

export type Answers = Record<string, string>;

export const QUESTIONS: EligQuestion[] = [
  {
    id: 'status',
    questionKey: 'eligQStatus',
    options: [
      { id: 'asylum', labelKey: 'eligOptAsylum' },
      { id: 'student', labelKey: 'eligOptStudent' },
      { id: 'worker', labelKey: 'eligOptWorker' },
      { id: 'jobseeker', labelKey: 'eligOptJobseeker' },
      { id: 'family', labelKey: 'eligOptFamilyReunification' },
      { id: 'other', labelKey: 'eligOptOther' },
    ],
  },
  {
    id: 'duration',
    questionKey: 'eligQDuration',
    options: [
      { id: 'lt3', labelKey: 'eligOptLt3' },
      { id: '3to6', labelKey: 'eligOpt3to6' },
      { id: '6to12', labelKey: 'eligOpt6to12' },
      { id: 'gt12', labelKey: 'eligOptGt12' },
    ],
  },
  {
    id: 'permit',
    questionKey: 'eligQPermit',
    options: [
      { id: 'valid', labelKey: 'eligOptPermitValid' },
      { id: 'expired', labelKey: 'eligOptPermitExpired' },
      { id: 'no', labelKey: 'eligOptNo' },
      { id: 'inprocess', labelKey: 'eligOptInProcess' },
    ],
  },
  {
    id: 'housing',
    questionKey: 'eligQHousing',
    options: [
      { id: 'renting', labelKey: 'eligOptRenting' },
      { id: 'social', labelKey: 'eligOptSocialHousing' },
      { id: 'family', labelKey: 'eligOptWithFamily' },
      { id: 'temporary', labelKey: 'eligOptTemporary' },
      { id: 'nofixed', labelKey: 'eligOptNoFixed' },
    ],
  },
  {
    id: 'paysRent',
    questionKey: 'eligQPaysRent',
    options: [
      { id: 'yes', labelKey: 'eligOptYes' },
      { id: 'no', labelKey: 'eligOptNo' },
    ],
  },
  {
    id: 'work',
    questionKey: 'eligQWork',
    options: [
      { id: 'fulltime', labelKey: 'eligOptFulltime' },
      { id: 'parttime', labelKey: 'eligOptParttime' },
      { id: 'no', labelKey: 'eligOptNo' },
      { id: 'studentjob', labelKey: 'eligOptStudentJob' },
    ],
  },
  {
    id: 'income',
    questionKey: 'eligQIncome',
    options: [
      { id: '0', labelKey: 'eligOptIncome0' },
      { id: 'under500', labelKey: 'eligOptUnder500' },
      { id: '500to1000', labelKey: 'eligOpt500to1000' },
      { id: '1000to1500', labelKey: 'eligOpt1000to1500' },
      { id: 'over1500', labelKey: 'eligOptOver1500' },
    ],
  },
  {
    id: 'children',
    questionKey: 'eligQChildren',
    options: [
      { id: '0', labelKey: 'eligOptNo' },
      { id: '1', labelKey: 'eligOptChild1' },
      { id: '2', labelKey: 'eligOptChild2' },
      { id: '3plus', labelKey: 'eligOptChild3plus' },
    ],
  },
  {
    id: 'enrolled',
    questionKey: 'eligQEnrolled',
    options: [
      { id: 'yes', labelKey: 'eligOptYes' },
      { id: 'no', labelKey: 'eligOptNo' },
    ],
  },
  {
    id: 'health',
    questionKey: 'eligQHealth',
    options: [
      { id: 'yes', labelKey: 'eligOptYes' },
      { id: 'no', labelKey: 'eligOptNo' },
      { id: 'inprocess', labelKey: 'eligOptInProcess' },
    ],
  },
  {
    id: 'age',
    questionKey: 'eligQAge',
    options: [
      { id: 'under18', labelKey: 'eligOptUnder18' },
      { id: '18to25', labelKey: 'eligOpt18to25' },
      { id: '26to35', labelKey: 'eligOpt26to35' },
      { id: '36to50', labelKey: 'eligOpt36to50' },
      { id: 'over50', labelKey: 'eligOptOver50' },
    ],
  },
];

export interface BenefitResult {
  id: string;
  nameKey: TranslationKey;
  emoji: string;
  explanationKey: TranslationKey;
  estimateKey?: TranslationKey;
  journeyId: JourneyId;
}

/**
 * Evaluate which benefits the user may qualify for, based on general criteria.
 * Returns translation keys — resolve with t() in the UI.
 */
export function evaluateEligibility(a: Answers): BenefitResult[] {
  const under18 = a.age === 'under18';
  /** Pays rent/contribution, or already in private/social rental. */
  const paysOwnRent =
    a.paysRent === 'yes' || a.housing === 'renting' || a.housing === 'social';
  /**
   * Independent enough for adult income top-ups (not a pure dependent
   * living with family/friends without contributing to housing costs).
   */
  const independentForIncomeAids =
    paysOwnRent || a.housing === 'temporary' || a.housing === 'nofixed';

  const lowIncome = ['0', 'under500', '500to1000', '1000to1500'].includes(a.income);
  const veryLowIncome = ['0', 'under500', '500to1000'].includes(a.income);
  const inFrance3plus = a.duration !== 'lt3';
  const legalStatus = a.permit === 'valid' || a.permit === 'inprocess';
  const working = ['fulltime', 'parttime', 'studentjob'].includes(a.work);
  const over25 = ['26to35', '36to50', 'over50'].includes(a.age);
  const isStudent = a.status === 'student' || a.enrolled === 'yes';
  const hasChildren = a.children !== '0' && a.children !== undefined;
  const familyPath = a.status === 'family' || hasChildren;

  const results: BenefitResult[] = [];

  if (a.status === 'asylum') {
    results.push({
      id: 'ada',
      nameKey: 'eligAdaName',
      emoji: '🛡️',
      explanationKey: 'eligAdaExplain',
      estimateKey: 'eligAdaEstimate',
      journeyId: 'asylum',
    });
  }

  // Family-aid path (uses unused family status + children). Does not require rent.
  if (familyPath && legalStatus) {
    results.push({
      id: 'caf',
      nameKey: 'eligCafName',
      emoji: '🏠',
      explanationKey: hasChildren
        ? 'eligCafExplainWithChildren'
        : a.status === 'family'
          ? 'eligCafExplainFamily'
          : 'eligCafExplainNoChildren',
      estimateKey: 'eligCafEstimate',
      journeyId: 'caf',
    });
  } else if (paysOwnRent && lowIncome && legalStatus && !under18) {
    // Housing-oriented CAF when not already on the family path
    results.push({
      id: 'caf',
      nameKey: 'eligCafName',
      emoji: '🏠',
      explanationKey: 'eligCafExplainNoChildren',
      estimateKey: 'eligCafEstimate',
      journeyId: 'caf',
    });
  }

  // APL — gated on legalStatus + actually paying rent/contribution
  if (paysOwnRent && lowIncome && legalStatus && !under18) {
    results.push({
      id: 'apl',
      nameKey: 'eligAplName',
      emoji: '🏡',
      explanationKey: 'eligAplExplain',
      estimateKey: 'eligAplEstimate',
      journeyId: 'caf',
    });
  }

  // Prime d’activité — adults only; skip pure dependents not paying housing costs
  if (working && lowIncome && independentForIncomeAids) {
    if (under18) {
      results.push({
        id: 'minor-work',
        nameKey: 'eligMinorWorkName',
        emoji: '👤',
        explanationKey: 'eligMinorWorkExplain',
        journeyId: 'work',
      });
    } else {
      results.push({
        id: 'prime',
        nameKey: 'eligPrimeName',
        emoji: '💼',
        explanationKey: 'eligPrimeExplain',
        estimateKey: 'eligPrimeEstimate',
        journeyId: 'work',
      });
    }
  }

  // RSA — permit valid OR in process (récépissé); still guidance-only
  if (
    over25 &&
    veryLowIncome &&
    legalStatus &&
    a.duration === 'gt12' &&
    independentForIncomeAids
  ) {
    results.push({
      id: 'rsa',
      nameKey: 'eligRsaName',
      emoji: '💶',
      explanationKey: 'eligRsaExplain',
      estimateKey: 'eligRsaEstimate',
      journeyId: 'caf',
    });
  }

  // CSS — adult complementary cover; minors get guardian-oriented alternative
  if (veryLowIncome && inFrance3plus) {
    if (under18) {
      results.push({
        id: 'minor-health',
        nameKey: 'eligMinorHealthName',
        emoji: '🩺',
        explanationKey: 'eligMinorHealthExplain',
        journeyId: 'health',
      });
    } else {
      results.push({
        id: 'css',
        nameKey: 'eligCssName',
        emoji: '🩺',
        explanationKey: 'eligCssExplain',
        estimateKey: 'eligCssEstimate',
        journeyId: 'health',
      });
    }
  }

  if (a.health !== 'yes' && inFrance3plus) {
    results.push({
      id: 'cpam',
      nameKey: 'eligCpamName',
      emoji: '🏥',
      explanationKey: 'eligCpamExplain',
      journeyId: 'health',
    });
  }

  // CROUS — adults/students 18+; minors get school/guardian alternative
  if (isStudent) {
    if (under18) {
      results.push({
        id: 'minor-education',
        nameKey: 'eligMinorEducationName',
        emoji: '🎓',
        explanationKey: 'eligMinorEducationExplain',
        journeyId: 'student',
      });
    } else {
      results.push({
        id: 'crous',
        nameKey: 'eligCrousName',
        emoji: '🎓',
        explanationKey: 'eligCrousExplain',
        estimateKey: 'eligCrousEstimate',
        journeyId: 'student',
      });
    }
  }

  if (a.status === 'jobseeker' && legalStatus && !under18) {
    results.push({
      id: 'francetravail',
      nameKey: 'eligFtName',
      emoji: '🔎',
      explanationKey: 'eligFtExplain',
      journeyId: 'work',
    });
  }

  return results;
}

/** @deprecated Use t('eligibilityDisclaimer') */
export const ELIGIBILITY_DISCLAIMER_KEY: TranslationKey = 'eligibilityDisclaimer';
