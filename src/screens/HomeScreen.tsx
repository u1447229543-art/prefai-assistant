import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Gradients, Radius, Spacing, glow } from '../constants/colors';
import { Screen, Body, SectionTitle, Card, ProgressBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import * as storage from '../services/storage';
import { getJourney } from '../constants/journeys';
import { daysUntil, urgencyColor } from '../utils/deadlines';
import { greetingKey, getTaskTitle } from '../i18n/helpers';
import type { TranslationKey } from '../i18n/translations';

const AI_TOOL_KEYS: { titleKey: TranslationKey; icon: keyof typeof Ionicons.glyphMap; accent: string; route: string }[] = [
  { titleKey: 'featExplain', icon: 'document-text-outline', accent: Colors.blue, route: 'DocumentExplain' },
  { titleKey: 'featTranslate', icon: 'language-outline', accent: Colors.red, route: 'Translation' },
  { titleKey: 'featReply', icon: 'create-outline', accent: '#2EE6A6', route: 'AIReply' },
  { titleKey: 'featForm', icon: 'list-outline', accent: '#7B61FF', route: 'FormAssist' },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, journey, journeyPercent, journeySyncing, refreshJourney, syncError, tasks, toggleTask, t } = useApp();
  const [nextDeadline, setNextDeadline] = useState<storage.StoredDeadline | null>(null);

  const greeting = useMemo(() => t(greetingKey()), [t]);

  useFocusEffect(
    useCallback(() => {
      void refreshJourney();
    }, [refreshJourney])
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      storage.loadDeadlines().then((list) => {
        if (!active) return;
        const upcoming = list
          .filter((d) => !d.done && daysUntil(d.date) >= 0)
          .sort((a, b) => a.date.localeCompare(b.date));
        setNextDeadline(upcoming[0] ?? null);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const go = (route: string) => navigation.navigate(route as never);

  const data = journey.journeyId ? getJourney(journey.journeyId) : null;
  const currentStep = data?.steps.find((s) => !journey.completedStepIds.includes(s.id)) ?? null;
  const firstName = user?.firstName?.trim() || user?.name?.split(' ')[0] || t('friend');

  return (
    <Screen>
      <Body>
        <Text style={styles.greeting}>
          {greeting}, {firstName} 👋
        </Text>
        <Text style={styles.subtitle}>{t('homeJourneyForward')}</Text>

        {journeySyncing ? (
          <View style={styles.syncRow}>
            <ActivityIndicator size="small" color={Colors.blue} />
            <Text style={styles.syncText}>{t('syncingJourney')}</Text>
          </View>
        ) : null}

        {syncError ? (
          <Text style={styles.syncWarn}>{syncError}</Text>
        ) : null}

        {nextDeadline ? (
          <Pressable onPress={() => go('DeadlineTracker')} style={styles.deadlineBadge}>
            <View
              style={[
                styles.deadlineDot,
                { backgroundColor: urgencyColor(daysUntil(nextDeadline.date), false) },
              ]}
            />
            <Text style={styles.deadlineText} numberOfLines={1}>
              {nextDeadline.title} {t('inDays')} {daysUntil(nextDeadline.date)} {t('days')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>
        ) : null}

        <Pressable onPress={() => go('Journey')}>
          <LinearGradient
            colors={Gradients.blueRed}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.journeyCard, glow(Colors.blue, 12)]}
          >
            {journey.journeyId && data ? (
              <>
                <View style={styles.journeyTop}>
                  <Text style={styles.journeyLabel}>{t('continueYourJourney')}</Text>
                  <Text style={styles.journeyPct}>{journeyPercent}%</Text>
                </View>
                <Text style={styles.journeyName}>{data.title}</Text>
                <View style={styles.journeyBar}>
                  <View style={[styles.journeyBarFill, { width: `${journeyPercent}%` }]} />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.journeyLabel}>{t('startYourJourney')}</Text>
                <Text style={styles.journeyName}>{t('tellUsWhatYouNeed')}</Text>
                <View style={styles.startRow}>
                  <Text style={styles.startText}>{t('chooseYourSituation')}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#04121A" />
                </View>
              </>
            )}
          </LinearGradient>
        </Pressable>

        {currentStep ? (
          <Card onPress={() => go('Journey')} style={styles.stepCard}>
            <Text style={styles.cardKicker}>{t('currentStepLabel')}</Text>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <View style={styles.stepMeta}>
              <Ionicons name="time-outline" size={14} color={Colors.blue} />
              <Text style={styles.stepMetaText}>{t('estimated')} {currentStep.duration}</Text>
              <Ionicons name="business-outline" size={14} color={Colors.blue} style={{ marginLeft: Spacing.md }} />
              <Text style={styles.stepMetaText}>{currentStep.organization}</Text>
            </View>
          </Card>
        ) : data ? (
          <Card style={styles.stepCard}>
            <Text style={styles.cardKicker}>{t('journeyCompleteLabel')}</Text>
            <Text style={styles.stepTitle}>{t('journeyCompleteEveryStep')} {data.title}.</Text>
          </Card>
        ) : null}

        <SectionTitle>{t('todaysTasks')}</SectionTitle>
        <Card>
          {tasks.map((task, i) => (
            <Pressable
              key={task.id}
              onPress={() => toggleTask(task.id)}
              style={[
                styles.task,
                task.done && styles.taskDone,
                i < tasks.length - 1 && styles.taskDivider,
              ]}
            >
              <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
                {task.done ? <Ionicons name="checkmark" size={14} color="#04121A" /> : null}
              </View>
              <Text style={[styles.taskText, task.done && styles.taskTextDone]}>
                {getTaskTitle(t, task.id, task.title)}
              </Text>
            </Pressable>
          ))}
        </Card>

        <Pressable style={styles.eligBanner} onPress={() => go('Eligibility')}>
          <View style={styles.eligIcon}>
            <Ionicons name="shield-checkmark" size={20} color="#04121A" />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.eligTitle}>{t('checkYourEligibility')}</Text>
            <Text style={styles.eligSub}>{t('checkEligibilityDesc')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.blue} />
        </Pressable>

        <SectionTitle right={<Pressable onPress={() => go('AI')}><Text style={styles.viewAll}>{t('allTools')}</Text></Pressable>}>
          {t('quickAiTools')}
        </SectionTitle>
        <View style={styles.toolGrid}>
          {AI_TOOL_KEYS.map((tool) => (
            <Pressable key={tool.route} style={styles.tool} onPress={() => go(tool.route)}>
              <View style={[styles.toolIcon, { borderColor: tool.accent }]}>
                <Ionicons name={tool.icon} size={18} color={tool.accent} />
              </View>
              <Text style={styles.toolText} numberOfLines={1}>
                {t(tool.titleKey)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Body>
    </Screen>
  );
};

const styles = StyleSheet.create({
  greeting: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4, marginBottom: Spacing.md },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 8 as unknown as number, marginBottom: Spacing.sm },
  syncText: { color: Colors.blue, fontSize: FontSize.xs },
  syncWarn: { color: Colors.warning, fontSize: FontSize.xs, marginBottom: Spacing.sm },

  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  deadlineDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  deadlineText: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600', flex: 1 },

  journeyCard: { borderRadius: Radius.lg, padding: Spacing.md },
  journeyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  journeyLabel: { color: '#04121A', fontSize: FontSize.xs, fontWeight: '800', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 },
  journeyPct: { color: '#04121A', fontSize: FontSize.lg, fontWeight: '900' },
  journeyName: { color: '#04121A', fontSize: FontSize.lg, fontWeight: '800', marginTop: 6, marginBottom: Spacing.sm },
  journeyBar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(4,18,26,0.25)', overflow: 'hidden' },
  journeyBarFill: { height: '100%', borderRadius: 4, backgroundColor: '#04121A' },
  startRow: { flexDirection: 'row', alignItems: 'center', gap: 6 as unknown as number, marginTop: Spacing.sm },
  startText: { color: '#04121A', fontSize: FontSize.sm, fontWeight: '800' },

  stepCard: { marginTop: Spacing.md },
  cardKicker: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  stepTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', marginTop: 6 },
  stepMeta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, flexWrap: 'wrap' },
  stepMetaText: { color: Colors.textSecondary, fontSize: FontSize.xs, marginLeft: 6 },

  task: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginHorizontal: -Spacing.sm,
    borderRadius: Radius.sm,
  },
  taskDone: { backgroundColor: 'rgba(46,230,166,0.08)' },
  taskDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  taskText: { color: Colors.textPrimary, fontSize: FontSize.sm, flex: 1 },
  taskTextDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },

  viewAll: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '600' },
  eligBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.blue,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  eligIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eligTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
  eligSub: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tool: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  toolIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    borderWidth: 1,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  toolText: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '600', flex: 1 },
});
