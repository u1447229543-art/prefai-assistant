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
import { NationalityPicker } from '../components/NationalityPicker';
import { DateOfBirthPicker, buildDateOfBirth } from '../components/DateOfBirthPicker';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  nationality: '',
  idNumber: '',
  phone: '',
  address: '',
};

export const AuthScreen: React.FC = () => {
  const { login, register, t, authLoading } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState(EMPTY_FORM);
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';
  const set = (key: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const resetRegisterForm = () => {
    setForm(EMPTY_FORM);
    setDobDay('');
    setDobMonth('');
    setDobYear('');
    setError(null);
  };

  const validateRegister = (): string | null => {
    if (!form.firstName.trim()) return t('errFirstNameRequired');
    if (!form.lastName.trim()) return t('errLastNameRequired');
    if (!form.email.trim() || !form.email.includes('@')) return t('errEmailRequired');
    if (form.password.length < 6) return t('errPasswordMin');
    const partialDob = !!(dobDay || dobMonth || dobYear);
    const fullDob = !!(dobDay && dobMonth && dobYear);
    if (partialDob && !fullDob) return t('errDobIncomplete');
    return null;
  };

  const validateLogin = (): string | null => {
    if (!form.email.trim() || !form.email.includes('@')) return t('errEmailInvalid');
    if (form.password.length < 6) return t('errPasswordMin');
    return null;
  };

  const submit = async () => {
    setError(null);

    const validationError = isRegister ? validateRegister() : validateLogin();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          dateOfBirth: buildDateOfBirth(dobDay, dobMonth, dobYear),
          nationality: form.nationality.trim(),
          idNumber: form.idNumber.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        });
        // RootNavigator switches to Main automatically when isAuthenticated becomes true.
      } else {
        await login(form.email.trim(), form.password);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(isRegister ? t('errRegisterFailed') : t('errLoginFailed'));
      }
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
                <Text style={styles.sectionLabel}>{t('required')}</Text>
                <Field
                  icon="person-outline"
                  placeholder={`${t('firstNamePlaceholder')} *`}
                  value={form.firstName}
                  onChangeText={set('firstName')}
                  autoCapitalize="words"
                />
                <Field
                  icon="person-outline"
                  placeholder={`${t('lastNamePlaceholder')} *`}
                  value={form.lastName}
                  onChangeText={set('lastName')}
                  autoCapitalize="words"
                />
                <Field
                  icon="mail-outline"
                  placeholder={`${t('email')} *`}
                  value={form.email}
                  onChangeText={set('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Field
                  icon="lock-closed-outline"
                  placeholder={`${t('password')} * ${t('passwordMinHint')}`}
                  value={form.password}
                  onChangeText={set('password')}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Text style={styles.sectionLabel}>{t('optionalDetails')}</Text>
                <DateOfBirthPicker
                  day={dobDay}
                  month={dobMonth}
                  year={dobYear}
                  onChangeDay={setDobDay}
                  onChangeMonth={setDobMonth}
                  onChangeYear={setDobYear}
                />
                <NationalityPicker
                  value={form.nationality}
                  onChange={set('nationality')}
                  placeholder={t('nationalityOptional')}
                />
                <Field
                  icon="card-outline"
                  placeholder={t('idNumberOptional')}
                  value={form.idNumber}
                  onChangeText={set('idNumber')}
                  autoCapitalize="characters"
                />
                <Field
                  icon="call-outline"
                  placeholder={t('phoneOptional')}
                  value={form.phone}
                  onChangeText={set('phone')}
                  keyboardType="phone-pad"
                />
                <Field
                  icon="home-outline"
                  placeholder={t('addressInFranceOptional')}
                  value={form.address}
                  onChangeText={set('address')}
                  multiline
                />
                <Text style={styles.privacyNote}>{t('profilePrivacyNote')}</Text>
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

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.red} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <NeonButton
              title={isRegister ? t('register') : t('login')}
              onPress={submit}
              loading={loading || authLoading}
              variant="blueRed"
              style={{ marginTop: Spacing.sm }}
            />

            <Pressable
              onPress={() => {
                setMode(isRegister ? 'login' : 'register');
                resetRegisterForm();
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
