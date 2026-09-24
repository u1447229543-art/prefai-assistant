import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, NeonButton, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';

type Phase = 'form' | 'success';

function resolvePlatform(): 'ios' | 'android' | 'web' {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

function resolveAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    (Constants as { nativeAppVersion?: string }).nativeAppVersion ??
    ''
  );
}

export const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useApp();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('form');

  const submit = async () => {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.submitFeedback({
        message: trimmed,
        appVersion: resolveAppVersion(),
        platform: resolvePlatform(),
      });
      setPhase('success');
    } catch (e) {
      setError(e instanceof api.ApiError ? e.message : t('feedbackError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <Header title={t('feedbackTitle')} onBack={() => navigation.goBack()} />
      <Body>
        {phase === 'success' ? (
          <Card style={styles.card}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.blue} />
            </View>
            <Text style={styles.successText}>{t('feedbackSuccess')}</Text>
            <NeonButton
              title={t('feedbackDone')}
              onPress={() => navigation.goBack()}
              variant="blue"
              style={{ marginTop: Spacing.lg }}
            />
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.hint}>{t('feedbackDesc')}</Text>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={(v) => {
                setMessage(v);
                setError(null);
              }}
              placeholder={t('feedbackPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
              maxLength={4000}
              editable={!submitting}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <NeonButton
              title={t('feedbackSubmit')}
              onPress={submit}
              loading={submitting}
              disabled={!message.trim() || submitting}
              variant="blue"
              icon="send-outline"
              style={{ marginTop: Spacing.md }}
            />
          </Card>
        )}
      </Body>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: { marginTop: Spacing.sm },
  hint: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  input: {
    minHeight: 160,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  error: {
    color: Colors.red,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  successIcon: { alignItems: 'center', marginBottom: Spacing.md },
  successText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
});
