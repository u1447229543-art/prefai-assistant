import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header, NeonButton, EmptyState, SectionTitle } from '../components/ui';
import { DeadlineCard } from '../components/DeadlineCard';
import { Calendar } from '../components/Calendar';
import { useApp } from '../context/AppContext';
import * as storage from '../services/storage';
import {
  cancelReminders,
  scheduleDeadlineReminders,
  notificationsSupported,
} from '../services/notifications';
import { daysUntil } from '../utils/deadlines';

export const DeadlineTrackerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useApp();
  const [items, setItems] = useState<storage.StoredDeadline[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [org, setOrg] = useState('');
  const [description, setDescription] = useState('');

  // Schedules reminders for any deadline that doesn't have them yet (e.g. ones
  // auto-extracted from documents), so upcoming deadlines always notify.
  const ensureReminders = useCallback(async (list: storage.StoredDeadline[]) => {
    if (!notificationsSupported) return list;
    let changed = false;
    const next = await Promise.all(
      list.map(async (d) => {
        if (d.done || d.notificationIds || daysUntil(d.date) < 0) return d;
        const ids = await scheduleDeadlineReminders(d);
        if (ids.length) {
          changed = true;
          return { ...d, notificationIds: ids };
        }
        return d;
      })
    );
    if (changed) await storage.saveDeadlines(next);
    return next;
  }, []);

  const reload = useCallback(() => {
    storage.loadDeadlines().then(async (list) => {
      setItems(await ensureReminders(list));
    });
  }, [ensureReminders]);

  useFocusEffect(useCallback(() => reload(), [reload]));

  const { upcoming, done } = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
    return {
      upcoming: sorted.filter((d) => !d.done),
      done: sorted.filter((d) => d.done),
    };
  }, [items]);

  const selectedItems = useMemo(
    () => (selectedDate ? items.filter((d) => d.date === selectedDate) : []),
    [items, selectedDate]
  );

  const persist = async (next: storage.StoredDeadline[]) => {
    setItems(next);
    await storage.saveDeadlines(next);
  };

  const toggle = async (item: storage.StoredDeadline) => {
    const nowDone = !item.done;
    let notificationIds = item.notificationIds;
    if (nowDone) {
      await cancelReminders(item.notificationIds);
      notificationIds = undefined;
    } else {
      notificationIds = await scheduleDeadlineReminders(item);
    }
    await persist(items.map((d) => (d.id === item.id ? { ...d, done: nowDone, notificationIds } : d)));
  };

  const removeItem = (item: storage.StoredDeadline) => {
    Alert.alert(t('delete'), `Delete "${item.title}"?`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await cancelReminders(item.notificationIds);
          await persist(items.filter((d) => d.id !== item.id));
        },
      },
    ]);
  };

  const openAdd = (prefillDate?: string) => {
    setTitle('');
    setDate(prefillDate ?? selectedDate ?? '');
    setOrg('');
    setDescription('');
    setAdding(true);
  };

  const save = async () => {
    if (!title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      Alert.alert('Missing info', 'Please enter a title and a date in the format YYYY-MM-DD.');
      return;
    }
    const base: storage.StoredDeadline = {
      id: `dl_${Date.now()}`,
      title: title.trim(),
      date: date.trim(),
      organization: org.trim() || undefined,
      description: description.trim() || undefined,
      done: false,
    };
    const notificationIds = await scheduleDeadlineReminders(base);
    const next = [{ ...base, notificationIds }, ...items].sort((a, b) => a.date.localeCompare(b.date));
    await persist(next);
    setAdding(false);
    setSelectedDate(base.date);
  };

  const hasItems = items.length > 0;

  return (
    <Screen>
      <Header
        title={t('deadlinesTitle')}
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={() => openAdd()} hitSlop={10}>
            <Ionicons name="add-circle" size={26} color={Colors.blue} />
          </Pressable>
        }
      />
      <Body>
        <Calendar deadlines={items} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Urgency legend */}
        <View style={styles.legend}>
          <Legend color={Colors.red} label="Urgent (≤3d)" />
          <Legend color={Colors.warning} label="Soon (≤10d)" />
          <Legend color={Colors.success} label="OK" />
        </View>

        {!notificationsSupported ? (
          <Text style={styles.webNote}>
            Reminders are delivered as device notifications on iOS & Android.
          </Text>
        ) : null}

        {/* Selected day */}
        {selectedDate ? (
          <>
            <SectionTitle
              right={
                <Pressable onPress={() => setSelectedDate(null)}>
                  <Text style={styles.clear}>Clear</Text>
                </Pressable>
              }
            >
              {selectedDate}
            </SectionTitle>
            {selectedItems.length === 0 ? (
              <Text style={styles.muted}>No deadlines on this day.</Text>
            ) : (
              selectedItems.map((d) => (
                <DeadlineCard
                  key={d.id}
                  deadline={d}
                  onToggleDone={() => toggle(d)}
                  onPress={() => removeItem(d)}
                />
              ))
            )}
            <NeonButton
              title={`Add deadline on ${selectedDate}`}
              onPress={() => openAdd(selectedDate)}
              variant="blue"
              icon="add"
              style={{ marginTop: Spacing.sm }}
            />
          </>
        ) : null}

        {/* All deadlines */}
        {!hasItems ? (
          <EmptyState
            icon="alarm-outline"
            title={t('noDeadlines')}
            subtitle="Tap a day to add one, or analyze a document — deadlines are extracted automatically."
          />
        ) : (
          <>
            <SectionTitle>{t('upcoming')}</SectionTitle>
            {upcoming.length === 0 ? (
              <Text style={styles.muted}>All caught up. 🎉</Text>
            ) : (
              upcoming.map((d) => (
                <DeadlineCard
                  key={d.id}
                  deadline={d}
                  onToggleDone={() => toggle(d)}
                  onPress={() => removeItem(d)}
                />
              ))
            )}

            {done.length > 0 ? (
              <>
                <SectionTitle>Completed</SectionTitle>
                {done.map((d) => (
                  <DeadlineCard
                    key={d.id}
                    deadline={d}
                    onToggleDone={() => toggle(d)}
                    onPress={() => removeItem(d)}
                  />
                ))}
              </>
            ) : null}
          </>
        )}
      </Body>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAdding(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>New deadline</Text>
          <TextInput
            style={styles.input}
            placeholder="Title (e.g. Send CAF documents)"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            placeholderTextColor={Colors.textMuted}
            value={date}
            onChangeText={setDate}
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            style={styles.input}
            placeholder="Organization (optional, e.g. CAF)"
            placeholderTextColor={Colors.textMuted}
            value={org}
            onChangeText={setOrg}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notes (optional)"
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          {notificationsSupported ? (
            <Text style={styles.reminderNote}>
              🔔 You'll be reminded 7, 3 and 1 day before, and on the day.
            </Text>
          ) : null}
          <NeonButton title={t('save')} onPress={save} variant="blueRed" icon="save-outline" />
        </View>
      </Modal>
    </Screen>
  );
};

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  webNote: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 4,
  },
  muted: { color: Colors.textSecondary, fontSize: FontSize.sm, paddingVertical: Spacing.sm },
  clear: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.cardElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.md },
  sheetTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
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
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  reminderNote: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.md, textAlign: 'center' },
});
