import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { StoredDeadline } from './storage';

/**
 * Local notification helpers for deadline reminders.
 * Works on iOS/Android. On web it degrades gracefully (no-ops) because
 * expo-notifications scheduling is not supported there.
 */

const isWeb = Platform.OS === 'web';
let handlerConfigured = false;

/** Call once on app start so foreground notifications are shown. */
export function configureNotifications(): void {
  if (handlerConfigured || isWeb) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePermissions(): Promise<boolean> {
  if (isWeb) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

/** Days-before offsets at which to remind the user. */
const REMINDER_OFFSETS = [7, 3, 1, 0];

/**
 * Schedules reminders for a deadline (7/3/1 days before + on the day at 09:00).
 * Returns the scheduled notification ids (empty on web / no permission).
 */
export async function scheduleDeadlineReminders(deadline: StoredDeadline): Promise<string[]> {
  if (isWeb) return [];
  const granted = await ensurePermissions();
  if (!granted) return [];

  const due = new Date(`${deadline.date}T09:00:00`);
  if (isNaN(due.getTime())) return [];

  const ids: string[] = [];
  for (const daysBefore of REMINDER_OFFSETS) {
    const triggerDate = new Date(due);
    triggerDate.setDate(triggerDate.getDate() - daysBefore);
    if (triggerDate.getTime() <= Date.now()) continue; // skip past times

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title:
            daysBefore === 0
              ? `⏰ Due today: ${deadline.title}`
              : `⏰ In ${daysBefore} day${daysBefore > 1 ? 's' : ''}: ${deadline.title}`,
          body:
            deadline.description ||
            `${deadline.organization ? deadline.organization + ' — ' : ''}due ${deadline.date}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      ids.push(id);
    } catch {
      // ignore individual scheduling failures
    }
  }
  return ids;
}

export async function cancelReminders(ids?: string[]): Promise<void> {
  if (isWeb || !ids || ids.length === 0) return;
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined))
  );
}

export const notificationsSupported = !isWeb;
