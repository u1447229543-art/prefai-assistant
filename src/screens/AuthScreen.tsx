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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Gradients, Radius, Spacing, glow } from '../constants/colors';
import { Screen, Body, NeonButton } from '../components/ui';
import { useApp } from '../context/AppContext';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  dateOfBirth: '',
  nationality: '',
  idNumber: '',
  phone: '',
  address: '',
};

export const AuthScreen: React.FC = () => {
  const { login, register, t } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';
  const set = (key: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setError(null);
    if (!form.email.includes('@') || form.password.length < 4) {
      setError('Enter a valid email and a password of at least 4 characters.');
      return;
    }
    if (isRegister) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setError('Please enter your first and last name.');
        return;
      }
      if (form.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth.trim())) {
        setError('Date of birth must be in the format YYYY-MM-DD.');
        return;
      }
    }
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Body contentContainerStyle={!isRegister ? { flexGrow: 1, justifyContent: 'center' } : undefined}>
          <View style={styles.logoWrap}>
            <LinearGradient colors={Gradients.french} style={[styles.logo, glow(Colors.blue, 16)]}>
              <Text style={styles.logoText}>PA</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title}>{isRegister ? t('createAccount') : t('welcomeBack')}</Text>
          <Text style={styles.subtitle}>{t('tagline')}</Text>

          <View style={styles.form}>
            {isRegister ? (
              <>
                <Text style={styles.sectionLabel}>Account</Text>
                <Field
                  icon="mail-outline"
                  placeholder={t('email')}
                  value={form.email}
                  onChangeText={set('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Field
                  icon="lock-closed-outline"
                  placeholder={t('password')}
                  value={form.password}
                  onChangeText={set('password')}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Text style={styles.sectionLabel}>Personal details</Text>
                <Field
                  icon="person-outline"
                  placeholder="First name (Prénom)"
                  value={form.firstName}
                  onChangeText={set('firstName')}
                  autoCapitalize="words"
                />
                <Field
                  icon="person-outline"
                  placeholder="Last name (Nom de famille)"
                  value={form.lastName}
                  onChangeText={set('lastName')}
                  autoCapitalize="words"
                />
                <Field
                  icon="calendar-outline"
                  placeholder="Date of birth — YYYY-MM-DD (Date de naissance)"
                  value={form.dateOfBirth}
                  onChangeText={set('dateOfBirth')}
                  keyboardType="numbers-and-punctuation"
                />
                <Field
                  icon="flag-outline"
                  placeholder="Nationality (Nationalité)"
                  value={form.nationality}
                  onChangeText={set('nationality')}
                  autoCapitalize="words"
                />
                <Field
                  icon="card-outline"
                  placeholder="National ID / Passport number"
                  value={form.idNumber}
                  onChangeText={set('idNumber')}
                  autoCapitalize="characters"
                />
                <Field
                  icon="call-outline"
                  placeholder="Phone number"
                  value={form.phone}
                  onChangeText={set('phone')}
                  keyboardType="phone-pad"
                />
                <Field
                  icon="home-outline"
                  placeholder="Address in France (Adresse)"
                  value={form.address}
                  onChangeText={set('address')}
                  multiline
                />
                <Text style={styles.privacyNote}>
                  🔒 Stored only on your device and used to auto-fill your letters & documents.
                </Text>
              </>
            ) : (
              <>
                <Field
                  icon="mail-outline"
                  placeholder={t('email')}
                  value={form.email}
                  onChangeText={set('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Field
                  icon="lock-closed-outline"
                  placeholder={t('password')}
                  value={form.password}
                  onChangeText={set('password')}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <NeonButton
              title={isRegister ? t('register') : t('login')}
              onPress={submit}
              loading={loading}
              variant="blueRed"
              style={{ marginTop: Spacing.sm }}
            />

            <Pressable
              onPress={() => {
                setMode(isRegister ? 'login' : 'register');
                setError(null);
              }}
              style={styles.switch}
            >
              <Text style={styles.switchText}>{isRegister ? t('haveAccount') : t('noAccount')}</Text>
            </Pressable>
          </View>

          <Text style={styles.disclaimer}>{t('disclaimer')}</Text>
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
    <TextInput
      style={styles.input}
      placeholderTextColor={Colors.textMuted}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  logoWrap: { alignItems: 'center', marginBottom: Spacing.lg },
  logo: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#04121A', fontSize: 30, fontWeight: '900' },
  title: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  form: { gap: Spacing.md as unknown as number },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  privacyNote: { color: Colors.textMuted, fontSize: FontSize.xs, lineHeight: 16, marginBottom: Spacing.sm },
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
  error: { color: Colors.red, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  switch: { alignItems: 'center', marginTop: Spacing.lg },
  switchText: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '600' },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.xl,
    lineHeight: 16,
  },
});
