import { useApp } from '../context/AppContext';
import { getPlan, FREE_DOCUMENT_LIMIT, FREE_AI_DAILY_LIMIT } from '../constants/pricing';

/**
 * Subscription / quota hook. Exposes the active plan, usage and helpers to
 * enforce free-tier limits (trial AI, daily AI, documents, journeys).
 */
export function useSubscription() {
  const {
    planId,
    setPlan,
    usage,
    refreshUsage,
    registerDocumentUse,
    canProcessDocument,
    canAddDocument,
    consumeAiRequest,
    isInTrial,
    trialDaysLeft,
    aiRemainingToday,
    documents,
  } = useApp();

  const plan = getPlan(planId);
  const remaining =
    plan.documentLimit === null
      ? Infinity
      : planId === 'free'
        ? Math.max(0, FREE_DOCUMENT_LIMIT - documents.length)
        : Math.max(0, plan.documentLimit - usage.documentsProcessed);

  return {
    plan,
    planId,
    setPlan,
    usage,
    refreshUsage,
    registerDocumentUse,
    canProcessDocument,
    canAddDocument,
    consumeAiRequest,
    isInTrial,
    trialDaysLeft,
    aiRemainingToday,
    remaining,
    isUnlimited: plan.documentLimit === null,
    aiDailyLimit: FREE_AI_DAILY_LIMIT,
  };
}
