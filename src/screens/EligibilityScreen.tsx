import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing, glow } from '../constants/colors';
import { Screen, Body, Header, Card, NeonButton, ProgressBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { JourneyId } from '../constants/journeys';
import {
  QUESTIONS,
  Answers,
  evaluateEligibility,
  ELIGIBILITY_DISCLAIMER,
} from '../constants/eligibility';
import type { RootStackParamList } from '../navigation/types';
import type { TranslationKey } from '../i18n/translations';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TFn = (key: TranslationKey) => string;

export const EligibilityScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { selectJourney, t } = useApp();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);

  const total = QUESTIONS.length;
  const current = QUESTIONS[index];

  const results = useMemo(
    () => (showResults ? evaluateEligibility(answers) : []),
    [showResults, answers]
  );

  const goBack = () => {
    if (showResults) {
      setShowResults(false);
      return;
    }
    if (index > 0) {
      setIndex((i) => i - 1);
      return;
    }
    navigation.goBack();
  };

  const select = (optionId: string) => {
    const next = { ...answers, [current.id]: optionId };
    setAnswers(next);
    if (index + 1 >= total) {
      setShowResults(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setShowResults(false);
  };

  const startJourney = (journeyId: JourneyId) => {
    selectJourney(journeyId);
    navigation.navigate('Main', { screen: 'Journey' });
  };

  const progress = showResults ? 100 : Math.round((index / total) * 100);

  return (
    <Screen>
      <Header
        title={t('eligibilityTitle')}
        subtitle={showResults ? t('yourResults') : `${t('questionOf')} ${index + 1} ${t('of')} ${total}`}
        onBack={goBack}
      />

      <View style={styles.progressWrap}>
        <ProgressBar percent={progress} />
      </View>

      <Body>
        {showResults ? (
          <ResultsView
            results={results}
            onStartJourney={startJourney}
            onRestart={restart}
            t={t}
          />
        ) : (
          <View>
            <Text style={styles.question}>{current.question}</Text>
            <View style={styles.options}>
              {current.options.map((opt) => {
                const selected = answers[current.id] === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => select(opt.id)}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {opt.label}
                    </Text>
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'chevron-forward'}
                      size={20}
                      color={selected ? Colors.blue : Colors.textMuted}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </Body>
    </Screen>
  );
};

const ResultsView: React.FC<{
  results: ReturnType<typeof evaluateEligibility>;
  onStartJourney: (id: JourneyId) => void;
  onRestart: () => void;
  t: TFn;
}> = ({ results, onStartJourney, onRestart, t }) => (
  <View>
    <Text style={styles.resultsHeading}>{t('resultsHeading')}</Text>

    {results.length === 0 ? (
      <Card style={styles.emptyCard}>
        <Ionicons name="information-circle-outline" size={26} color={Colors.blue} />
        <Text style={styles.emptyText}>{t('eligibilityNoMatch')}</Text>
      </Card>
    ) : (
      results.map((b) => (
        <Card key={b.id} style={styles.benefitCard}>
          <View style={styles.benefitHead}>
            <Text style={styles.benefitEmoji}>{b.emoji}</Text>
            <Text style={styles.benefitName}>{b.name}</Text>
          </View>
          <Text style={styles.benefitExplain}>{b.explanation}</Text>
          {b.estimate ? (
            <View style={styles.estimateRow}>
              <Ionicons name="cash-outline" size={14} color={Colors.success} />
              <Text style={styles.estimateText}>{b.estimate}</Text>
            </View>
          ) : null}
          <NeonButton
            title={t('startThisJourney')}
            icon="navigate-outline"
            onPress={() => onStartJourney(b.journeyId)}
            style={{ marginTop: Spacing.sm }}
          />
        </Card>
      ))
    )}

    <NeonButton
      title={t('startOver')}
      icon="refresh-outline"
      variant="ghost"
      onPress={onRestart}
      style={{ marginTop: Spacing.sm }}
    />

    <View style={styles.disclaimer}>
      <Ionicons name="alert-circle-outline" size={15} color={Colors.textMuted} />
      <Text style={styles.disclaimerText}>{ELIGIBILITY_DISCLAIMER}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  progressWrap: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },

  question: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '800',
    lineHeight: 30,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  options: { gap: Spacing.sm as unknown as number },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    paddingHorizontal: Spacing.md,
    minHeight: 58,
  },
  optionSelected: { borderColor: Colors.blue, ...glow(Colors.blue, 8) },
  optionText: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600', flex: 1 },
  optionTextSelected: { color: Colors.white, fontWeight: '700' },

  // Results
  resultsHeading: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  emptyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 as unknown as number },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, flex: 1 },
  benefitCard: { marginBottom: Spacing.sm },
  benefitHead: { flexDirection: 'row', alignItems: 'center', gap: 8 as unknown as number },
  benefitEmoji: { fontSize: 22 },
  benefitName: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800', flex: 1 },
  benefitExplain: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginTop: 8 },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 as unknown as number,
    marginTop: Spacing.sm,
  },
  estimateText: { color: Colors.success, fontSize: FontSize.sm, fontWeight: '700' },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8 as unknown as number,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  disclaimerText: { color: Colors.textMuted, fontSize: FontSize.xs, lineHeight: 17, flex: 1 },
});
