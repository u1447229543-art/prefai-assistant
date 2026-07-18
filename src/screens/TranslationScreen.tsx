import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, Card, NeonButton, ScrollableText } from '../components/ui';
import { LanguageSelector } from '../components/LanguageSelector';
import { useApp } from '../context/AppContext';
import { LanguageCode, getLanguage } from '../constants/languages';
import { translateText } from '../services/openai';
import { copyOrShare } from '../services/clipboard';
import { promptUpgrade } from '../utils/quotaPrompt';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const TranslationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { language, t, consumeAiRequest } = useApp();
  const [source, setSource] = useState<LanguageCode>('fr');
  const [target, setTarget] = useState<LanguageCode>(language === 'fr' ? 'en' : language);
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const swap = () => {
    setSource(target);
    setTarget(source);
    setText(result);
    setResult(text);
  };

  const run = async () => {
    if (!text.trim()) return;
    const allowed = await consumeAiRequest();
    if (!allowed) {
      promptUpgrade(t, 'upgradeAiDailyMsg', () => navigation.navigate('Subscription'));
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const out = await translateText(text.trim(), target, source);
      setResult(out);
    } catch (e) {
      setResult(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (await copyOrShare(result)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Screen>
      <Header title={t('translateTitle')} onBack={() => navigation.goBack()} />
      <Body>
        <View style={styles.langRow}>
          <View style={styles.langCol}>
            <Text style={styles.langLabel}>{t('translateFrom')}</Text>
            <LanguageSelector value={source} onChange={setSource} compact />
          </View>
          <Pressable onPress={swap} style={styles.swap}>
            <Ionicons name="swap-horizontal" size={20} color={Colors.blue} />
          </Pressable>
          <View style={styles.langCol}>
            <Text style={styles.langLabel}>{t('translateTo')}</Text>
            <LanguageSelector value={target} onChange={setTarget} compact />
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder={t('enterText')}
          placeholderTextColor={Colors.textMuted}
          multiline
          value={text}
          onChangeText={setText}
        />

        <NeonButton title={t('translateBtn')} onPress={run} loading={loading} variant="blue" icon="language-outline" />

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.blue} />
          </View>
        ) : null}

        {result ? (
          <Card style={{ marginTop: Spacing.lg }}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>
                {getLanguage(target).flag} {t('result')}
              </Text>
              <Pressable onPress={copy} hitSlop={8} style={styles.copyBtn}>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={16}
                  color={copied ? Colors.success : Colors.blue}
                />
                <Text style={[styles.copyText, copied && { color: Colors.success }]}>
                  {copied ? t('copied') : t('copy')}
                </Text>
              </Pressable>
            </View>
            <ScrollableText text={result} textStyle={styles.resultText} />
          </Card>
        ) : null}
      </Body>
    </Screen>
  );
};

const styles = StyleSheet.create({
  langRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  langCol: { flex: 1 },
  langLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, marginBottom: 6 },
  swap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
    marginTop: 18,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    padding: Spacing.md,
    minHeight: 130,
    textAlignVertical: 'top',
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  loading: { marginTop: Spacing.lg, alignItems: 'center' },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  resultLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  copyBtn: { flexDirection: 'row', alignItems: 'center' },
  copyText: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '600', marginLeft: 4 },
  resultText: { color: Colors.white, fontSize: FontSize.md, lineHeight: 23 },
});
