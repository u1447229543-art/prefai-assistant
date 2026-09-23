import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as api from './api';
import { ensurePermissions } from './notifications';

const isWeb = Platform.OS === 'web';

function projectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId
  );
}

/**
 * Request permission (if needed), fetch Expo push token, POST to backend.
 * No-ops on web / when logged out / when permission denied.
 */
export async function registerExpoPushToken(): Promise<string | null> {
  if (isWeb) return null;
  try {
    const granted = await ensurePermissions();
    if (!granted) return null;

    const pid = projectId();
    if (!pid) {
      console.warn('[push] Missing EAS projectId — cannot get Expo push token');
      return null;
    }

    const result = await Notifications.getExpoPushTokenAsync({ projectId: pid });
    const token = result?.data?.trim();
    if (!token) return null;

    await api.savePushToken(token);
    return token;
  } catch (err) {
    console.warn('[push] register failed', err);
    return null;
  }
}
