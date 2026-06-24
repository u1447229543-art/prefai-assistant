import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Gradients, Radius, Spacing, glow } from '../constants/colors';
import { Plan } from '../constants/pricing';
import { NeonButton } from './ui';

export interface PricingCardProps {
  plan: Plan;
  isCurrent: boolean;
  loading?: boolean;
  onSelect: () => void;
  popularLabel?: string;
  currentLabel?: string;
  perMonthLabel?: string;
  selectLabel?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isCurrent,
  loading,
  onSelect,
  popularLabel = 'MOST POPULAR',
  currentLabel = 'Current Plan',
  perMonthLabel = '/month',
  selectLabel = 'Select',
}) => {
  const highlighted = plan.highlighted;

  return (
    <View style={[styles.card, highlighted && styles.cardHighlighted, highlighted && glow(Colors.blue, 14)]}>
      {highlighted ? (
        <LinearGradient
          colors={['rgba(0,212,255,0.12)', 'rgba(255,45,85,0.10)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {highlighted ? (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>{popularLabel}</Text>
        </View>
      ) : null}

      <Text style={styles.name}>{plan.name}</Text>
      <Text style={styles.tagline}>{plan.tagline}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{plan.priceLabel}</Text>
        {plan.price > 0 ? <Text style={styles.perMonth}>{perMonthLabel}</Text> : null}
      </View>

      <View style={styles.features}>
        {plan.features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={highlighted ? Colors.blue : Colors.success} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {isCurrent ? (
        <View style={styles.currentBtn}>
          <Ionicons name="checkmark" size={16} color={Colors.success} />
          <Text style={styles.currentText}>{currentLabel}</Text>
        </View>
      ) : (
        <NeonButton
          title={selectLabel + ' ' + plan.name}
          onPress={onSelect}
          loading={loading}
          variant={highlighted ? 'blueRed' : 'blue'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardHighlighted: { borderColor: Colors.blue },
  popularBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.blue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  popularText: { color: '#04121A', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  name: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800' },
  tagline: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: Spacing.md },
  price: { color: Colors.white, fontSize: FontSize.display, fontWeight: '800' },
  perMonth: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: 7, marginLeft: 4 },
  features: { marginVertical: Spacing.md, gap: Spacing.sm as unknown as number },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  featureText: { color: Colors.textPrimary, fontSize: FontSize.sm, marginLeft: Spacing.sm, flex: 1 },
  currentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.success,
    backgroundColor: 'rgba(46,230,166,0.08)',
  },
  currentText: { color: Colors.success, fontWeight: '700', marginLeft: 6, fontSize: FontSize.md },
});
