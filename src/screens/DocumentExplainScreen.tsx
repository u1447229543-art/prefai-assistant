import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, Card, NeonButton, ScrollableText } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import { pickDocument, readDocumentText, toStoredDocument, PickedDocument } from '../services/documents';
import { explainDocument, DocumentExplanation } from '../services/openai';
import { CATEGORY_TO_BACKEND } from '../services/api';
import * as storage from '../services/storage';
import { promptUpgrade, fillTemplate } from '../utils/quotaPrompt';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const DocumentExplainScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { language, t, uploadDocument, addCachedDocument } = useApp();
  const {
    registerDocumentUse,
    remaining,
    isUnlimited,
    consumeAiRequest,
    canAddDocument,
    isInTrial,
    trialDaysLeft,
    aiRemainingToday,
  } = useSubscription();

  const [picked, setPicked] = useState<PickedDocument | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goUpgrade = () => navigation.navigate('Subscription');

  const onPick = async () => {
    try {
      const doc = await pickDocument();
      if (doc) {
        setPicked(doc);
        setResult(null);
      }
    } catch {
      Alert.alert(t('error'), t('couldNotOpenPicker'));
    }
  };

  const analyze = async () => {
    const hasInput = picked || pastedText.trim().length > 0;
    if (!hasInput) {
      Alert.alert(t('upload'), t('explainUpload'));
      return;
    }

    if (picked && !canAddDocument) {
      promptUpgrade(t, 'upgradeDocLimitMsg', goUpgrade);
      return;
    }

    const aiOk = await consumeAiRequest();
    if (!aiOk) {
      promptUpgrade(t, 'upgradeAiDailyMsg', goUpgrade);
      return;
    }

    if (picked) {
      const allowed = await registerDocumentUse();
      if (!allowed) {
        promptUpgrade(t, 'upgradeDocLimitMsg', goUpgrade);
        return;
      }
    }

    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const text = pastedText.trim().length > 0 ? pastedText.trim() : await readDocumentText(picked!);
      const explanation = await explainDocument(text, language);
      setResult(explanation);

      if (picked) {
        const category = guessCategory(explanation.organization);
        const local = toStoredDocument(picked, category, explanation.summary);
        try {
          await uploadDocument(local, CATEGORY_TO_BACKEND[category]);
        } catch (e) {
          if (e instanceof Error && e.message === 'DOCUMENT_LIMIT') {
            promptUpgrade(t, 'upgradeDocLimitMsg', goUpgrade);
          } else {
            try {
              await addCachedDocument(local);
            } catch (err) {
              if (err instanceof Error && err.message === 'DOCUMENT_LIMIT') {
                promptUpgrade(t, 'upgradeDocLimitMsg', goUpgrade);
              }
            }
          }
        }
      }

      if (explanation.deadlines.length > 0) {
        await storage.addDeadlines(
          explanation.deadlines.map((d, i) => ({
            id: `dl_${Date.now()}_${i}`,
            title: `${explanation.organization} ${t('deadlineTitleSuffix')}`,
            date: normalizeDate(d),
            description: d,
            organization: explanation.organization,
            done: false,
          }))
        );
      }
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header title={t('explainTitle')} onBack={() => navigation.goBack()} />
      <Body>
        <Card onPress={onPick} style={styles.dropzone}>
          <View style={styles.dropIcon}>
            <Ionicons name={picked ? 'document-text' : 'cloud-upload-outline'} size={30} color={Colors.blue} />
          </View>
          <Text style={styles.dropTitle}>{picked ? picked.name : t('explainUpload')}</Text>
          <Text style={styles.dropHint}>
            {picked ? t('explainTapAnother') : t('explainDropHint')}
          </Text>
        </Card>

        <Text style={styles.orText}>{t('explainOrPaste')}</Text>

        <TextInput
          style={styles.textArea}
          placeholder={t('enterText')}
          placeholderTextColor={Colors.textMuted}
          multiline
          value={pastedText}
          onChangeText={setPastedText}
        />

        {!isUnlimited ? (
          <Text style={styles.quota}>
            {fillTemplate(t('documentsRemaining'), { count: remaining === Infinity ? '∞' : remaining })}
          </Text>
        ) : null}
        {isInTrial ? (
          <Text style={styles.quota}>
            {fillTemplate(t('trialDaysLeft'), { days: trialDaysLeft })}
          </Text>
        ) : aiRemainingToday !== Infinity ? (
          <Text style={styles.quota}>
            {fillTemplate(t('aiRequestsRemaining'), { count: aiRemainingToday })}
          </Text>
        ) : null}

        <NeonButton
          title={t('explainTitle')}
          onPress={analyze}
          loading={loading}
          variant="blueRed"
          icon="sparkles"
        />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.blue} />
            <Text style={styles.loadingText}>{t('explainAnalyzing')}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={18} color={Colors.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result ? (
          <View style={{ marginTop: Spacing.lg }}>
            <View style={styles.orgBadge}>
              <Ionicons name="business-outline" size={14} color={Colors.blue} />
              <Text style={styles.orgText}>{result.organization}</Text>
            </View>

            <ResultBlock icon="reader-outline" title={t('summary')} color={Colors.blue}>
              <ScrollableText text={result.summary} textStyle={styles.bodyText} maxHeightRatio={0.35} />
            </ResultBlock>

            {result.keyPoints.length > 0 ? (
              <ResultBlock icon="key-outline" title={t('keyPoints')} color="#2EE6A6">
                {result.keyPoints.map((p, i) => (
                  <Bullet key={i} text={p} color="#2EE6A6" />
                ))}
              </ResultBlock>
            ) : null}

            {result.deadlines.length > 0 ? (
              <ResultBlock icon="alarm-outline" title={t('deadlines')} color={Colors.warning}>
                {result.deadlines.map((p, i) => (
                  <Bullet key={i} text={p} color={Colors.warning} icon="calendar-outline" />
                ))}
              </ResultBlock>
            ) : null}

            {result.nextSteps.length > 0 ? (
              <ResultBlock icon="footsteps-outline" title={t('nextSteps')} color={Colors.red}>
                {result.nextSteps.map((p, i) => (
                  <Bullet key={i} text={p} color={Colors.red} index={i + 1} />
                ))}
              </ResultBlock>
            ) : null}
          </View>
        ) : null}
      </Body>
    </Screen>
  );
};

const ResultBlock: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color: string;
  children: React.ReactNode;
}> = ({ icon, title, color, children }) => (
  <Card style={{ marginBottom: Spacing.md }}>
    <View style={styles.blockHeader}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.blockTitle, { color }]}>{title}</Text>
    </View>
    {children}
  </Card>
);

const Bullet: React.FC<{ text: string; color: string; index?: number; icon?: keyof typeof Ionicons.glyphMap }> = ({
  text,
  color,
  index,
  icon,
}) => (
  <View style={styles.bullet}>
    {index ? (
      <View style={[styles.bulletNum, { borderColor: color }]}>
        <Text style={[styles.bulletNumText, { color }]}>{index}</Text>
      </View>
    ) : (
      <Ionicons name={icon ?? 'ellipse'} size={icon ? 14 : 7} color={color} style={styles.bulletDot} />
    )}
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

function guessCategory(org: string): storage.DocumentCategory {
  const o = org.toLowerCase();
  if (o.includes('caf')) return 'caf';
  if (o.includes('cpam') || o.includes('mala') || o.includes('ameli')) return 'cpam';
  if (o.includes('impot') || o.includes('tax') || o.includes('fisc')) return 'tax';
  if (o.includes('préf') || o.includes('pref') || o.includes('séjour') || o.includes('anef')) return 'visa';
  return 'other';
}

function normalizeDate(raw: string): string {
  const iso = raw.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  const fr = raw.match(/(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
  if (fr) return `${fr[3]}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`;
  return new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
}

const styles = StyleSheet.create({
  dropzone: { alignItems: 'center', paddingVertical: Spacing.xl, borderStyle: 'dashed' },
  dropIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.glassBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  dropTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center', paddingHorizontal: Spacing.md },
  dropHint: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 4, textAlign: 'center' },
  orText: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginVertical: Spacing.md },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    padding: Spacing.md,
    minHeight: 110,
    textAlignVertical: 'top',
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  quota: { color: Colors.textSecondary, fontSize: FontSize.xs, textAlign: 'center', marginBottom: Spacing.sm },
  loadingBox: { alignItems: 'center', marginTop: Spacing.lg },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: Spacing.sm },
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
  orgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.glassBlue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    marginBottom: Spacing.md,
  },
  orgText: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '700', marginLeft: 5 },
  blockHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  blockTitle: { fontSize: FontSize.md, fontWeight: '700', marginLeft: 6 },
  bodyText: { color: Colors.textPrimary, fontSize: FontSize.sm, lineHeight: 21 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  bulletDot: { marginTop: 5, marginRight: 8, width: 16 },
  bulletNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bulletNumText: { fontSize: 11, fontWeight: '800' },
  bulletText: { color: Colors.textPrimary, fontSize: FontSize.sm, flex: 1, lineHeight: 20 },
});
