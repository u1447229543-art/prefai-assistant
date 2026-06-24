import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, Card, NeonButton } from '../components/ui';
import { useApp } from '../context/AppContext';
import { explainForm, FormFieldHelp } from '../services/openai';

const SUGGESTIONS = [
  'CERFA 13360 (RSA)',
  'Demande APL (CAF)',
  'Titre de séjour (ANEF)',
  'Déclaration de revenus',
  'Carte Vitale (CPAM)',
];

export const FormAssistScreen: React.FC = () => {
  const navigation = useNavigation();
  const { language, t } = useApp();
  const [form, setForm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    intro: string;
    fields: FormFieldHelp[];
    requiredDocuments: string[];
  } | null>(null);

  const run = async (value?: string) => {
    const query = (value ?? form).trim();
    if (!query) return;
    if (value) setForm(value);
    setLoading(true);
    setResult(null);
    try {
      const out = await explainForm(query, language);
      setResult(out);
    } catch (e) {
      setResult({ intro: String(e instanceof Error ? e.message : e), fields: [], requiredDocuments: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header title={t('formTitle')} onBack={() => navigation.goBack()} />
      <Body>
        <Text style={styles.label}>{t('formInputLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Demande APL CAF, CERFA 13360…"
          placeholderTextColor={Colors.textMuted}
          value={form}
          onChangeText={setForm}
        />

        <View style={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s} style={styles.suggestion} onPress={() => run(s)}>
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <NeonButton title={t('explainForm')} onPress={() => run()} loading={loading} variant="blue" icon="list-outline" />

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.blue} />
          </View>
        ) : null}

        {result ? (
          <View style={{ marginTop: Spacing.lg }}>
            {result.intro ? (
              <Card style={{ marginBottom: Spacing.md }}>
                <Text style={styles.intro}>{result.intro}</Text>
              </Card>
            ) : null}

            {result.fields.map((f, i) => (
              <Card key={i} style={{ marginBottom: Spacing.sm }}>
                <View style={styles.fieldHeader}>
                  <View style={styles.fieldNum}>
                    <Text style={styles.fieldNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.fieldName}>{f.field}</Text>
                </View>
                <Text style={styles.fieldMeaning}>{f.whatItMeans}</Text>
                <View style={styles.writeBox}>
                  <Ionicons name="pencil" size={13} color={Colors.success} />
                  <Text style={styles.writeText}>{f.whatToWrite}</Text>
                </View>
              </Card>
            ))}

            {result.requiredDocuments.length > 0 ? (
              <Card>
                <View style={styles.docHeader}>
                  <Ionicons name="folder-open-outline" size={16} color={Colors.red} />
                  <Text style={styles.docTitle}>{t('requiredDocs')}</Text>
                </View>
                {result.requiredDocuments.map((d, i) => (
                  <View key={i} style={styles.docRow}>
                    <Ionicons name="document-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.docText}>{d}</Text>
                  </View>
                ))}
              </Card>
            ) : null}
          </View>
        ) : null}
      </Body>
    </Screen>
  );
};

const styles = StyleSheet.create({
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
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
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.md },
  suggestion: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  suggestionText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' },
  loading: { marginTop: Spacing.lg, alignItems: 'center' },
  intro: { color: Colors.textPrimary, fontSize: FontSize.sm, lineHeight: 21 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  fieldNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.glassBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  fieldNumText: { color: Colors.blue, fontSize: 12, fontWeight: '800' },
  fieldName: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  fieldMeaning: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.sm },
  writeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(46,230,166,0.08)',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  writeText: { color: Colors.textPrimary, fontSize: FontSize.sm, marginLeft: 6, flex: 1, lineHeight: 19 },
  docHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  docTitle: { color: Colors.red, fontSize: FontSize.md, fontWeight: '700', marginLeft: 6 },
  docRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  docText: { color: Colors.textPrimary, fontSize: FontSize.sm, marginLeft: 8 },
});
