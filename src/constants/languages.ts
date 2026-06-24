export type LanguageCode =
  | 'ka'
  | 'en'
  | 'ar'
  | 'ru'
  | 'bn'
  | 'zh'
  | 'hi'
  | 'es'
  | 'fr'
  | 'pt';

export interface Language {
  code: LanguageCode;
  /** Endonym (name in its own language). */
  name: string;
  /** English label. */
  englishName: string;
  flag: string;
  rtl: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'ka', name: 'ქართული', englishName: 'Georgian', flag: '🇬🇪', rtl: false },
  { code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧', rtl: false },
  { code: 'ar', name: 'العربية', englishName: 'Arabic', flag: '🇸🇦', rtl: true },
  { code: 'ru', name: 'Русский', englishName: 'Russian', flag: '🇷🇺', rtl: false },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', flag: '🇧🇩', rtl: false },
  { code: 'zh', name: '中文', englishName: 'Chinese (Mandarin)', flag: '🇨🇳', rtl: false },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳', rtl: false },
  { code: 'es', name: 'Español', englishName: 'Spanish', flag: '🇪🇸', rtl: false },
  { code: 'fr', name: 'Français', englishName: 'French', flag: '🇫🇷', rtl: false },
  { code: 'pt', name: 'Português', englishName: 'Portuguese', flag: '🇵🇹', rtl: false },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const getLanguage = (code: LanguageCode): Language =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[1];
