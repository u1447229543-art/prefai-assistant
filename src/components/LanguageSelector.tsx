import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { LANGUAGES, Language, LanguageCode, getLanguage } from '../constants/languages';

export interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  /** Compact pill trigger vs full-width row. */
  compact?: boolean;
  label?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  compact,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const current = getLanguage(value);

  const renderItem = ({ item }: { item: Language }) => {
    const selected = item.code === value;
    return (
      <Pressable
        style={[styles.row, selected && styles.rowSelected]}
        onPress={() => {
          onChange(item.code);
          setOpen(false);
        }}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.rowText}>
          <Text style={styles.rowName}>{item.name}</Text>
          <Text style={styles.rowEnglish}>{item.englishName}</Text>
        </View>
        {selected ? <Ionicons name="checkmark-circle" size={22} color={Colors.blue} /> : null}
      </Pressable>
    );
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, compact && styles.triggerCompact]}
      >
        <Text style={styles.flag}>{current.flag}</Text>
        {!compact && (
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            {label ? <Text style={styles.triggerLabel}>{label}</Text> : null}
            <Text style={styles.triggerValue}>{current.name}</Text>
          </View>
        )}
        {compact ? (
          <Text style={styles.triggerValueCompact}>{current.code.toUpperCase()}</Text>
        ) : null}
        <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select language</Text>
          <FlatList
            data={LANGUAGES}
            keyExtractor={(i) => i.code}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: Spacing.xl }}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  triggerCompact: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm + 2,
    alignSelf: 'flex-start',
  },
  triggerLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  triggerValue: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', marginTop: 2 },
  triggerValueCompact: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginHorizontal: 6,
  },
  flag: { fontSize: 24 },
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.cardElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    maxHeight: '75%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  rowSelected: { backgroundColor: Colors.glassBlue },
  rowText: { flex: 1, marginLeft: Spacing.md },
  rowName: { color: Colors.white, fontSize: FontSize.md, fontWeight: '600' },
  rowEnglish: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
});
