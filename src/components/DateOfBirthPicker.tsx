import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 2010 - 1950 + 1 }, (_, i) => String(2010 - i));

/** Build an ISO date string (yyyy-mm-dd) from picker parts, or '' if incomplete. */
export function buildDateOfBirth(day: string, month: string, year: string): string {
  if (!day || !month || !year) return '';
  const monthIndex = MONTHS.indexOf(month as (typeof MONTHS)[number]);
  if (monthIndex < 0) return '';
  const dd = day.padStart(2, '0');
  const mm = String(monthIndex + 1).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

interface DateOfBirthPickerProps {
  day: string;
  month: string;
  year: string;
  onChangeDay: (v: string) => void;
  onChangeMonth: (v: string) => void;
  onChangeYear: (v: string) => void;
}

type PickerKind = 'day' | 'month' | 'year' | null;

export const DateOfBirthPicker: React.FC<DateOfBirthPickerProps> = ({
  day,
  month,
  year,
  onChangeDay,
  onChangeMonth,
  onChangeYear,
}) => {
  const [open, setOpen] = useState<PickerKind>(null);

  const options = useMemo(() => {
    if (open === 'day') return DAYS;
    if (open === 'month') return [...MONTHS];
    if (open === 'year') return YEARS;
    return [];
  }, [open]);

  const currentValue = open === 'day' ? day : open === 'month' ? month : open === 'year' ? year : '';

  const onSelect = (value: string) => {
    if (open === 'day') onChangeDay(value);
    else if (open === 'month') onChangeMonth(value);
    else if (open === 'year') onChangeYear(value);
    setOpen(null);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Date of birth (optional)</Text>
      <View style={styles.row}>
        <SelectBox label="Day" value={day} placeholder="Day" onPress={() => setOpen('day')} />
        <SelectBox label="Month" value={month} placeholder="Month" onPress={() => setOpen('month')} wide />
        <SelectBox label="Year" value={year} placeholder="Year" onPress={() => setOpen('year')} />
      </View>

      <Modal visible={open !== null} transparent animationType="slide" onRequestClose={() => setOpen(null)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(null)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>
            {open === 'day' ? 'Select day' : open === 'month' ? 'Select month' : 'Select year'}
          </Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: Spacing.xl }}
            renderItem={({ item }) => {
              const selected = item === currentValue;
              return (
                <Pressable
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color={Colors.blue} /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const SelectBox: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  wide?: boolean;
}> = ({ value, placeholder, onPress, wide }) => (
  <Pressable style={[styles.box, wide && styles.boxWide]} onPress={onPress}>
    <Text style={[styles.boxText, !value && styles.boxPlaceholder]} numberOfLines={1}>
      {value || placeholder}
    </Text>
    <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
  </Pressable>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: { flexDirection: 'row', gap: Spacing.sm as unknown as number },
  box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 14,
    minWidth: 72,
  },
  boxWide: { flex: 1.6 },
  boxText: { color: Colors.white, fontSize: FontSize.sm, flex: 1 },
  boxPlaceholder: { color: Colors.textMuted },
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.cardElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    maxHeight: '55%',
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  optionSelected: { backgroundColor: Colors.glassBlue },
  optionText: { color: Colors.textPrimary, fontSize: FontSize.md },
  optionTextSelected: { color: Colors.white, fontWeight: '700' },
});
