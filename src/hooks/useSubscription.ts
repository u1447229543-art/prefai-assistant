import { useApp } from '../context/AppContext';
import { getPlan } from '../constants/pricing';

/**
 * Subscription / quota hook. Exposes the active plan, usage and helpers to
 * enforce the monthly document limit.
 */
export function useSubscription() {
  const {
    planId,
    setPlan,
    usage,
    refreshUsage,
    registerDocumentUse,
    canProcessDocument,
  } = useApp();

  const plan = getPlan(planId);
  const remaining =
    plan.documentLimit === null
      ? Infinity
      : Math.max(0, plan.documentLimit - usage.documentsProcessed);

  return {
    plan,
    planId,
    setPlan,
    usage,
    refreshUsage,
    registerDocumentUse,
    canProcessDocument,
    remaining,
    isUnlimited: plan.documentLimit === null,
  };
}
