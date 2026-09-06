import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import {
  FormSuggestion,
  filterFormSuggestions,
} from '../constants/formSuggestions';

type Props = {
  /** Highlight the chip whose query matches. */
  selectedQuery?: string | null;
  onSelect: (item: FormSuggestion) => void;
  searchPlaceholder?: string;
  /** Controlled search; when set with onSearchChange, parent owns the value. */
  searchValue?: string;
  onSearchChange?: (text: string) => void;
};

export const FormSuggestionPicker: React.FC<Props> = ({
  selectedQuery = null,
  onSelect,
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const controlled = searchValue !== undefined && !!onSearchChange;
  const search = controlled ? searchValue! : internalSearch;
  const setSearch = controlled ? onSearchChange! : setInternalSearch;

  const filtered = useMemo(() => filterFormSuggestions(search), [search]);

  return (
    <View style={styles.wrap}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={searchPlaceholder}
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.suggestions}>
        {filtered.map((s) => {
          const active = selectedQuery === s.query;
          return (
            <Pressable
              key={s.query}
              style={[styles.suggestion, active && styles.suggestionActive]}
              onPress={() => onSelect(s)}
            >
              <Text style={[styles.suggestionText, active && styles.suggestionTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No matches</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.md,
    paddingVertical: 12,
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap' },
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
  suggestionActive: {
    borderColor: Colors.blue,
    backgroundColor: Colors.glassBlue,
  },
  suggestionText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  suggestionTextActive: { color: Colors.blue },
  empty: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
});
