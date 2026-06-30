import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Gradients, Radius, Spacing, glow } from '../constants/colors';
import { Screen, Body, Header, Card, SectionTitle, NeonButton, ProgressBar } from '../components/ui';
import { LanguageSelector } from '../components/LanguageSelector';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import * as storage from '../services/storage';
import { getJourney } from '../constants/journeys';
import { NATIONALITIES, Nationality, getNationalityFlag } from '../constants/nationalities';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    user,
    logout,
    language,
    setLanguage,
    updateProfile,
    refreshProfile,
    profileSaving,
    syncing,
    syncError,
    journey,
    journeyPercent,
    t,
  } = useApp();
  const { plan, remaining, isUnlimited, usage } = useSubscription();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    nationality: user?.nationality ?? '',
    city: user?.city ?? '',
    phone: user?.phone ?? '',
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [natOpen, setNatOpen] = useState(false);
  const [settings, setSettings] = useState<storage.AppSettings>({ notifications: true, darkMode: true });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        nationality: user.nationality ?? '',
        city: user.city ?? '',
        phone: user.phone ?? '',
      });
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      void refreshProfile();
    }, [refreshProfile])
  );

  useEffect(() => {
    storage.loadSettings().then(setSettings);
  }, []);

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const updateSetting = (key: keyof storage.AppSettings, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      storage.saveSettings(next);
      return next;
    });
  };

  const saveProfile = async () => {
    setSaveError(null);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : t('couldNotSaveProfile'));
    }
  };

  const confirmLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  const planName =
    plan.id === 'free' ? t('free') : plan.id === 'basic' ? t('planBasic') : t('planPro');

  const initials = `${form.firstName?.[0] ?? user?.name?.[0] ?? 'U'}${form.lastName?.[0] ?? ''}`.toUpperCase();
  const fullName = `${form.firstName} ${form.lastName}`.trim() || user?.name || t('userFallback');
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : '—';
  const journeyData = journey.journeyId ? getJourney(journey.journeyId) : null;

  return (
    <Screen>
      <Header title={t('profileTitle')} />
      <Body>
        {syncing ? (
          <View style={styles.syncBanner}>
            <ActivityIndicator size="small" color={Colors.blue} />
            <Text style={styles.syncText}>{t('syncingProfile')}</Text>
          </View>
        ) : null}
        {syncError ? (
          <View style={styles.warnBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color={Colors.warning} />
            <Text style={styles.warnText}>{syncError}</Text>
          </View>
        ) : null}
        {/* 1 — Header */}
        <View style={styles.headerCard}>
          <LinearGradient colors={Gradients.blueRed} style={[styles.avatar, glow(Colors.blue, 12)]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.natRow}>
            <Text style={styles.natFlag}>{getNationalityFlag(form.nationality)}</Text>
            <Text style={styles.natName}>{form.nationality || t('addYourNationality')}</Text>
          </View>
          <Text style={styles.memberSince}>{t('memberSince')} {memberSince}</Text>
        </View>

        {/* 2 — Journey info */}
        <Card style={styles.journeyCard}>
          <View style={styles.journeyTop}>
            <View style={styles.journeyIcon}>
              <Ionicons name={journeyData?.icon ?? 'map-outline'} size={18} color={Colors.blue} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={styles.journeyKicker}>{t('yourJourney')}</Text>
              <Text style={styles.journeyTitle}>{journeyData?.title ?? t('noJourneySelected')}</Text>
            </View>
            {journeyData ? <Text style={styles.journeyPct}>{journeyPercent}%</Text> : null}
          </View>
          {journeyData ? <View style={{ marginTop: Spacing.sm }}><ProgressBar percent={journeyPercent} /></View> : null}
          <Pressable style={styles.changeJourney} onPress={() => navigation.navigate('Journey' as never)}>
            <Ionicons name="swap-horizontal" size={16} color={Colors.blue} />
            <Text style={styles.changeJourneyText}>
              {journeyData ? t('changeJourney') : t('startJourney')}
            </Text>
          </Pressable>
        </Card>

        {/* 3 — Personal info (editable) */}
        <SectionTitle>{t('personalInformation')}</SectionTitle>
        <Card>
          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Label>{t('firstName')}</Label>
              <TextInput style={styles.input} value={form.firstName} onChangeText={set('firstName')} placeholder={t('firstName')} placeholderTextColor={Colors.textMuted} />
            </View>
            <View style={styles.fieldHalf}>
              <Label>{t('lastName')}</Label>
              <TextInput style={styles.input} value={form.lastName} onChangeText={set('lastName')} placeholder={t('lastName')} placeholderTextColor={Colors.textMuted} />
            </View>
          </View>

          <Label>{t('nationality')}</Label>
          <Pressable style={styles.select} onPress={() => setNatOpen(true)}>
            <Text style={styles.selectFlag}>{getNationalityFlag(form.nationality)}</Text>
            <Text style={[styles.selectText, !form.nationality && { color: Colors.textMuted }]}>
              {form.nationality || t('selectNationality')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
          </Pressable>

          <Label>{t('cityInFrance')}</Label>
          <TextInput style={styles.input} value={form.city} onChangeText={set('city')} placeholder={t('cityPlaceholder')} placeholderTextColor={Colors.textMuted} />

          <Label>{t('phoneOptional')}</Label>
          <TextInput style={styles.input} value={form.phone} onChangeText={set('phone')} placeholder="+33 6 12 34 56 78" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />

          <NeonButton
            title={saved ? t('savedSuccess') : t('saveChanges')}
            onPress={saveProfile}
            loading={profileSaving}
            variant={saved ? 'blue' : 'blueRed'}
            icon={saved ? 'checkmark' : 'save-outline'}
            style={{ marginTop: Spacing.sm }}
          />
          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
        </Card>

        {/* 4 — App settings */}
        <SectionTitle>{t('appSettings')}</SectionTitle>
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={20} color={Colors.blue} />
              <Text style={styles.settingText}>{t('language')}</Text>
            </View>
          </View>
          <LanguageSelector value={language} onChange={setLanguage} compact />
          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.blue} />
              <Text style={styles.settingText}>{t('notifications')}</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(v) => updateSetting('notifications', v)}
              trackColor={{ true: Colors.blue, false: Colors.border }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={Colors.blue} />
              <Text style={styles.settingText}>{t('darkMode')}</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(v) => updateSetting('darkMode', v)}
              trackColor={{ true: Colors.blue, false: Colors.border }}
              thumbColor={Colors.white}
            />
          </View>
        </Card>

        {/* 5 — Subscription */}
        <SectionTitle>{t('subscription')}</SectionTitle>
        <Card style={styles.subCard}>
          <View style={styles.subRow}>
            <View>
              <Text style={styles.subLabel}>{t('currentPlan')}</Text>
              <Text style={styles.subPlan}>{planName}</Text>
            </View>
            <View style={styles.planBadge}>
              <Ionicons name={plan.id === 'pro' ? 'star' : 'flash'} size={14} color={Colors.blue} />
              <Text style={styles.planBadgeText}>
                {plan.priceLabel}
                {plan.price > 0 ? t('perMonth') : ''}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: Spacing.md }}>
            <ProgressBar
              percent={isUnlimited ? 100 : (usage.documentsProcessed / (plan.documentLimit || 1)) * 100}
              height={6}
            />
          </View>
          <Text style={styles.usageText}>
            {isUnlimited
              ? t('unlimitedDocuments')
              : `${usage.documentsProcessed} ${t('of')} ${plan.documentLimit} ${t('documentsUsedThisMonth')}`}
          </Text>
          {plan.id !== 'pro' ? (
            <NeonButton
              title={t('upgrade')}
              onPress={() => navigation.navigate('Subscription' as never)}
              variant="blue"
              icon="rocket-outline"
              style={{ marginTop: Spacing.md }}
            />
          ) : null}
        </Card>

        {/* 6 — Logout */}
        <Pressable onPress={confirmLogout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.red} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </Pressable>

        <Text style={styles.disclaimer}>{t('disclaimer')}</Text>
      </Body>

      {/* Nationality picker */}
      <Modal visible={natOpen} transparent animationType="slide" onRequestClose={() => setNatOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setNatOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{t('selectNationality')}</Text>
          <FlatList
            data={NATIONALITIES}
            keyExtractor={(i) => i.name}
            contentContainerStyle={{ paddingBottom: Spacing.xl }}
            renderItem={({ item }: { item: Nationality }) => {
              const selected = item.name === form.nationality;
              return (
                <Pressable
                  style={[styles.natOption, selected && styles.natOptionSelected]}
                  onPress={() => {
                    set('nationality')(item.name);
                    setNatOpen(false);
                  }}
                >
                  <Text style={styles.selectFlag}>{item.flag}</Text>
                  <Text style={styles.natOptionText}>{item.name}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={22} color={Colors.blue} /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </Screen>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.label}>{children}</Text>
);

const styles = StyleSheet.create({
  // Header
  headerCard: { alignItems: 'center', marginBottom: Spacing.lg },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 as unknown as number,
    backgroundColor: Colors.glassBlue,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  syncText: { color: Colors.blue, fontSize: FontSize.sm },
  warnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 as unknown as number,
    backgroundColor: 'rgba(255,180,0,0.10)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  warnText: { color: Colors.warning, fontSize: FontSize.xs, flex: 1 },
  saveError: { color: Colors.red, fontSize: FontSize.sm, marginTop: Spacing.sm },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#04121A', fontSize: FontSize.xxl, fontWeight: '900' },
  name: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', marginTop: Spacing.sm },
  natRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  natFlag: { fontSize: 18, marginRight: 6 },
  natName: { color: Colors.textSecondary, fontSize: FontSize.sm },
  memberSince: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 4 },

  // Journey card
  journeyCard: { marginBottom: Spacing.sm },
  journeyTop: { flexDirection: 'row', alignItems: 'center' },
  journeyIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.glassBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyKicker: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  journeyTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', marginTop: 2 },
  journeyPct: { color: Colors.blue, fontSize: FontSize.lg, fontWeight: '800' },
  changeJourney: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 as unknown as number, marginTop: Spacing.md, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.blue },
  changeJourneyText: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '700' },

  // Personal info
  label: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600', marginBottom: 6, marginTop: Spacing.sm },
  fieldRow: { flexDirection: 'row', gap: Spacing.sm as unknown as number },
  fieldHalf: { flex: 1 },
  input: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  selectFlag: { fontSize: 20, marginRight: Spacing.sm },
  selectText: { color: Colors.white, fontSize: FontSize.md, flex: 1 },

  // Settings
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm + 2 },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { color: Colors.textPrimary, fontSize: FontSize.md, marginLeft: Spacing.md },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },

  // Subscription
  subCard: { marginBottom: Spacing.sm },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  subPlan: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', marginTop: 2 },
  planBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.glassBlue, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill },
  planBadgeText: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '700', marginLeft: 4 },
  usageText: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 6 },

  // Logout
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.red },
  logoutText: { color: Colors.red, fontSize: FontSize.md, fontWeight: '700', marginLeft: 8 },
  disclaimer: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 16 },

  // Nationality sheet
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: { backgroundColor: Colors.cardElevated, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, maxHeight: '75%', borderTopWidth: 1, borderColor: Colors.border },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.md },
  sheetTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.sm },
  natOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderRadius: Radius.md },
  natOptionSelected: { backgroundColor: Colors.glassBlue },
  natOptionText: { color: Colors.white, fontSize: FontSize.md, flex: 1, marginLeft: Spacing.md },
});
