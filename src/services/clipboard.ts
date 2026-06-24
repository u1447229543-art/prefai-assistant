import { Platform, Share } from 'react-native';

/**
 * Copies text to the clipboard (web) or opens the native share sheet (iOS/Android).
 * Returns true if the action completed.
 */
export async function copyOrShare(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (Platform.OS === 'web') {
      const nav = (globalThis as any).navigator;
      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(text);
        return true;
      }
      return false;
    }
    await Share.share({ message: text });
    return true;
  } catch {
    return false;
  }
}
