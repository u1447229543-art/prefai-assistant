export type PlanId = 'free' | 'basic' | 'pro';

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in EUR. */
  price: number;
  priceLabel: string;
  tagline: string;
  /** Documents allowed per month. null = unlimited. */
  documentLimit: number | null;
  highlighted: boolean;
  /** Stripe price id (replace with real ids from your Stripe dashboard). */
  stripePriceId: string | null;
  features: string[];
}

/**
 * Monetization model (current):
 * - Single paid tier: Basic (€4.99/mo).
 * - Everything else in the app is free (AI, docs, journeys, tools, reminders, daily question).
 * - Only paywall: Support & Benefits Finder — first 2 matches free; Basic unlocks all.
 * - `pro` remains a PlanId for legacy DB/storage only; it is not offered for purchase.
 */
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '€0',
    tagline: 'Everything free — unlock full benefit matches with Basic',
    documentLimit: null,
    highlighted: false,
    stripePriceId: null,
    features: [
      'Unlimited AI, documents, journeys & tools',
      'Deadline & appointment reminders',
      'Support & Benefits Finder — first 2 matches free',
      'Upgrade to Basic to see every matched benefit',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 4.99,
    priceLabel: '€4.99',
    tagline: 'Unlock full Support & Benefits Finder results',
    documentLimit: null,
    highlighted: true,
    stripePriceId: 'price_1TzeFdD753169kynzHXvXePj',
    features: [
      'See every matched benefit without blur',
      'Full Support & Benefits Finder unlock',
      'All other PrefAI features stay free',
    ],
  },
];

/** Plans shown on the Subscription screen (Free + Basic only). */
export const OFFERED_PLANS: Plan[] = PLANS;

export const getPlan = (id: PlanId): Plan => {
  const found = PLANS.find((p) => p.id === id);
  if (found) return found;
  // Legacy `pro` subscribers: same entitlement as Basic; not offered for purchase.
  if (id === 'pro') {
    return {
      ...PLANS.find((p) => p.id === 'basic')!,
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      priceLabel: '€9.99',
      stripePriceId: 'price_1TzeFeD753169kyng0Yij4fA',
      highlighted: false,
      tagline: 'Legacy plan — same unlock as Basic',
      features: [
        'See every matched benefit without blur',
        'Full Support & Benefits Finder unlock',
        'All other PrefAI features stay free',
      ],
    };
  }
  return PLANS[0];
};

/** How many Support & Benefits Finder matches are visible without a paid plan. */
export const FREE_ELIGIBILITY_VISIBLE = 2;

/** @deprecated No longer enforced — all documents are unlimited. */
export const FREE_DOCUMENT_LIMIT = Number.POSITIVE_INFINITY;
/** @deprecated Trial removed — all features are free without a trial period. */
export const FREE_TRIAL_DAYS = 0;
/** @deprecated AI daily cap removed. */
export const FREE_AI_DAILY_LIMIT = Number.POSITIVE_INFINITY;
/** @deprecated Journey unlock cap removed. */
export const FREE_JOURNEY_LIMIT = Number.POSITIVE_INFINITY;

export function hasEligibilityUnlock(planId: PlanId): boolean {
  return planId === 'basic' || planId === 'pro';
}
