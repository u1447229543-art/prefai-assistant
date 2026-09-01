import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, NeonButton } from '../components/ui';
import { useApp } from '../context/AppContext';
import { ApiError, forgotPassword } from '../services/api';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !email.includes('@')) {
      setError(t('errEmailInvalid'));
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(t('errResetFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <Header title={t('forgotPasswordTitle')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Body contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          {sent ? (
            <View style={styles.sentBox}>
              <Ionicons name="mail-outline" size={40} color={Colors.blue} />
              <Text style={styles.sentText}>{t('forgotPasswordSent')}</Text>
              <NeonButton
                title={t('enterResetCode')}
                onPress={() => navigation.navigate('ResetPassword')}
                variant="blue"
                style={{ marginTop: Spacing.lg }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>{t('forgotPasswordSubtitle')}</Text>
              <View style={styles.field}>
                <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder={t('email')}
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={Colors.red} />
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}
              <NeonButton
                title={t('sendResetCode')}
                onPress={submit}
                loading={loading}
                variant="blueRed"
              />
            </>
          )}
        </Body>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.md,
    paddingVertical: 14,
    marginLeft: Spacing.sm,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8 as unknown as number,
    backgroundColor: 'rgba(255,45,85,0.10)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  error: { color: Colors.red, fontSize: FontSize.sm, flex: 1, lineHeight: 20 },
  sentBox: { alignItems: 'center', paddingVertical: Spacing.xl },
  sentText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
