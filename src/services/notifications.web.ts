import { StoredDeadline } from './storage';

/**
 * Web stub for the notifications service.
 *
 * expo-notifications does not support scheduled local notifications on web and
 * its web build can fail to resolve, so on web we provide safe no-ops. Metro
 * automatically picks this `.web.ts` file over `notifications.ts` for the web
 * platform.
 */

export function configureNotifications(): void {}

export async function ensurePermissions(): Promise<boolean> {
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function scheduleDeadlineReminders(_deadline: StoredDeadline): Promise<string[]> {
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function cancelReminders(_ids?: string[]): Promise<void> {}

export const notificationsSupported = false;
