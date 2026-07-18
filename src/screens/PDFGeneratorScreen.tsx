import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, Card, NeonButton, ScrollableText } from '../components/ui';
import { useApp } from '../context/AppContext';
import { generateLetter } from '../services/openai';
import { promptUpgrade } from '../utils/quotaPrompt';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const PDFGeneratorScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { language, t, user, consumeAiRequest } = useApp();
  const [purpose, setPurpose] = useState('');
  const [recipient, setRecipient] = useState('');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const generate = async () => {
    if (!purpose.trim()) return;
    const allowed = await consumeAiRequest();
    if (!allowed) {
      promptUpgrade(t, 'upgradeAiDailyMsg', () => navigation.navigate('Subscription'));
      return;
    }
    setLoading(true);
    setLetter('');
    try {
      const out = await generateLetter({
        purpose: purpose.trim(),
        recipient: recipient.trim() || 'Administration',
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
      setLetter(out);
    } catch (e) {
      Alert.alert(t('error'), String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    if (!letter) return;
    setExporting(true);
    try {
      const html = buildHtml(letter, recipient);
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: t('pdfShareTitle') });
      } else {
        Alert.alert(t('pdfCreated'), uri);
      }
    } catch (e) {
      Alert.alert(t('error'), String(e instanceof Error ? e.message : e));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Screen>
      <Header title={t('pdfTitle')} onBack={() => navigation.goBack()} />
      <Body>
        <Text style={styles.label}>{t('pdfRecipient')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('pdfRecipientPlaceholder')}
          placeholderTextColor={Colors.textMuted}
          value={recipient}
          onChangeText={setRecipient}
        />

        <Text style={styles.label}>{t('pdfPurpose')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('pdfPurposePlaceholder')}
          placeholderTextColor={Colors.textMuted}
          multiline
          value={purpose}
          onChangeText={setPurpose}
        />

        <NeonButton title={t('generatePdf')} onPress={generate} loading={loading} variant="blue" icon="create-outline" />

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.blue} />
          </View>
        ) : null}

        {letter ? (
          <>
            <Card style={{ marginTop: Spacing.lg }}>
              <View style={styles.paper}>
                <ScrollableText text={letter} textStyle={styles.letterText} maxHeightRatio={0.5} />
              </View>
            </Card>
            <NeonButton
              title={t('exportPdf')}
              onPress={exportPdf}
              loading={exporting}
              variant="blueRed"
              icon="document-attach-outline"
              style={{ marginTop: Spacing.md }}
            />
          </>
        ) : null}
      </Body>
    </Screen>
  );
};

function buildHtml(letter: string, recipient: string): string {
  const body = letter
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; padding: 48px; line-height: 1.6; font-size: 13px; }
    .header { border-bottom: 2px solid #00A6CC; padding-bottom: 8px; margin-bottom: 24px; }
    .brand { color: #00A6CC; font-weight: 700; letter-spacing: 1px; }
    .to { color: #555; font-size: 12px; }
    .content { white-space: pre-wrap; }
    .footer { margin-top: 40px; color: #999; font-size: 10px; border-top: 1px solid #eee; padding-top: 8px; }
  </style></head>
  <body>
    <div class="header">
      <div class="brand">PrefAI Assistant</div>
      <div class="to">${recipient ? 'À : ' + recipient : ''}</div>
    </div>
    <div class="content">${body}</div>
    <div class="footer">Généré avec PrefAI Assistant — cet outil ne remplace pas les services administratifs officiels.</div>
  </body></html>`;
}

const styles = StyleSheet.create({
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm, marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    padding: Spacing.md,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  textArea: { minHeight: 110, textAlignVertical: 'top' },
  loading: { marginTop: Spacing.lg, alignItems: 'center' },
  paper: { backgroundColor: '#FAFAFF', borderRadius: Radius.sm, padding: Spacing.md },
  letterText: { color: '#1A1A22', fontSize: FontSize.sm, lineHeight: 21 },
});
