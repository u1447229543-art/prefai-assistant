import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { ApiError, resetPassword } from '../services/api';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useApp();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setError(null);
    const trimmedCode = code.replace(/\D/g, '');
    if (trimmedCode.length !== 6) {
      setError(t('errResetFailed'));
      return;
    }
    if (password.length < 6) {
      setError(t('errPasswordMin'));
      return;
    }
    if (password !== confirm) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(trimmedCode, password);
      setSuccess(true);
      setTimeout(() => navigation.navigate('Auth'), 1200);
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
      <Header title={t('resetPasswordTitle')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Body contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          {success ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={40} color={Colors.success} />
              <Text style={styles.successText}>{t('resetPasswordSuccess')}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>{t('resetPasswordSubtitle')}</Text>
              <Field
                icon="keypad-outline"
                placeholder={t('resetCode')}
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              <Field
                icon="lock-closed-outline"
                placeholder={t('newPassword')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <Field
                icon="lock-closed-outline"
                placeholder={t('confirmPassword')}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                autoCapitalize="none"
              />
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={Colors.red} />
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}
              <NeonButton
                title={t('resetPassword')}
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

const Field: React.FC<React.ComponentProps<typeof TextInput> & { icon: keyof typeof Ionicons.glyphMap }> = ({
  icon,
  ...props
}) => (
  <View style={styles.field}>
    <Ionicons name={icon} size={18} color={Colors.textSecondary} />
    <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} {...props} />
  </View>
);

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
  successBox: { alignItems: 'center', paddingVertical: Spacing.xl },
  successText: {
    color: Colors.success,
    fontSize: FontSize.md,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
