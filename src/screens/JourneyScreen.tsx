import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing, glow } from '../constants/colors';
import { Screen, Body, Card, ProgressBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { JOURNEYS, JourneyId, JourneyStep, getJourney } from '../constants/journeys';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const JourneyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { journey, journeyPercent, journeySyncing, refreshJourney, selectJourney, toggleJourneyStep, resetJourney, t } = useApp();

  useFocusEffect(
    useCallback(() => {
      void refreshJourney();
    }, [refreshJourney])
  );

  if (!journey.journeyId) {
    return <SituationPicker onPick={selectJourney} t={t} />;
  }

  const data = getJourney(journey.journeyId);
  const completedCount = journey.completedStepIds.length;
  // The current step is the first one that isn't completed yet.
  const currentStepId = data.steps.find((s) => !journey.completedStepIds.includes(s.id))?.id ?? null;

  return (
    <Screen>
      <Body>
        <View style={styles.roadHeader}>
          <View style={[styles.roadIcon, { borderColor: data.accent }, glow(data.accent, 8)]}>
            <Ionicons name={data.icon} size={22} color={data.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.roadTitle}>{data.title}</Text>
            <Text style={styles.roadSub}>{data.subtitle}</Text>
          </View>
          <Pressable onPress={resetJourney} hitSlop={8} style={styles.changeBtn}>
            <Ionicons name="swap-horizontal" size={16} color={Colors.blue} />
            <Text style={styles.changeText}>{t('change')}</Text>
          </Pressable>
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>{t('yourProgress')}</Text>
            {journeySyncing ? (
              <ActivityIndicator size="small" color={Colors.blue} />
            ) : (
              <Text style={styles.progressPct}>{journeyPercent}%</Text>
            )}
          </View>
          <ProgressBar percent={journeyPercent} />
          <Text style={styles.progressMeta}>
            {completedCount} {t('of')} {data.steps.length} {t('stepsCompleted')}
          </Text>
        </Card>

        {data.steps.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            index={index}
            total={data.steps.length}
            accent={data.accent}
            done={journey.completedStepIds.includes(step.id)}
            current={step.id === currentStepId}
            onToggle={() => toggleJourneyStep(step.id)}
            onOpen={() =>
              navigation.navigate('JourneyStep', {
                journeyId: data.id,
                stepId: step.id,
              })
            }
            t={t}
          />
        ))}
      </Body>
    </Screen>
  );
};

import type { TranslationKey } from '../i18n/translations';

type TFn = (key: TranslationKey) => string;

// ---- Situation picker -----------------------------------------------------

const SituationPicker: React.FC<{ onPick: (id: JourneyId) => void; t: TFn }> = ({ onPick, t }) => (
  <Screen>
    <Body>
      <Text style={styles.pickerTitle}>{t('whatAreYouTrying')}</Text>
      <Text style={styles.pickerSub}>{t('pickSituationDesc')}</Text>

      <View style={styles.pickerGrid}>
        {JOURNEYS.map((j) => (
          <Pressable
            key={j.id}
            onPress={() => onPick(j.id)}
            style={({ pressed }) => [styles.option, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          >
            <View style={[styles.optionIcon, { borderColor: j.accent }, glow(j.accent, 6)]}>
              <Ionicons name={j.icon} size={22} color={j.accent} />
            </View>
            <Text style={styles.optionTitle}>{j.title}</Text>
          </Pressable>
        ))}
      </View>
    </Body>
  </Screen>
);

// ---- Step card ------------------------------------------------------------

const StepCard: React.FC<{
  step: JourneyStep;
  index: number;
  total: number;
  accent: string;
  done: boolean;
  current: boolean;
  onToggle: () => void;
  onOpen: () => void;
  t: TFn;
}> = ({ step, index, accent, done, current, onToggle, onOpen, t }) => (
  <Card
    onPress={onOpen}
    style={[
      styles.stepCard,
      done && styles.stepCardDone,
      current && styles.stepCardCurrent,
    ]}
  >
    {current ? (
      <View style={styles.currentBadge}>
        <Ionicons name="play" size={11} color={Colors.blue} />
        <Text style={styles.currentBadgeText}>{t('currentStepLabel')}</Text>
      </View>
    ) : null}

    <View style={styles.stepHeader}>
      <View
        style={[
          styles.stepNumber,
          { borderColor: done ? Colors.success : accent },
          done && { backgroundColor: Colors.success },
        ]}
      >
        {done ? (
          <Ionicons name="checkmark" size={16} color="#04121A" />
        ) : (
          <Text style={[styles.stepNumberText, { color: accent }]}>{index + 1}</Text>
        )}
      </View>
      <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>{step.title}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </View>

    <Text style={styles.stepPurpose} numberOfLines={2}>
      {step.purpose}
    </Text>

    <View style={styles.metaRow}>
      <MetaItem icon="time-outline" label={step.duration} />
      <MetaItem icon="business-outline" label={step.organization} />
    </View>

    <View style={styles.cardFooter}>
      <Text style={styles.tapHint}>{t('tapForDetails')}</Text>
      <Pressable
        onPress={(e) => {
          // Prevent the parent card's navigation when only toggling completion.
          (e as unknown as { stopPropagation?: () => void })?.stopPropagation?.();
          onToggle();
        }}
        hitSlop={8}
        style={[styles.completeBtn, done ? styles.completeBtnDone : { borderColor: accent }]}
      >
        <Ionicons
          name={done ? 'checkmark-circle' : 'ellipse-outline'}
          size={16}
          color={done ? Colors.success : accent}
        />
        <Text style={[styles.completeText, { color: done ? Colors.success : accent }]}>
          {done ? t('completedCheck') : t('markDone')}
        </Text>
      </Pressable>
    </View>
  </Card>
);

const MetaItem: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; full?: boolean }> = ({
  icon,
  label,
  full,
}) => (
  <View style={[styles.metaItem, full && { width: '100%', marginTop: 6 }]}>
    <Ionicons name={icon} size={14} color={Colors.blue} />
    <Text style={styles.metaText} numberOfLines={2}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  // Picker
  pickerTitle: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: '800', marginTop: Spacing.sm },
  pickerSub: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 6, marginBottom: Spacing.lg, lineHeight: 20 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  option: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: 116,
    justifyContent: 'space-between',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700', marginTop: Spacing.sm },

  // Roadmap header
  roadHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  roadIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800' },
  roadSub: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 as unknown as number },
  changeText: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '700' },

  // Progress
  progressCard: { marginBottom: Spacing.md },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  progressPct: { color: Colors.blue, fontSize: FontSize.lg, fontWeight: '800' },
  progressMeta: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 8 },

  // Step
  stepCard: { marginBottom: Spacing.sm },
  stepCardDone: { borderColor: Colors.success, opacity: 0.85 },
  stepCardCurrent: { borderColor: Colors.blue, borderWidth: 1.5, ...glow(Colors.blue, 10) },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4 as unknown as number,
    backgroundColor: Colors.glassBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    marginBottom: Spacing.sm,
  },
  currentBadgeText: { color: Colors.blue, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  stepHeader: { flexDirection: 'row', alignItems: 'center' },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  stepNumberText: { fontSize: FontSize.sm, fontWeight: '800' },
  stepTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  stepTitleDone: { color: Colors.textSecondary, textDecorationLine: 'line-through' },
  stepPurpose: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginTop: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', width: '50%', paddingRight: 8 },
  metaText: { color: Colors.textPrimary, fontSize: FontSize.xs, marginLeft: 6, flex: 1 },
  docsLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  docRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  docText: { color: Colors.textSecondary, fontSize: FontSize.sm, marginLeft: 8, flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tapHint: { color: Colors.textMuted, fontSize: FontSize.xs },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 as unknown as number,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  completeBtnDone: { borderColor: Colors.success, backgroundColor: 'rgba(46,230,166,0.08)' },
  completeText: { fontSize: FontSize.xs, fontWeight: '700' },
});
