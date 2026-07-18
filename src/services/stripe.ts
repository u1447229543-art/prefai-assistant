import { PlanId, getPlan } from '../constants/pricing';

/**
 * Stripe service.
 *
 * Native Stripe (`@stripe/stripe-react-native`) requires a custom dev build, so this
 * module is a thin client that talks to the PrefAI backend. Point
 * `EXPO_PUBLIC_API_URL` at the Railway API; paid plans must have a real
 * `stripePriceId` in `constants/pricing.ts`.
 *
 * `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is required so checkout is marked ready
 * (and available for native Payment Sheet if you add it later).
 */

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const PUBLISHABLE_KEY = (process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '').trim();

export const getPublishableKey = (): string => PUBLISHABLE_KEY;

export const isConfigured = (): boolean => API_URL.length > 0 && PUBLISHABLE_KEY.length > 0;

export interface CheckoutResult {
  success: boolean;
  planId: PlanId;
  /** Hosted Checkout URL when using a real backend. */
  url?: string;
  message: string;
}

/**
 * Starts a subscription checkout for the given plan.
 * With a real backend this returns a Stripe Checkout URL to open in a browser.
 */
export async function startCheckout(
  planId: PlanId,
  customerEmail: string
): Promise<CheckoutResult> {
  const plan = getPlan(planId);

  if (planId === 'free') {
    return { success: true, planId, message: 'You are on the Free plan.' };
  }

  if (!API_URL) {
    throw new Error(
      'Payments are not configured. Set EXPO_PUBLIC_API_URL to your PrefAI backend.'
    );
  }

  if (!PUBLISHABLE_KEY) {
    throw new Error(
      'Stripe publishable key missing. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env file.'
    );
  }

  if (!plan.stripePriceId) {
    throw new Error(
      `Stripe is not configured for the ${plan.name} plan. Add a valid stripePriceId in pricing settings.`
    );
  }

  const res = await fetch(`${API_URL}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId: plan.stripePriceId,
      email: customerEmail,
      planId,
      // Sent so the backend can verify the client is using the expected Stripe account.
      publishableKey: PUBLISHABLE_KEY,
    }),
  });

  if (!res.ok) {
    return { success: false, planId, message: `Checkout failed (${res.status}).` };
  }

  const data = await res.json();
  return {
    success: true,
    planId,
    url: data.url,
    message: 'Redirecting to secure checkout…',
  };
}

export async function cancelSubscription(customerEmail: string): Promise<boolean> {
  if (!isConfigured()) {
    throw new Error(
      'Payments are not configured. Set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY.'
    );
  }
  const res = await fetch(`${API_URL}/api/cancel-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerEmail }),
  });
  return res.ok;
}

export async function getSubscriptionStatus(
  customerEmail: string
): Promise<{ planId: PlanId; active: boolean }> {
  if (!isConfigured()) {
    return { planId: 'free', active: true };
  }
  const res = await fetch(
    `${API_URL}/api/subscription-status?email=${encodeURIComponent(customerEmail)}`
  );
  if (!res.ok) return { planId: 'free', active: true };
  return res.json();
}
