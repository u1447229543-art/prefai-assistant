import { Alert, Platform } from 'react-native';
import type { TranslationKey } from '../i18n/translations';

type Translate = (key: TranslationKey) => string;

/**
 * Shows a limit-reached alert with an optional Upgrade action.
 * Alert.alert is a no-op on web — use window.confirm there (same pattern as document delete).
 */
export function promptUpgrade(
  t: Translate,
  messageKey: TranslationKey,
  onUpgrade?: () => void
): void {
  const title = t('limitReached');
  const message = t(messageKey);

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      onUpgrade?.();
    }
    return;
  }

  const buttons = onUpgrade
    ? [
        { text: t('cancel'), style: 'cancel' as const },
        { text: t('upgrade'), onPress: onUpgrade },
      ]
    : [{ text: t('continue') }];

  Alert.alert(title, message, buttons);
}

export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    template
  );
}
