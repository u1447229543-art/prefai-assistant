import { useApp } from '../context/AppContext';
import { getPlan, hasEligibilityUnlock } from '../constants/pricing';

/**
 * Subscription hook. Feature usage is unlimited; Basic/Pro unlock full
 * Money & Benefits Finder results.
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
  } = useApp();

  const plan = getPlan(planId);

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
    remaining: Infinity,
    isUnlimited: true,
    aiDailyLimit: Infinity,
    hasEligibilityUnlock: hasEligibilityUnlock(planId),
  };
}
