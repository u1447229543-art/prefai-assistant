import React, { useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '../constants/colors';
import { Screen, Body, Header } from '../components/ui';
import { PricingCard } from '../components/PricingCard';
import { PLANS, PlanId } from '../constants/pricing';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import { startCheckout } from '../services/stripe';

export const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, t } = useApp();
  const { planId, setPlan } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const choose = async (id: PlanId) => {
    if (id === planId) return;
    setLoadingPlan(id);
    try {
      const result = await startCheckout(id, user?.email ?? 'demo@prefai.app');
      if (result.url) {
        await Linking.openURL(result.url);
      } else if (result.success) {
        await setPlan(id);
        Alert.alert('Success', result.message);
      } else {
        Alert.alert(t('error'), result.message);
      }
    } catch (e) {
      Alert.alert(t('error'), String(e instanceof Error ? e.message : e));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Screen>
      <Header title={t('subscriptionTitle')} onBack={() => navigation.goBack()} />
      <Body>
        <Text style={styles.heading}>{t('choosePlan')}</Text>
        <Text style={styles.sub}>Cancel anytime. Secure payments powered by Stripe.</Text>

        {PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === planId}
            loading={loadingPlan === plan.id}
            onSelect={() => choose(plan.id)}
            popularLabel={t('mostPopular')}
            currentLabel={t('currentPlanLabel')}
            perMonthLabel={t('perMonth')}
            selectLabel={t('selectPlan')}
          />
        ))}

        <View style={styles.secureRow}>
          <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
          <Text style={styles.secureText}>
            Payments are processed securely. PrefAI never stores your card details.
          </Text>
        </View>
      </Body>
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  sub: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', marginBottom: Spacing.lg },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  secureText: { color: Colors.textMuted, fontSize: FontSize.xs, marginLeft: 6, textAlign: 'center' },
});
