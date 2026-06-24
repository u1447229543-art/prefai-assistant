import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, NeonButton } from '../components/ui';
import { useApp } from '../context/AppContext';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useApp();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    dateOfBirth: user?.dateOfBirth ?? '',
    nationality: user?.nationality ?? '',
    idNumber: user?.idNumber ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
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
      <Header title="Edit Profile" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Body>
          <Text style={styles.note}>
            This information auto-fills your generated letters and documents. It is stored only on this device.
          </Text>

          <Label>First name (Prénom)</Label>
          <Field icon="person-outline" value={form.firstName} onChangeText={set('firstName')} placeholder="Prénom" autoCapitalize="words" />

          <Label>Last name (Nom de famille)</Label>
          <Field icon="person-outline" value={form.lastName} onChangeText={set('lastName')} placeholder="Nom de famille" autoCapitalize="words" />

          <Label>Email</Label>
          <Field icon="mail-outline" value={form.email} onChangeText={set('email')} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />

          <Label>Date of birth (Date de naissance)</Label>
          <Field icon="calendar-outline" value={form.dateOfBirth} onChangeText={set('dateOfBirth')} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />

          <Label>Nationality (Nationalité)</Label>
          <Field icon="flag-outline" value={form.nationality} onChangeText={set('nationality')} placeholder="e.g. Georgian" autoCapitalize="words" />

          <Label>National ID / Passport number</Label>
          <Field icon="card-outline" value={form.idNumber} onChangeText={set('idNumber')} placeholder="ID / Passport" autoCapitalize="characters" />

          <Label>Phone number</Label>
          <Field icon="call-outline" value={form.phone} onChangeText={set('phone')} placeholder="+33 6 12 34 56 78" keyboardType="phone-pad" />

          <Label>Address in France (Adresse)</Label>
          <Field icon="home-outline" value={form.address} onChangeText={set('address')} placeholder="Street, postal code, city" multiline />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <NeonButton
            title={saved ? 'Saved ✓' : 'Save profile'}
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
  label: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600', marginBottom: 6, marginTop: Spacing.sm },
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
