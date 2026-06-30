import { JourneyId } from './journeys';

/**
 * Eligibility Checker data + scoring.
 *
 * IMPORTANT: this is a guidance tool only. The rules below are intentionally
 * simple, general criteria — they are NOT an official eligibility decision.
 */

export interface EligOption {
  id: string;
  label: string;
}

export interface EligQuestion {
  id: string;
  question: string;
  options: EligOption[];
}

export type Answers = Record<string, string>;

export const QUESTIONS: EligQuestion[] = [
  {
    id: 'status',
    question: 'What is your current status in France?',
    options: [
      { id: 'asylum', label: 'Asylum seeker' },
      { id: 'student', label: 'Student' },
      { id: 'worker', label: 'Worker' },
      { id: 'jobseeker', label: 'Job seeker' },
      { id: 'family', label: 'Family reunification' },
      { id: 'other', label: 'Other' },
    ],
  },
  {
    id: 'duration',
    question: 'How long have you been in France?',
    options: [
      { id: 'lt3', label: 'Less than 3 months' },
      { id: '3to6', label: '3–6 months' },
      { id: '6to12', label: '6–12 months' },
      { id: 'gt12', label: 'More than 1 year' },
    ],
  },
  {
    id: 'permit',
    question: 'Do you have a valid residence permit or visa?',
    options: [
      { id: 'valid', label: 'Yes — valid' },
      { id: 'expired', label: 'Yes — expired' },
      { id: 'no', label: 'No' },
      { id: 'inprocess', label: 'In process' },
    ],
  },
  {
    id: 'housing',
    question: 'What is your current housing situation?',
    options: [
      { id: 'renting', label: 'Renting (private)' },
      { id: 'social', label: 'Social housing' },
      { id: 'family', label: 'With family / friends' },
      { id: 'temporary', label: 'Temporary accommodation' },
      { id: 'nofixed', label: 'No fixed address' },
    ],
  },
  {
    id: 'work',
    question: 'Do you currently work in France?',
    options: [
      { id: 'fulltime', label: 'Yes — full-time' },
      { id: 'parttime', label: 'Yes — part-time' },
      { id: 'no', label: 'No' },
      { id: 'studentjob', label: 'Student job' },
    ],
  },
  {
    id: 'income',
    question: 'What is your approximate monthly income?',
    options: [
      { id: '0', label: '0 €' },
      { id: 'under500', label: 'Under 500 €' },
      { id: '500to1000', label: '500 – 1000 €' },
      { id: '1000to1500', label: '1000 – 1500 €' },
      { id: 'over1500', label: 'Over 1500 €' },
    ],
  },
  {
    id: 'children',
    question: 'Do you have children or dependents?',
    options: [
      { id: '0', label: 'No' },
      { id: '1', label: '1 child' },
      { id: '2', label: '2 children' },
      { id: '3plus', label: '3 or more children' },
    ],
  },
  {
    id: 'enrolled',
    question: 'Are you enrolled in a French university or school?',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
  },
  {
    id: 'health',
    question: 'Do you have French health insurance (Ameli / CPAM)?',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
      { id: 'inprocess', label: 'In process' },
    ],
  },
  {
    id: 'age',
    question: 'What is your age?',
    options: [
      { id: 'under18', label: 'Under 18' },
      { id: '18to25', label: '18 – 25' },
      { id: '26to35', label: '26 – 35' },
      { id: '36to50', label: '36 – 50' },
      { id: 'over50', label: 'Over 50' },
    ],
  },
];

export interface BenefitResult {
  id: string;
  name: string;
  emoji: string;
  explanation: string;
  estimate?: string;
  journeyId: JourneyId;
}

/**
 * Evaluate which benefits the user may qualify for, based on general criteria.
 */
export function evaluateEligibility(a: Answers): BenefitResult[] {
  const renting = a.housing === 'renting' || a.housing === 'social';
  const lowIncome = ['0', 'under500', '500to1000', '1000to1500'].includes(a.income);
  const veryLowIncome = ['0', 'under500', '500to1000'].includes(a.income);
  const inFrance3plus = a.duration !== 'lt3';
  const legalStatus = a.permit === 'valid' || a.permit === 'inprocess';
  const validPermit = a.permit === 'valid';
  const working = ['fulltime', 'parttime', 'studentjob'].includes(a.work);
  const over25 = ['26to35', '36to50', 'over50'].includes(a.age);
  const isStudent = a.status === 'student' || a.enrolled === 'yes';
  const hasChildren = a.children !== '0' && a.children !== undefined;

  const results: BenefitResult[] = [];

  // ADA — asylum seekers
  if (a.status === 'asylum') {
    results.push({
      id: 'ada',
      name: 'ADA — Allocation pour Demandeurs d’Asile',
      emoji: '🛡️',
      explanation: 'Financial support while your asylum request is being processed.',
      estimate: '≈ 6.80 €/day + housing supplement',
      journeyId: 'asylum',
    });
  }

  // CAF — family / housing benefits for low-income renters
  if (renting && lowIncome) {
    results.push({
      id: 'caf',
      name: 'CAF — Caisse d’Allocations Familiales',
      emoji: '🏠',
      explanation: hasChildren
        ? 'Family and housing benefits for low-income households with children.'
        : 'Housing and social benefits for low-income households.',
      estimate: 'Varies with income & family size',
      journeyId: 'caf',
    });
  }

  // APL — housing aid
  if (renting && lowIncome && legalStatus) {
    results.push({
      id: 'apl',
      name: 'APL — Aide Personnalisée au Logement',
      emoji: '🏡',
      explanation: 'Monthly help to reduce your rent, paid through CAF.',
      estimate: '≈ 100 – 300 €/month',
      journeyId: 'caf',
    });
  }

  // Prime d'Activité — working low-income
  if (working && lowIncome) {
    results.push({
      id: 'prime',
      name: 'Prime d’Activité',
      emoji: '💼',
      explanation: 'Income top-up for workers earning a modest salary.',
      estimate: '≈ 100 – 300 €/month',
      journeyId: 'work',
    });
  }

  // RSA — minimum income, 25+, legal 1+ year
  if (over25 && veryLowIncome && validPermit && a.duration === 'gt12') {
    results.push({
      id: 'rsa',
      name: 'RSA — Revenu de Solidarité Active',
      emoji: '💶',
      explanation: 'Minimum income support for residents with very low resources.',
      estimate: '≈ 635 €/month (single person)',
      journeyId: 'caf',
    });
  }

  // CSS — health cover for low income, 3+ months
  if (veryLowIncome && inFrance3plus) {
    results.push({
      id: 'css',
      name: 'CSS — Complémentaire Santé Solidaire',
      emoji: '🩺',
      explanation: 'Free or very low-cost complementary health coverage.',
      estimate: 'Free or ≤ 1 €/day depending on income',
      journeyId: 'health',
    });
  }

  // Ameli / CPAM — no health insurance yet, 3+ months
  if (a.health !== 'yes' && inFrance3plus) {
    results.push({
      id: 'cpam',
      name: 'Ameli / CPAM — Health Insurance',
      emoji: '🏥',
      explanation: 'Register for state health insurance to get your reimbursements.',
      journeyId: 'health',
    });
  }

  // CROUS — student housing
  if (isStudent) {
    results.push({
      id: 'crous',
      name: 'CROUS Housing & Student Aid',
      emoji: '🎓',
      explanation: 'Subsidized student housing and scholarships for students.',
      estimate: 'Subsidized rent / scholarship',
      journeyId: 'student',
    });
  }

  // France Travail — job seekers with legal status
  if (a.status === 'jobseeker' && legalStatus) {
    results.push({
      id: 'francetravail',
      name: 'France Travail — Job Support',
      emoji: '🔎',
      explanation: 'Job offers, guidance and possible unemployment support.',
      journeyId: 'work',
    });
  }

  return results;
}

export const ELIGIBILITY_DISCLAIMER =
  'This is not an official eligibility decision. Results are based on general criteria. Please verify with the relevant French authority.';
