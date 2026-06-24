import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { StoredDeadline } from '../services/storage';
import { daysUntil, urgencyColor, urgencyLabel } from '../utils/deadlines';

export interface DeadlineCardProps {
  deadline: StoredDeadline;
  onToggleDone?: () => void;
  onPress?: () => void;
}

export const DeadlineCard: React.FC<DeadlineCardProps> = ({ deadline, onToggleDone, onPress }) => {
  const days = daysUntil(deadline.date);
  const color = urgencyColor(days, deadline.done);

  return (
    <Pressable onPress={onPress} style={[styles.card, deadline.done && styles.done]}>
      <View style={[styles.stripe, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.title, deadline.done && styles.struck]} numberOfLines={1}>
            {deadline.title}
          </Text>
          <View style={[styles.badge, { borderColor: color }]}>
            <Text style={[styles.badgeText, { color }]}>{urgencyLabel(days, deadline.done)}</Text>
          </View>
        </View>
        {deadline.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {deadline.description}
          </Text>
        ) : null}
        <View style={styles.bottomRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.date}>{deadline.date}</Text>
          {deadline.organization ? (
            <>
              <View style={styles.dot} />
              <Text style={styles.org}>{deadline.organization}</Text>
            </>
          ) : null}
        </View>
      </View>
      {onToggleDone ? (
        <Pressable onPress={onToggleDone} hitSlop={10} style={styles.check}>
          <Ionicons
            name={deadline.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={deadline.done ? Colors.success : Colors.textMuted}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  done: { opacity: 0.6 },
  stripe: { width: 4 },
  content: { flex: 1, padding: Spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', flex: 1, marginRight: 8 },
  struck: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  desc: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  date: { color: Colors.textMuted, fontSize: FontSize.xs, marginLeft: 5 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textMuted, marginHorizontal: 7 },
  org: { color: Colors.textMuted, fontSize: FontSize.xs },
  check: { justifyContent: 'center', paddingHorizontal: Spacing.md },
});
