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

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '€0',
    tagline: 'Get started with the basics',
    documentLimit: 5,
    highlighted: false,
    stripePriceId: null,
    features: [
      '5 documents / month',
      'Document explanations',
      'Basic translation (10 languages)',
      'AI chat assistant (limited)',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9,
    priceLabel: '€9',
    tagline: 'For everyday admin tasks',
    documentLimit: 50,
    highlighted: true,
    stripePriceId: 'price_basic_monthly',
    features: [
      '50 documents / month',
      'Everything in Free',
      'AI reply generator',
      'Form field assistant',
      'Deadline tracker & reminders',
      'PDF letter generator',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    priceLabel: '€19',
    tagline: 'Unlimited power for complex cases',
    documentLimit: null,
    highlighted: false,
    stripePriceId: 'price_pro_monthly',
    features: [
      'Unlimited documents',
      'Everything in Basic',
      'Priority AI (GPT-4o)',
      'Secure document vault',
      'Full guides library',
      'Priority support',
    ],
  },
];

export const getPlan = (id: PlanId): Plan => PLANS.find((p) => p.id === id) ?? PLANS[0];

export const FREE_DOCUMENT_LIMIT = 5;
