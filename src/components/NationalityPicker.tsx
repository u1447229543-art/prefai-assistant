import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import {
  Nationality,
  filterNationalities,
  getNationalityFlag,
} from '../constants/nationalities';

interface NationalityPickerProps {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
}

export const NationalityPicker: React.FC<NationalityPickerProps> = ({
  value,
  onChange,
  placeholder = 'Select nationality (optional)',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => filterNationalities(search), [search]);

  const pick = (item: Nationality) => {
    onChange(item.name);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Ionicons name="flag-outline" size={18} color={Colors.textSecondary} />
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value ? `${getNationalityFlag(value)}  ${value}` : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Select nationality</Text>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search country…"
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              autoFocus
            />
            {search ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.name}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: Spacing.xl }}
            ListEmptyComponent={
              <Text style={styles.empty}>No countries match your search.</Text>
            }
            renderItem={({ item }) => {
              const selected = item.name === value;
              return (
                <Pressable
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => pick(item)}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.optionText}>{item.name}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={22} color={Colors.blue} /> : null}
                </Pressable>
              );
            }}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    marginBottom: Spacing.md,
  },
  triggerText: { flex: 1, color: Colors.white, fontSize: FontSize.md, marginLeft: Spacing.sm },
  placeholder: { color: Colors.textMuted },
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.cardElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.sm },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.md,
    paddingVertical: 10,
    marginLeft: Spacing.sm,
  },
  empty: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', padding: Spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  optionSelected: { backgroundColor: Colors.glassBlue },
  flag: { fontSize: 22 },
  optionText: { color: Colors.white, fontSize: FontSize.md, flex: 1, marginLeft: Spacing.md },
});
