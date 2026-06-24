import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, NeonButton, EmptyState, Chip } from '../components/ui';
import { DocumentCard, getCategoryMeta } from '../components/DocumentCard';
import { useApp } from '../context/AppContext';
import * as storage from '../services/storage';
import { pickDocument, toStoredDocument, PickedDocument } from '../services/documents';

const CATEGORIES: { id: storage.DocumentCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'passport', label: 'Passport' },
  { id: 'visa', label: 'Visa' },
  { id: 'caf', label: 'CAF' },
  { id: 'cpam', label: 'CPAM' },
  { id: 'contract', label: 'Contracts' },
  { id: 'tax', label: 'Tax' },
  { id: 'other', label: 'Other' },
];

const PICK_CATEGORIES: storage.DocumentCategory[] = [
  'passport',
  'visa',
  'caf',
  'cpam',
  'contract',
  'tax',
  'other',
];

export const DocumentVaultScreen: React.FC = () => {
  const { t } = useApp();
  const [docs, setDocs] = useState<storage.StoredDocument[]>([]);
  const [filter, setFilter] = useState<storage.DocumentCategory | 'all'>('all');
  const [picking, setPicking] = useState<PickedDocument | null>(null);

  const reload = useCallback(() => {
    storage.loadVault().then(setDocs);
  }, []);

  useFocusEffect(useCallback(() => reload(), [reload]));

  const filtered = useMemo(
    () => (filter === 'all' ? docs : docs.filter((d) => d.category === filter)),
    [docs, filter]
  );

  const onAdd = async () => {
    try {
      const doc = await pickDocument();
      if (doc) setPicking(doc);
    } catch {
      Alert.alert(t('error'), 'Could not open the file picker.');
    }
  };

  const saveWithCategory = async (category: storage.DocumentCategory) => {
    if (!picking) return;
    const next = await storage.addToVault(toStoredDocument(picking, category));
    setDocs(next);
    setPicking(null);
  };

  const remove = (id: string) => {
    Alert.alert(t('delete'), 'Remove this document from your vault?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => setDocs(await storage.removeFromVault(id)),
      },
    ]);
  };

  return (
    <Screen>
      <Header
        title={t('vaultTitle')}
        right={
          <Pressable onPress={onAdd} hitSlop={10}>
            <Ionicons name="add-circle" size={26} color={Colors.blue} />
          </Pressable>
        }
      />
      <Body>
        <View style={styles.secureBanner}>
          <Ionicons name="lock-closed" size={16} color={Colors.success} />
          <Text style={styles.secureText}>{t('vaultSubtitle')}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: Spacing.sm }}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              active={filter === c.id}
              onPress={() => setFilter(c.id)}
            />
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <EmptyState
            icon="shield-checkmark-outline"
            title="Your vault is empty"
            subtitle="Add your passport, visa, CAF and CPAM documents to keep them handy and organized."
          />
        ) : (
          filtered.map((d) => (
            <DocumentCard key={d.id} document={d} onDelete={() => remove(d.id)} />
          ))
        )}

        <NeonButton title={t('addDocument')} onPress={onAdd} variant="blue" icon="cloud-upload-outline" style={{ marginTop: Spacing.md }} />
      </Body>

      <Modal visible={!!picking} transparent animationType="slide" onRequestClose={() => setPicking(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPicking(null)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{t('categories')}</Text>
          <Text style={styles.sheetSub} numberOfLines={1}>
            {picking?.name}
          </Text>
          <View style={styles.catGrid}>
            {PICK_CATEGORIES.map((c) => {
              const meta = getCategoryMeta(c);
              return (
                <Pressable key={c} style={styles.catItem} onPress={() => saveWithCategory(c)}>
                  <View style={[styles.catIcon, { backgroundColor: `${meta.color}1F`, borderColor: meta.color }]}>
                    <Ionicons name={meta.icon} size={22} color={meta.color} />
                  </View>
                  <Text style={styles.catLabel}>{meta.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  secureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46,230,166,0.08)',
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  secureText: { color: Colors.textSecondary, fontSize: FontSize.xs, marginLeft: 8, flex: 1 },
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.cardElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.md },
  sheetTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  sheetSub: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4, marginBottom: Spacing.md },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catItem: { width: '23%', alignItems: 'center', marginBottom: Spacing.md },
  catIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' },
});
