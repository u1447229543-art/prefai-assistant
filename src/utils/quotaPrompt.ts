import { Alert } from 'react-native';
import type { TranslationKey } from '../i18n/translations';

type Translate = (key: TranslationKey) => string;

/**
 * Shows a limit-reached alert with an optional Upgrade action.
 */
export function promptUpgrade(
  t: Translate,
  messageKey: TranslationKey,
  onUpgrade?: () => void
): void {
  const buttons = onUpgrade
    ? [
        { text: t('cancel'), style: 'cancel' as const },
        { text: t('upgrade'), onPress: onUpgrade },
      ]
    : [{ text: t('continue') }];

  Alert.alert(t('limitReached'), t(messageKey), buttons);
}

export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    template
  );
}
