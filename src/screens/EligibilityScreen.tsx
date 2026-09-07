import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing, glow } from '../constants/colors';
import { Screen, Body, Header, Card, NeonButton, ProgressBar, ScrollableText } from '../components/ui';
import { useApp } from '../context/AppContext';
import { JourneyId } from '../constants/journeys';
import { QUESTIONS, Answers, evaluateEligibility, BenefitResult } from '../constants/eligibility';
import { filterDepartments, departmentLabel } from '../constants/departments';
import { FREE_ELIGIBILITY_VISIBLE, hasEligibilityUnlock } from '../constants/pricing';
import { aiEligibilityFollowUp, ApiError } from '../services/api';
import type { RootStackParamList } from '../navigation/types';
import type { TranslationKey } from '../i18n/translations';
import { MES_AIDES_SYNCED_AT } from '../data/mesAidesBenefits';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TFn = (key: TranslationKey) => string;

export const EligibilityScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { selectJourney, t, language, planId } = useApp();

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
    <Screen edges={['top', 'left', 'right', 'bottom']}>
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
            answers={answers}
            results={results}
            unlocked={hasEligibilityUnlock(planId)}
            onStartJourney={startJourney}
            onRestart={restart}
            t={t}
            language={language}
            onUpgrade={() => navigation.navigate('Subscription')}
          />
        ) : current.id === 'department' ? (
          <DepartmentStep
            t={t}
            selected={answers.department}
            onSelect={select}
          />
        ) : (
          <View>
            <Text style={styles.question}>{t(current.questionKey)}</Text>
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
                      {t(opt.labelKey)}
                    </Text>
                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
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

const DepartmentStep: React.FC<{
  t: TFn;
  selected?: string;
  onSelect: (id: string) => void;
}> = ({ t, selected, onSelect }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => filterDepartments(query), [query]);

  return (
    <View>
      <Text style={styles.question}>{t('eligQDepartment')}</Text>
      <Text style={styles.deptHint}>{t('eligQDepartmentHint')}</Text>

      <Pressable
        onPress={() => onSelect('skip')}
        style={({ pressed }) => [
          styles.option,
          selected === 'skip' && styles.optionSelected,
          pressed && { opacity: 0.85 },
          { marginBottom: Spacing.sm },
        ]}
      >
        <Text style={[styles.optionText, selected === 'skip' && styles.optionTextSelected]}>
          {t('eligOptDeptSkip')}
        </Text>
        <Ionicons
          name={selected === 'skip' ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={selected === 'skip' ? Colors.blue : Colors.textMuted}
        />
      </Pressable>

      <View style={styles.deptSearchRow}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.deptSearchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('eligDeptSearchPlaceholder')}
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.options}>
        {filtered.slice(0, 40).map((d) => {
          const active = selected === d.code;
          return (
            <Pressable
              key={d.code}
              onPress={() => onSelect(d.code)}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionSelected,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.optionText, active && styles.optionTextSelected]}>
                {departmentLabel(d.code)}
              </Text>
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={active ? Colors.blue : Colors.textMuted}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const benefitTitle = (b: BenefitResult, t: TFn) =>
  b.displayName ?? (b.nameKey ? t(b.nameKey) : b.id);
const benefitExplain = (b: BenefitResult, t: TFn) =>
  b.displayExplanation ?? (b.explanationKey ? t(b.explanationKey) : '');
const benefitEstimate = (b: BenefitResult, t: TFn) =>
  b.displayEstimate ?? (b.estimateKey ? t(b.estimateKey) : undefined);

const BenefitCard: React.FC<{
  b: BenefitResult;
  locked: boolean;
  t: TFn;
  onStartJourney: (id: JourneyId) => void;
  onUpgrade: () => void;
}> = ({ b, locked, t, onStartJourney, onUpgrade }) => {
  const estimate = benefitEstimate(b, t);
  return (
  <Card style={styles.benefitCard}>
    <View style={locked ? styles.lockedContent : undefined}>
      <View style={styles.benefitHead}>
        <Text style={styles.benefitEmoji}>{b.emoji}</Text>
        <Text style={styles.benefitName}>{benefitTitle(b, t)}</Text>
      </View>
      <Text style={styles.benefitExplain}>{benefitExplain(b, t)}</Text>
      {estimate ? (
        <View style={styles.estimateRow}>
          <Ionicons name="cash-outline" size={14} color={Colors.success} />
          <Text style={styles.estimateText}>{estimate}</Text>
        </View>
      ) : null}
      {!locked && b.sourceUrl ? (
        <Pressable
          onPress={() => void Linking.openURL(b.sourceUrl!)}
          style={styles.sourceLink}
          hitSlop={8}
        >
          <Ionicons name="open-outline" size={14} color={Colors.blue} />
          <Text style={styles.sourceLinkText}>{t('eligCatalogOfficialLink')}</Text>
        </Pressable>
      ) : null}
      {!locked && b.journeyId ? (
        <NeonButton
          title={t('startThisJourney')}
          icon="navigate-outline"
          onPress={() => onStartJourney(b.journeyId!)}
          style={{ marginTop: Spacing.sm }}
        />
      ) : null}
    </View>
    {locked ? (
      <View style={styles.lockOverlay}>
        <Ionicons name="lock-closed" size={22} color={Colors.white} />
        <Text style={styles.lockTitle}>{t('eligibilityUnlockTitle')}</Text>
        <Text style={styles.lockMsg}>{t('eligibilityUnlockMsg')}</Text>
        <NeonButton
          title={t('eligibilityUnlockCta')}
          icon="rocket-outline"
          variant="blue"
          onPress={onUpgrade}
          style={{ marginTop: Spacing.sm, alignSelf: 'stretch' }}
        />
      </View>
    ) : null}
  </Card>
  );
};

const ResultsView: React.FC<{
  answers: Answers;
  results: BenefitResult[];
  unlocked: boolean;
  onStartJourney: (id: JourneyId) => void;
  onRestart: () => void;
  t: TFn;
  language: string;
  onUpgrade: () => void;
}> = ({ answers, results, unlocked, onStartJourney, onRestart, t, language, onUpgrade }) => {
  const [note, setNote] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  const submitFollowUp = async () => {
    const trimmed = note.trim();
    if (!trimmed) {
      setFollowUpError(t('eligibilityFollowUpEmpty'));
      return;
    }

    setFollowUpError(null);
    setLoading(true);
    try {
      const answersLabeled = QUESTIONS.map((q) => {
        const optionId = answers[q.id];
        const opt = q.options.find((o) => o.id === optionId);
        let answer = opt ? t(opt.labelKey) : optionId || '';
        if (q.id === 'department' && optionId && optionId !== 'skip') {
          answer = departmentLabel(optionId);
        }
        return {
          question: t(q.questionKey),
          answer,
        };
      }).filter((row) => row.answer);

      const { guidance: text } = await aiEligibilityFollowUp({
        note: trimmed,
        language,
        answersLabeled,
        results: results.map((r) => ({ id: r.id, name: benefitTitle(r, t) })),
      });
      setGuidance(text);
    } catch (e) {
      setFollowUpError(e instanceof ApiError ? e.message : t('eligibilityFollowUpError'));
    } finally {
      setLoading(false);
    }
  };

  const shouldLockExtras = !unlocked && results.length > FREE_ELIGIBILITY_VISIBLE;
  const syncedDate = MES_AIDES_SYNCED_AT.slice(0, 10);

  return (
    <View>
      <Text style={styles.resultsHeading}>{t('resultsHeading')}</Text>

      {results.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="information-circle-outline" size={26} color={Colors.blue} />
          <Text style={styles.emptyText}>{t('eligibilityNoMatch')}</Text>
        </Card>
      ) : (
        results.map((b, i) => {
          const locked = shouldLockExtras && i >= FREE_ELIGIBILITY_VISIBLE;
          return (
            <BenefitCard
              key={b.id}
              b={b}
              locked={locked}
              t={t}
              onStartJourney={onStartJourney}
              onUpgrade={onUpgrade}
            />
          );
        })
      )}

      {showFollowUp && !guidance ? (
        <Card style={styles.followUpCard}>
          <Text style={styles.followUpPrompt}>{t('eligibilityFollowUpPrompt')}</Text>
          <TextInput
            style={styles.followUpInput}
            placeholder={t('eligibilityFollowUpPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={note}
            onChangeText={(v) => {
              setNote(v);
              if (followUpError) setFollowUpError(null);
            }}
            multiline
            editable={!loading}
          />
          {followUpError ? <Text style={styles.followUpError}>{followUpError}</Text> : null}
          <NeonButton
            title={t('eligibilityFollowUpSubmit')}
            icon="sparkles-outline"
            variant="purple"
            onPress={() => void submitFollowUp()}
            loading={loading}
            disabled={loading || !note.trim()}
            style={{ marginTop: Spacing.sm }}
          />
          <Pressable
            onPress={() => setShowFollowUp(false)}
            disabled={loading}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>{t('eligibilityFollowUpSkip')}</Text>
          </Pressable>
        </Card>
      ) : null}

      {guidance ? (
        <Card style={styles.guidanceCard}>
          <View style={styles.benefitHead}>
            <Ionicons name="sparkles" size={18} color={Colors.blue} />
            <Text style={styles.benefitName}>{t('eligibilityFollowUpGuidance')}</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={Colors.blue} style={{ marginTop: Spacing.md }} />
          ) : (
            <ScrollableText text={guidance} textStyle={styles.guidanceText} maxHeightRatio={0.35} />
          )}
        </Card>
      ) : null}

      <NeonButton
        title={t('startOver')}
        icon="refresh-outline"
        variant="ghost"
        onPress={onRestart}
        style={{ marginTop: Spacing.sm }}
      />

      <View style={styles.disclaimer}>
        <Ionicons name="alert-circle-outline" size={15} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>{t('eligibilityDisclaimer')}</Text>
      </View>
      <View style={styles.disclaimer}>
        <Ionicons name="library-outline" size={15} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>
          {t('eligCatalogAttribution').replace('{date}', syncedDate)}
        </Text>
      </View>
    </View>
  );
};

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
  deptHint: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginTop: -Spacing.md,
    marginBottom: Spacing.md,
  },
  deptSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  deptSearchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.md,
    paddingVertical: 12,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  sourceLinkText: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '600' },
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
  },
  optionSelected: {
    borderColor: Colors.blue,
    backgroundColor: 'rgba(0,166,204,0.12)',
    ...glow(Colors.blue, 8),
  },
  optionText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600', flex: 1, paddingRight: Spacing.sm },
  optionTextSelected: { color: Colors.white },

  resultsHeading: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  emptyCard: { alignItems: 'center', gap: Spacing.sm as unknown as number, paddingVertical: Spacing.lg },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  benefitCard: { marginBottom: Spacing.md, overflow: 'hidden' },
  lockedContent: { opacity: 0.28 },
  benefitHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm as unknown as number },
  benefitEmoji: { fontSize: 22 },
  benefitName: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800', flex: 1 },
  benefitExplain: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginTop: Spacing.sm },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  estimateText: { color: Colors.success, fontSize: FontSize.sm, fontWeight: '700' },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 18, 26, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  lockTitle: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  lockMsg: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },

  followUpCard: { marginTop: Spacing.md },
  followUpPrompt: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.sm },
  followUpInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    padding: Spacing.md,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  followUpError: { color: Colors.red, fontSize: FontSize.sm, marginTop: Spacing.sm },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  skipText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  guidanceCard: { marginTop: Spacing.md },
  guidanceText: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginTop: Spacing.sm },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm as unknown as number,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  disclaimerText: { color: Colors.textMuted, fontSize: FontSize.xs, lineHeight: 16, flex: 1 },
});
