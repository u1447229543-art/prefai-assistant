import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, NeonButton } from '../components/ui';
import { useApp } from '../context/AppContext';
import type { UserStatus } from '../services/storage';
import type { TranslationKey } from '../i18n/translations';

const STATUS_OPTIONS: { id: UserStatus; labelKey: TranslationKey }[] = [
  { id: 'student', labelKey: 'statusStudent' },
  { id: 'asylum_seeker', labelKey: 'statusAsylumSeeker' },
  { id: 'entrepreneur', labelKey: 'statusEntrepreneur' },
  { id: 'employee', labelKey: 'statusEmployee' },
  { id: 'job_seeker', labelKey: 'statusJobSeeker' },
  { id: 'other', labelKey: 'statusOther' },
  { id: 'unknown', labelKey: 'statusUnknown' },
];

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile, t } = useApp();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    dateOfBirth: user?.dateOfBirth ?? '',
    nationality: user?.nationality ?? '',
    idNumber: user?.idNumber ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    status: (user?.status ?? 'unknown') as UserStatus,
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setError(null);
    if (form.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth.trim())) {
      setError('Date of birth must be in the format YYYY-MM-DD.');
      return;
    }
    await updateProfile(form);
    setSaved(true);
    setTimeout(() => navigation.goBack(), 500);
  };

  return (
    <Screen>
      <Header title={t('editProfile')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Body>
          <Text style={styles.note}>{t('profilePrivacyNote')}</Text>

          <Label>{t('yourSituation')}</Label>
          <Text style={styles.hint}>{t('yourSituationHint')}</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => {
              const active = form.status === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setForm((f) => ({ ...f, status: opt.id }));
                    setSaved(false);
                  }}
                  style={[styles.statusChip, active && styles.statusChipActive]}
                >
                  <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                    {t(opt.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Label>{t('firstName')}</Label>
          <Field icon="person-outline" value={form.firstName} onChangeText={set('firstName')} placeholder={t('firstNamePlaceholder')} autoCapitalize="words" />

          <Label>{t('lastName')}</Label>
          <Field icon="person-outline" value={form.lastName} onChangeText={set('lastName')} placeholder={t('lastNamePlaceholder')} autoCapitalize="words" />

          <Label>{t('email')}</Label>
          <Field icon="mail-outline" value={form.email} onChangeText={set('email')} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />

          <Label>{t('dateOfBirth')}</Label>
          <Field icon="calendar-outline" value={form.dateOfBirth} onChangeText={set('dateOfBirth')} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />

          <Label>{t('nationality')}</Label>
          <Field icon="flag-outline" value={form.nationality} onChangeText={set('nationality')} placeholder={t('addYourNationality')} autoCapitalize="words" />

          <Label>{t('idNumber')}</Label>
          <Field icon="card-outline" value={form.idNumber} onChangeText={set('idNumber')} placeholder={t('idNumberOptional')} autoCapitalize="characters" />

          <Label>{t('phoneOptional')}</Label>
          <Field icon="call-outline" value={form.phone} onChangeText={set('phone')} placeholder="+33 6 12 34 56 78" keyboardType="phone-pad" />

          <Label>{t('address')}</Label>
          <Field icon="home-outline" value={form.address} onChangeText={set('address')} placeholder={t('addressInFranceOptional')} multiline />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <NeonButton
            title={saved ? t('savedSuccess') : t('saveProfile')}
            onPress={save}
            variant={saved ? 'blue' : 'blueRed'}
            icon={saved ? 'checkmark' : 'save-outline'}
            style={{ marginTop: Spacing.md }}
          />
        </Body>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.label}>{children}</Text>
);

const Field: React.FC<
  React.ComponentProps<typeof TextInput> & { icon: keyof typeof Ionicons.glyphMap }
> = ({ icon, ...props }) => (
  <View style={[styles.field, props.multiline && styles.fieldMultiline]}>
    <Ionicons name={icon} size={18} color={Colors.textSecondary} style={props.multiline ? { marginTop: 2 } : undefined} />
    <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} {...props} />
  </View>
);

const styles = StyleSheet.create({
  note: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  hint: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.sm, lineHeight: 16 },
  label: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600', marginBottom: 6, marginTop: Spacing.sm },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    marginBottom: 4,
  },
  statusChipActive: { borderColor: Colors.blue, backgroundColor: Colors.glassBlue },
  statusChipText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' },
  statusChipTextActive: { color: Colors.blue },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  fieldMultiline: { alignItems: 'flex-start', paddingTop: 10 },
  input: { flex: 1, color: Colors.white, fontSize: FontSize.md, paddingVertical: 14, marginLeft: Spacing.sm },
  error: { color: Colors.red, fontSize: FontSize.sm, marginTop: Spacing.sm },
});
