import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { DocumentCategory, StoredDocument } from '../services/storage';

const CATEGORY_META: Record<
  DocumentCategory,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  passport: { label: 'Passport', icon: 'globe-outline', color: '#00D4FF' },
  visa: { label: 'Visa', icon: 'airplane-outline', color: '#7B61FF' },
  caf: { label: 'CAF', icon: 'home-outline', color: '#2EE6A6' },
  cpam: { label: 'CPAM', icon: 'medkit-outline', color: '#FF2D55' },
  contract: { label: 'Contract', icon: 'document-text-outline', color: '#FFB020' },
  tax: { label: 'Tax', icon: 'cash-outline', color: '#00E0B8' },
  other: { label: 'Other', icon: 'folder-outline', color: '#9A9AB2' },
};

export const getCategoryMeta = (c: DocumentCategory) => CATEGORY_META[c];

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return '';
  }
};

export interface DocumentCardProps {
  document: StoredDocument;
  onPress?: () => void;
  onDelete?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onPress, onDelete }) => {
  const meta = CATEGORY_META[document.category];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${meta.color}1F` }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta.label} · {formatDate(document.createdAt)}
          {document.size ? ` · ${formatSize(document.size)}` : ''}
        </Text>
      </View>
      {onDelete ? (
        <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, marginHorizontal: Spacing.md },
  name: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  meta: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 3 },
  deleteBtn: { padding: 4 },
});
