import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, NeonButton, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';
import { maybeRegisterExpoPushToken } from '../services/pushNotifications';

type Phase = 'loading' | 'quiz' | 'result' | 'error';

export const DailyQuestionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, language } = useApp();
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<api.DailyQuestionPublic | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<api.DailyQuestionAnswerResult | null>(null);

  const load = useCallback(async () => {
    setPhase('loading');
    setError(null);
    setResult(null);
    try {
      const { question: q } = await api.getTodaysDailyQuestion(language);
      setQuestion(q);
      setPhase('quiz');
    } catch (e) {
      setError(e instanceof api.ApiError ? e.message : t('error'));
      setPhase('error');
    }
  }, [t, language]);

  useFocusEffect(
    useCallback(() => {
      void load();
      // Same registerExpoPushToken path as auth / expiry — only if undetermined or already granted.
      void maybeRegisterExpoPushToken();
    }, [load])
  );

  const submit = async (userAnswer: boolean) => {
    if (!question || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.submitDailyQuestionAnswer(
        question.questionNumber,
        userAnswer,
        language
      );
      setResult(res);
      setPhase('result');
    } catch (e) {
      setError(e instanceof api.ApiError ? e.message : t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <Header title={t('dailyQuestionTitle')} onBack={() => navigation.goBack()} />
      <Body>
        {phase === 'loading' ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.blue} />
          </View>
        ) : null}

        {phase === 'error' ? (
          <Card style={styles.card}>
            <Text style={styles.errorText}>{error || t('error')}</Text>
            <NeonButton title={t('retry')} icon="refresh-outline" onPress={() => void load()} />
          </Card>
        ) : null}

        {phase === 'quiz' && question ? (
          <Card style={styles.card}>
            <Text style={styles.meta}>
              #{question.questionNumber} · {question.category}
            </Text>
            <Text style={styles.prompt}>{t('dailyQuestionToday')}</Text>
            <Text style={styles.question}>{question.question}</Text>

            <NeonButton
              title={t('dailyQuestionTrue')}
              icon="checkmark-circle-outline"
              variant="blue"
              onPress={() => void submit(true)}
              loading={submitting}
              disabled={submitting}
              style={{ marginTop: Spacing.lg }}
            />
            <NeonButton
              title={t('dailyQuestionFalse')}
              icon="close-circle-outline"
              variant="ghost"
              onPress={() => void submit(false)}
              loading={submitting}
              disabled={submitting}
              style={{ marginTop: Spacing.sm }}
            />
          </Card>
        ) : null}

        {phase === 'result' && result && question ? (
          <Card style={styles.card}>
            <View style={styles.resultHead}>
              <Ionicons
                name={result.correct ? 'checkmark-circle' : 'close-circle'}
                size={28}
                color={result.correct ? Colors.success : Colors.red}
              />
              <Text
                style={[
                  styles.resultTitle,
                  { color: result.correct ? Colors.success : Colors.red },
                ]}
              >
                {result.correct ? t('dailyQuestionCorrect') : t('dailyQuestionIncorrect')}
              </Text>
            </View>
            <Text style={styles.questionReplay}>{question.question}</Text>
            <Text style={styles.explanation}>{result.explanation}</Text>
            <Text style={styles.sourceLabel}>{t('dailyQuestionSource')}</Text>
            {result.sourceUrl ? (
              <Pressable
                onPress={() => void Linking.openURL(result.sourceUrl!)}
                style={styles.sourceRow}
                hitSlop={8}
              >
                <Ionicons name="open-outline" size={14} color={Colors.blue} />
                <Text style={styles.sourceLink}>{result.sourceName}</Text>
              </Pressable>
            ) : (
              <Text style={styles.sourceName}>{result.sourceName}</Text>
            )}
            <Text style={styles.tomorrow}>{t('dailyQuestionComeBack')}</Text>
          </Card>
        ) : null}
      </Body>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { paddingVertical: Spacing.xl, alignItems: 'center' },
  card: { marginTop: Spacing.md },
  meta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  prompt: {
    color: Colors.blue,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  question: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '800',
    lineHeight: 30,
  },
  questionReplay: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  errorText: { color: Colors.red, marginBottom: Spacing.md },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultTitle: { fontSize: FontSize.lg, fontWeight: '800' },
  explanation: {
    color: Colors.white,
    fontSize: FontSize.md,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  sourceLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: Spacing.lg,
    marginBottom: 4,
  },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sourceLink: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '600' },
  sourceName: { color: Colors.textSecondary, fontSize: FontSize.sm },
  tomorrow: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
});
