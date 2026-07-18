import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, Card, NeonButton } from '../components/ui';
import { useApp } from '../context/AppContext';
import { AdminOrg, AdminReply, aiGenerateReply, ApiError } from '../services/api';
import { copyOrShare } from '../services/clipboard';
import { promptUpgrade, fillTemplate } from '../utils/quotaPrompt';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ORGS: { id: AdminOrg; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'CAF', icon: 'home-outline' },
  { id: 'CPAM', icon: 'medkit-outline' },
  { id: 'Préfecture', icon: 'business-outline' },
  { id: 'Impôts', icon: 'cash-outline' },
  { id: 'Pôle Emploi', icon: 'briefcase-outline' },
  { id: 'ANEF', icon: 'globe-outline' },
  { id: 'Other', icon: 'ellipsis-horizontal' },
];

const TONES: { id: 'formal' | 'polite' | 'firm'; labelKey: 'formal' | 'polite' | 'firm' }[] = [
  { id: 'formal', labelKey: 'formal' },
  { id: 'polite', labelKey: 'polite' },
  { id: 'firm', labelKey: 'firm' },
];

export const AIReplyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { language, t, user, consumeAiRequest } = useApp();
  const [org, setOrg] = useState<AdminOrg>('CAF');
  const [tone, setTone] = useState<'formal' | 'polite' | 'firm'>('formal');
  const [situation, setSituation] = useState('');
  const [result, setResult] = useState<AdminReply | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!situation.trim()) return;
    const allowed = await consumeAiRequest();
    if (!allowed) {
      promptUpgrade(t, 'upgradeAiDailyMsg', () => navigation.navigate('Subscription'));
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const out = await aiGenerateReply({
        organization: org,
        situation: situation.trim(),
        tone,
        language,
        sender: user
          ? {
              fullName: user.name,
              dateOfBirth: user.dateOfBirth,
              nationality: user.nationality,
              idNumber: user.idNumber,
              phone: user.phone,
              address: user.address,
              email: user.email,
            }
          : undefined,
      });
      setResult(out);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setError(t('errSessionExpired'));
      } else if (e instanceof ApiError && e.status === 404) {
        setError(t('errAiUnavailable'));
      } else if (e instanceof ApiError && e.status === 502 && e.message.includes('OpenAI rejected the API key')) {
        setError(t('errInvalidServerKey'));
      } else {
        setError(String(e instanceof Error ? e.message : e));
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (result && (await copyOrShare(result.french))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Screen>
      <Header title={t('replyTitle')} onBack={() => navigation.goBack()} />
      <Body>
        <Text style={styles.label}>{t('selectOrg')}</Text>
        <View style={styles.orgGrid}>
          {ORGS.map((o) => {
            const active = o.id === org;
            return (
              <Pressable
                key={o.id}
                onPress={() => setOrg(o.id)}
                style={[styles.orgChip, active && styles.orgChipActive]}
              >
                <Ionicons name={o.icon} size={16} color={active ? Colors.blue : Colors.textSecondary} />
                <Text style={[styles.orgText, active && { color: Colors.blue }]}>{o.id}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>{t('tone')}</Text>
        <View style={styles.toneRow}>
          {TONES.map((tn) => {
            const active = tn.id === tone;
            return (
              <Pressable
                key={tn.id}
                onPress={() => setTone(tn.id)}
                style={[styles.toneChip, active && styles.toneChipActive]}
              >
                <Text style={[styles.toneText, active && { color: '#04121A' }]}>{t(tn.labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>{t('describeSituation')}</Text>
        <Text style={styles.anyLang}>{t('replyAnyLangHint')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('replySituationPlaceholder')}
          placeholderTextColor={Colors.textMuted}
          multiline
          value={situation}
          onChangeText={setSituation}
        />

        <NeonButton title={t('generateReply')} onPress={run} loading={loading} variant="blueRed" icon="create-outline" />

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.blue} />
            <Text style={styles.loadingText}>{t('replyDrafting')}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={18} color={Colors.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result ? (
          <>
            {/* Official French letter — this is what the user sends */}
            <Card style={{ marginTop: Spacing.lg }}>
              <View style={styles.resultHeader}>
                <View style={styles.letterLabelRow}>
                  <Text style={styles.flag}>🇫🇷</Text>
                  <Text style={styles.resultLabel}>{t('replyOfficialLetter')}</Text>
                </View>
                <Pressable onPress={copy} hitSlop={8} style={styles.copyBtn}>
                  <Ionicons
                    name={copied ? 'checkmark' : 'share-outline'}
                    size={16}
                    color={copied ? Colors.success : Colors.blue}
                  />
                  <Text style={[styles.copyText, copied && { color: Colors.success }]}>
                    {copied ? t('copied') : t('share')}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.letterBox}>
                <Text selectable style={styles.resultText}>
                  {result.french || '—'}
                </Text>
              </View>
            </Card>

            {/* Faithful full translation in the user's own (app) language */}
            {result.language !== 'French' ? (
              <Card style={{ marginTop: Spacing.md }}>
                <View style={styles.translationHeader}>
                  <Ionicons name="language-outline" size={16} color={Colors.blue} />
                  <Text style={styles.translationLabel}>
                    {fillTemplate(t('replyWhatItSays'), { language: result.language })}
                  </Text>
                </View>
                <Text style={styles.translationHint}>{t('replyTranslationHint')}</Text>
                <View style={styles.translationBox}>
                  <Text selectable style={styles.translationText}>
                    {result.translation || t('replyTranslationUnavailable')}
                  </Text>
                </View>
              </Card>
            ) : null}
          </>
        ) : null}
      </Body>
    </Screen>
  );
};

const styles = StyleSheet.create({
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm, marginTop: Spacing.sm },
  anyLang: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.sm, lineHeight: 17 },
  orgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm as unknown as number },
  orgChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  orgChipActive: { borderColor: Colors.blue, backgroundColor: Colors.glassBlue },
  orgText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginLeft: 6 },
  toneRow: { flexDirection: 'row', gap: Spacing.sm as unknown as number },
  toneChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  toneChipActive: { backgroundColor: Colors.blue, borderColor: Colors.blue },
  toneText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '700' },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    padding: Spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  loading: { marginTop: Spacing.lg, alignItems: 'center' },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: Spacing.sm },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  letterLabelRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  flag: { fontSize: 16, marginRight: 6 },
  resultLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '700' },
  copyBtn: { flexDirection: 'row', alignItems: 'center' },
  copyText: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '600', marginLeft: 4 },
  // Padded "paper" surfaces for comfortable reading of long letters.
  letterBox: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultText: { color: Colors.white, fontSize: 15, lineHeight: 24 },
  translationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  translationLabel: { color: Colors.blue, fontSize: FontSize.md, fontWeight: '700', marginLeft: 6 },
  translationHint: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.sm, lineHeight: 16 },
  translationBox: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  translationText: { color: Colors.textPrimary, fontSize: 15, lineHeight: 24 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,45,85,0.10)',
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  errorText: { color: Colors.white, fontSize: FontSize.sm, marginLeft: 8, flex: 1, lineHeight: 19 },
});
