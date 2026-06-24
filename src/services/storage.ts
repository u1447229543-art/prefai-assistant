import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { LanguageCode } from '../constants/languages';
import { PlanId } from '../constants/pricing';

/**
 * Local persistence layer.
 * - AsyncStorage for non-sensitive app data (documents metadata, deadlines, prefs).
 * - SecureStore for sensitive values (auth token). Falls back to AsyncStorage on web.
 */

const Keys = {
  user: '@prefai/user',
  token: 'prefai_token',
  subscription: '@prefai/subscription',
  language: '@prefai/language',
  onboarded: '@prefai/onboarded',
  documents: '@prefai/documents',
  vault: '@prefai/vault',
  deadlines: '@prefai/deadlines',
  chat: '@prefai/chat',
  usage: '@prefai/usage',
} as const;

// ---- Generic helpers ------------------------------------------------------

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ---- Secure token ---------------------------------------------------------

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(Keys.token, token);
  } else {
    await SecureStore.setItemAsync(Keys.token, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(Keys.token);
  }
  return SecureStore.getItemAsync(Keys.token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(Keys.token);
  } else {
    await SecureStore.deleteItemAsync(Keys.token);
  }
}

// ---- Domain models --------------------------------------------------------

export interface StoredUser {
  id: string;
  email: string;
  /** Display name (kept for backwards compatibility; derived from first+last). */
  name: string;
  firstName: string;
  lastName: string;
  /** ISO date string yyyy-mm-dd. */
  dateOfBirth: string;
  nationality: string;
  /** National ID or passport number. */
  idNumber: string;
  phone: string;
  /** Full postal address in France. */
  address: string;
  createdAt: string;
}

/** Profile fields that can be edited after registration. */
export type EditableProfile = Pick<
  StoredUser,
  'firstName' | 'lastName' | 'dateOfBirth' | 'nationality' | 'idNumber' | 'phone' | 'address' | 'email'
>;

export type DocumentCategory =
  | 'passport'
  | 'visa'
  | 'caf'
  | 'cpam'
  | 'contract'
  | 'tax'
  | 'other';

export interface StoredDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  uri: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
  summary?: string;
}

export interface StoredDeadline {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  description?: string;
  organization?: string;
  done: boolean;
  /** Scheduled local-notification ids, so we can cancel them later. */
  notificationIds?: string[];
}

export interface StoredChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

export interface UsageRecord {
  month: string; // yyyy-mm
  documentsProcessed: number;
}

// ---- User -----------------------------------------------------------------

export const saveUser = (u: StoredUser) => setJSON(Keys.user, u);
export const loadUser = () => getJSON<StoredUser | null>(Keys.user, null);
export const clearUser = () => AsyncStorage.removeItem(Keys.user);

// ---- Subscription ---------------------------------------------------------

export const saveSubscription = (planId: PlanId) => setJSON(Keys.subscription, { planId });
export const loadSubscription = () => getJSON<{ planId: PlanId }>(Keys.subscription, { planId: 'free' });

// ---- Language & onboarding ------------------------------------------------

export const saveLanguage = (code: LanguageCode) => setJSON(Keys.language, code);
export const loadLanguage = () => getJSON<LanguageCode | null>(Keys.language, null);

export const setOnboarded = (v: boolean) => setJSON(Keys.onboarded, v);
export const loadOnboarded = () => getJSON<boolean>(Keys.onboarded, false);

// ---- Documents (recent / processed) ---------------------------------------

export const loadDocuments = () => getJSON<StoredDocument[]>(Keys.documents, []);
export async function addDocument(doc: StoredDocument): Promise<StoredDocument[]> {
  const docs = await loadDocuments();
  const next = [doc, ...docs].slice(0, 100);
  await setJSON(Keys.documents, next);
  return next;
}
export async function removeDocument(id: string): Promise<StoredDocument[]> {
  const docs = (await loadDocuments()).filter((d) => d.id !== id);
  await setJSON(Keys.documents, docs);
  return docs;
}

// ---- Vault (secured documents) --------------------------------------------

export const loadVault = () => getJSON<StoredDocument[]>(Keys.vault, []);
export async function addToVault(doc: StoredDocument): Promise<StoredDocument[]> {
  const docs = await loadVault();
  const next = [doc, ...docs];
  await setJSON(Keys.vault, next);
  return next;
}
export async function removeFromVault(id: string): Promise<StoredDocument[]> {
  const docs = (await loadVault()).filter((d) => d.id !== id);
  await setJSON(Keys.vault, docs);
  return docs;
}

// ---- Deadlines ------------------------------------------------------------

export const loadDeadlines = () => getJSON<StoredDeadline[]>(Keys.deadlines, []);
export async function saveDeadlines(list: StoredDeadline[]): Promise<void> {
  await setJSON(Keys.deadlines, list);
}
export async function addDeadlines(items: StoredDeadline[]): Promise<StoredDeadline[]> {
  const existing = await loadDeadlines();
  const next = [...items, ...existing].sort((a, b) => a.date.localeCompare(b.date));
  await setJSON(Keys.deadlines, next);
  return next;
}

// ---- Chat -----------------------------------------------------------------

export const loadChat = () => getJSON<StoredChatMessage[]>(Keys.chat, []);
export const saveChat = (msgs: StoredChatMessage[]) => setJSON(Keys.chat, msgs);

// ---- Usage / quota --------------------------------------------------------

const currentMonth = () => new Date().toISOString().slice(0, 7);

export async function loadUsage(): Promise<UsageRecord> {
  const usage = await getJSON<UsageRecord>(Keys.usage, {
    month: currentMonth(),
    documentsProcessed: 0,
  });
  if (usage.month !== currentMonth()) {
    const reset = { month: currentMonth(), documentsProcessed: 0 };
    await setJSON(Keys.usage, reset);
    return reset;
  }
  return usage;
}

export async function incrementUsage(): Promise<UsageRecord> {
  const usage = await loadUsage();
  const next = { ...usage, documentsProcessed: usage.documentsProcessed + 1 };
  await setJSON(Keys.usage, next);
  return next;
}

// ---- Reset ----------------------------------------------------------------

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(Keys).filter((k) => k.startsWith('@')));
  await clearToken();
}
