import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Gradients, Radius, Spacing, glow } from '../constants/colors';
import { Screen, Body, Header, Card, SectionTitle } from '../components/ui';
import { LanguageSelector } from '../components/LanguageSelector';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import * as storage from '../services/storage';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, logout, language, setLanguage, t } = useApp();
  const { plan, remaining, isUnlimited, usage } = useSubscription();
  const [reminders, setReminders] = React.useState(true);

  const confirmLogout = () => {
    Alert.alert(t('logout'), 'Are you sure you want to log out?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  const clearData = () => {
    Alert.alert('Clear all data', 'This removes documents, deadlines and chat history from this device.', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await storage.clearAll();
          logout();
        },
      },
    ]);
  };

  return (
    <Screen>
      <Header title={t('profileTitle')} />
      <Body>
        {/* Profile header */}
        <Pressable style={styles.profileRow} onPress={() => navigation.navigate('EditProfile')}>
          <LinearGradient colors={Gradients.blueRed} style={[styles.avatar, glow(Colors.blue, 12)]}>
            <Text style={styles.avatarText}>{(user?.name?.[0] ?? 'U').toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.name}>{user?.name ?? 'User'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
          </View>
          <View style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color={Colors.blue} />
          </View>
        </Pressable>

        {!user?.idNumber || !user?.address ? (
          <Pressable style={styles.completeBanner} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="information-circle" size={18} color={Colors.warning} />
            <Text style={styles.completeText}>
              Complete your profile so letters and documents auto-fill your details.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
          </Pressable>
        ) : null}

        {/* Subscription card */}
        <Pressable onPress={() => navigation.navigate('Subscription')}>
          <Card style={styles.subCard}>
            <View style={styles.subRow}>
              <View>
                <Text style={styles.subLabel}>{t('currentPlan')}</Text>
                <Text style={styles.subPlan}>{plan.name}</Text>
              </View>
              <View style={styles.planBadge}>
                <Ionicons name={plan.id === 'pro' ? 'star' : 'flash'} size={14} color={Colors.blue} />
                <Text style={styles.planBadgeText}>{plan.priceLabel}{plan.price > 0 ? t('perMonth') : ''}</Text>
              </View>
            </View>
            <View style={styles.usageBar}>
              <View
                style={[
                  styles.usageFill,
                  { width: isUnlimited ? '100%' : `${Math.min(100, (usage.documentsProcessed / (plan.documentLimit || 1)) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.usageText}>
              {isUnlimited
                ? 'Unlimited documents'
                : `${remaining} of ${plan.documentLimit} ${t('documentsThisMonth')}`}
            </Text>
            <View style={styles.manageRow}>
              <Text style={styles.manageText}>{t('manageSubscription')}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.blue} />
            </View>
          </Card>
        </Pressable>

        {/* Language */}
        <SectionTitle>{t('language')}</SectionTitle>
        <LanguageSelector value={language} onChange={setLanguage} label={t('language')} />

        {/* Settings */}
        <SectionTitle>{t('settings')}</SectionTitle>
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.blue} />
              <Text style={styles.settingText}>Deadline reminders</Text>
            </View>
            <Switch
              value={reminders}
              onValueChange={setReminders}
              trackColor={{ true: Colors.blue, false: Colors.border }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={styles.divider} />
          <SettingLink icon="help-circle-outline" label="Help & FAQ" onPress={() => navigation.navigate('Guides')} />
          <View style={styles.divider} />
          <SettingLink icon="shield-checkmark-outline" label="Privacy & data" onPress={clearData} danger />
        </Card>

        {/* Logout */}
        <Pressable onPress={confirmLogout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.red} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </Pressable>

        <Text style={styles.disclaimer}>{t('disclaimer')}</Text>
      </Body>
    </Screen>
  );
};

const SettingLink: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}> = ({ icon, label, onPress, danger }) => (
  <Pressable style={styles.settingRow} onPress={onPress}>
    <View style={styles.settingLeft}>
      <Ionicons name={icon} size={20} color={danger ? Colors.red : Colors.blue} />
      <Text style={[styles.settingText, danger && { color: Colors.red }]}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
  </Pressable>
);

const styles = StyleSheet.create({
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#04121A', fontSize: FontSize.xl, fontWeight: '900' },
  name: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800' },
  email: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,176,32,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.4)',
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  completeText: { color: Colors.textPrimary, fontSize: FontSize.xs, flex: 1, marginHorizontal: 8, lineHeight: 16 },
  subCard: { marginBottom: Spacing.sm },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  subPlan: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', marginTop: 2 },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  planBadgeText: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '700', marginLeft: 4 },
  usageBar: { height: 6, borderRadius: 3, backgroundColor: Colors.border, marginTop: Spacing.md, overflow: 'hidden' },
  usageFill: { height: '100%', backgroundColor: Colors.blue, borderRadius: 3 },
  usageText: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 6 },
  manageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: Spacing.sm },
  manageText: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '600', marginRight: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm + 2 },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { color: Colors.textPrimary, fontSize: FontSize.md, marginLeft: Spacing.md },
  divider: { height: 1, backgroundColor: Colors.border },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.red,
  },
  logoutText: { color: Colors.red, fontSize: FontSize.md, fontWeight: '700', marginLeft: 8 },
  disclaimer: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 16 },
});
