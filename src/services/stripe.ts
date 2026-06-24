import { PlanId, getPlan } from '../constants/pricing';

/**
 * Stripe service.
 *
 * Native Stripe (`@stripe/stripe-react-native`) requires a custom dev build, so this
 * module is written as a thin client that talks to YOUR backend. Point
 * `EXPO_PUBLIC_API_URL` at a server that creates Checkout Sessions / Payment Intents
 * with your secret key. Until then it runs in a safe "demo" mode that simulates the flow.
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const isConfigured = (): boolean => API_URL.length > 0;

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

  if (!isConfigured() || !plan.stripePriceId) {
    // Demo mode: pretend the payment succeeded so the UI flow can be tested.
    await new Promise((r) => setTimeout(r, 900));
    return {
      success: true,
      planId,
      message: `[Demo] Subscribed to ${plan.name} (€${plan.price}/mo). Configure EXPO_PUBLIC_API_URL + Stripe to take real payments.`,
    };
  }

  const res = await fetch(`${API_URL}/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId: plan.stripePriceId,
      email: customerEmail,
      planId,
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
    await new Promise((r) => setTimeout(r, 600));
    return true;
  }
  const res = await fetch(`${API_URL}/cancel-subscription`, {
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
    `${API_URL}/subscription-status?email=${encodeURIComponent(customerEmail)}`
  );
  if (!res.ok) return { planId: 'free', active: true };
  return res.json();
}
