import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, NeonButton, EmptyState, Chip } from '../components/ui';
import { DocumentCard, getCategoryMeta } from '../components/DocumentCard';
import { useApp } from '../context/AppContext';
import * as storage from '../services/storage';
import { CATEGORY_TO_BACKEND, ApiError, isNetworkError } from '../services/api';
import { pickDocument, toStoredDocument, formatBytes, PickedDocument } from '../services/documents';
import type { RootStackParamList } from '../navigation/types';

import { getCategoryLabel } from '../i18n/helpers';
import type { TranslationKey } from '../i18n/translations';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_IDS: { id: storage.DocumentCategory | 'all'; key: TranslationKey }[] = [
  { id: 'all', key: 'catAll' },
  { id: 'passport', key: 'catPassport' },
  { id: 'visa', key: 'catVisa' },
  { id: 'caf', key: 'catCaf' },
  { id: 'cpam', key: 'catCpam' },
  { id: 'contract', key: 'catContracts' },
  { id: 'tax', key: 'catTax' },
  { id: 'other', key: 'catOther' },
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
  const {
    t,
    documents,
    documentsLoading,
    refreshDocuments,
    uploadDocument,
    removeDocument,
    syncError,
  } = useApp();
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<storage.DocumentCategory | 'all'>('all');
  const [picking, setPicking] = useState<PickedDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refreshDocuments();
    }, [refreshDocuments])
  );

  const filtered = useMemo(
    () => (filter === 'all' ? documents : documents.filter((d) => d.category === filter)),
    [documents, filter]
  );

  const onAdd = async () => {
    try {
      const doc = await pickDocument();
      if (doc) setPicking(doc);
    } catch {
      Alert.alert(t('error'), t('couldNotOpenPicker'));
    }
  };

  const saveWithCategory = async (category: storage.DocumentCategory) => {
    if (!picking) return;
    setUploading(true);
    setUploadError(null);
    try {
      const local = toStoredDocument(picking, category);
      await uploadDocument(local, CATEGORY_TO_BACKEND[category]);
      setPicking(null);
    } catch (e) {
      if (isNetworkError(e)) {
        setUploadError(t('couldNotReachServer'));
      } else if (e instanceof ApiError) {
        setUploadError(e.message);
      } else {
        setUploadError(t('uploadFailed'));
      }
    } finally {
      setUploading(false);
    }
  };

  const remove = (id: string) => {
    Alert.alert(t('delete'), t('removeDocConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeDocument(id);
          } catch (e) {
            Alert.alert(t('error'), e instanceof Error ? e.message : t('couldNotDeleteDoc'));
          }
        },
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

        {documentsLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.blue} />
            <Text style={styles.loadingText}>{t('loadingDocuments')}</Text>
          </View>
        ) : null}

        {syncError ? (
          <View style={styles.warnBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color={Colors.warning} />
            <Text style={styles.warnText}>{syncError}</Text>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: Spacing.sm }}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {CATEGORY_IDS.map((c) => (
            <Chip
              key={c.id}
              label={t(c.key)}
              active={filter === c.id}
              onPress={() => setFilter(c.id)}
            />
          ))}
        </ScrollView>

        {!documentsLoading && filtered.length === 0 ? (
          <EmptyState
            icon="shield-checkmark-outline"
            title={t('vaultEmpty')}
            subtitle={t('vaultEmptySub')}
          />
        ) : (
          filtered.map((d) => (
            <DocumentCard
              key={d.id}
              document={d}
              onPress={() => navigation.navigate('DocumentPreview', { document: d })}
              onDelete={() => remove(d.id)}
            />
          ))
        )}

        <NeonButton title={t('addDocument')} onPress={onAdd} variant="blue" icon="cloud-upload-outline" style={{ marginTop: Spacing.md }} />
      </Body>

      <Modal visible={!!picking} transparent animationType="slide" onRequestClose={() => setPicking(null)}>
        <Pressable style={styles.backdrop} onPress={() => !uploading && setPicking(null)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.fileConfirm}>
            <View style={styles.fileIcon}>
              <Ionicons
                name={picking?.mimeType?.includes('pdf') ? 'document-text' : 'image'}
                size={22}
                color={Colors.blue}
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={styles.fileName} numberOfLines={1}>
                {picking?.name ?? ''}
              </Text>
              <Text style={styles.fileMeta}>
                {t('fileSelected')} · {formatBytes(picking?.size)}
                {picking?.mimeType ? ` · ${picking.mimeType}` : ''}
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
          </View>

          {uploadError ? <Text style={styles.uploadError}>{uploadError}</Text> : null}

          {uploading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.blue} />
              <Text style={styles.loadingText}>{t('uploadingToServer')}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sheetTitle}>{t('saveToCategory')}</Text>
              <View style={styles.catGrid}>
                {PICK_CATEGORIES.map((c) => {
                  const meta = getCategoryMeta(c);
                  return (
                    <Pressable key={c} style={styles.catItem} onPress={() => saveWithCategory(c)}>
                      <View style={[styles.catIcon, { backgroundColor: `${meta.color}1F`, borderColor: meta.color }]}>
                        <Ionicons name={meta.icon} size={22} color={meta.color} />
                      </View>
                      <Text style={styles.catLabel}>{getCategoryLabel(t, c)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 as unknown as number,
    marginBottom: Spacing.sm,
  },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.sm },
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
  uploadError: { color: Colors.red, fontSize: FontSize.sm, marginBottom: Spacing.sm },
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
  sheetTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  fileConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.lg,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0,212,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  fileMeta: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
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
