import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { StoredDeadline } from '../services/storage';
import { daysUntil, toISODate, urgencyColor } from '../utils/deadlines';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface CalendarProps {
  deadlines: StoredDeadline[];
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
}

interface Cell {
  iso: string;
  day: number;
  inMonth: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({ deadlines, selectedDate, onSelectDate }) => {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Map of iso -> most urgent (smallest days) pending deadline color.
  const dayColors = useMemo(() => {
    const map: Record<string, { color: string; count: number }> = {};
    for (const d of deadlines) {
      const existing = map[d.date];
      const color = urgencyColor(daysUntil(d.date), d.done);
      if (!existing) {
        map[d.date] = { color, count: 1 };
      } else {
        existing.count += 1;
        // prefer the more urgent (red > warning > success) color
        existing.color = mergeColor(existing.color, color);
      }
    }
    return map;
  }, [deadlines]);

  const cells = useMemo<Cell[]>(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const start = new Date(year, month, 1 - offset);
    const result: Cell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      result.push({ iso: toISODate(d), day: d.getDate(), inMonth: d.getMonth() === month });
    }
    return result;
  }, [cursor]);

  const todayIso = toISODate(today);

  const shift = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => shift(-1)} hitSlop={10} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.white} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </Text>
        <Pressable onPress={() => shift(1)} hitSlop={10} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const marker = dayColors[cell.iso];
          const isToday = cell.iso === todayIso;
          const isSelected = cell.iso === selectedDate;
          return (
            <Pressable
              key={cell.iso}
              style={styles.cell}
              onPress={() => onSelectDate(cell.iso)}
            >
              <View
                style={[
                  styles.dayWrap,
                  isToday && styles.today,
                  isSelected && styles.selected,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !cell.inMonth && styles.dayMuted,
                    (isSelected || isToday) && styles.dayActiveText,
                  ]}
                >
                  {cell.day}
                </Text>
              </View>
              {marker ? (
                <View style={[styles.dot, { backgroundColor: marker.color }]} />
              ) : (
                <View style={styles.dotPlaceholder} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

function colorRank(c: string): number {
  if (c === Colors.red) return 3;
  if (c === Colors.warning) return 2;
  if (c === Colors.success) return 1;
  return 0;
}
function mergeColor(a: string, b: string): string {
  return colorRank(b) > colorRank(a) ? b : a;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 },
  dayWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: { borderWidth: 1, borderColor: Colors.blue },
  selected: { backgroundColor: Colors.blue },
  dayText: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600' },
  dayMuted: { color: Colors.textMuted, opacity: 0.5 },
  dayActiveText: { color: Colors.white },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
  dotPlaceholder: { width: 6, height: 6, marginTop: 3 },
});
