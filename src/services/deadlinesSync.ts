/**
 * Deadline Tracker ↔ ExpiryItem API sync layer.
 * Keeps StoredDeadline UI shape; Mongo is source of truth when online + logged in.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from './api';
import * as storage from './storage';
import { ApiError, isMongoObjectId, isNetworkError } from './api';

const MIGRATED_KEY = '@prefai/expiry_items_migrated_v1';

export type ExpiryCategory =
  | 'logement'
  | 'sante'
  | 'travail'
  | 'famille'
  | 'documents'
  | 'finance';

export interface ApiExpiryItem {
  id: string;
  title: string;
  category: ExpiryCategory;
  expiryDate: string;
  reminderDaysBefore: number[];
  status: 'active' | 'expired' | 'renewed';
  notes: string;
  organization: string;
  createdAt?: string;
  updatedAt?: string;
}

function toIsoDate(value: string | Date): string {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function apiItemToStored(
  item: ApiExpiryItem,
  notificationIds?: string[]
): storage.StoredDeadline {
  return {
    id: item.id,
    title: item.title,
    date: toIsoDate(item.expiryDate),
    description: item.notes || undefined,
    organization: item.organization || undefined,
    done: item.status === 'renewed' || item.status === 'expired',
    notificationIds,
  };
}

function mergeNotificationIds(
  items: storage.StoredDeadline[],
  previous: storage.StoredDeadline[]
): storage.StoredDeadline[] {
  const map = new Map(previous.map((d) => [d.id, d.notificationIds]));
  return items.map((d) => ({
    ...d,
    notificationIds: d.notificationIds ?? map.get(d.id),
  }));
}

async function hasAuthToken(): Promise<boolean> {
  const token = await storage.getToken();
  return !!token && !token.startsWith('demo_token_');
}

/** One-time: POST legacy AsyncStorage deadlines to API, then mark migrated. */
export async function migrateLocalDeadlinesIfNeeded(): Promise<void> {
  if (!(await hasAuthToken())) return;
  const flag = await AsyncStorage.getItem(MIGRATED_KEY);
  if (flag === '1') return;

  const local = await storage.loadDeadlines();
  for (const d of local) {
    if (isMongoObjectId(d.id)) continue;
    try {
      await api.createExpiryItem({
        title: d.title,
        category: 'documents',
        expiryDate: d.date,
        notes: d.description || '',
        organization: d.organization || '',
        status: d.done ? 'renewed' : 'active',
        reminderDaysBefore: [7, 3, 1, 0],
      });
    } catch (e) {
      // Stop early on auth errors; retry next launch.
      if (e instanceof ApiError && e.status === 401) return;
      console.warn('[deadlines] migrate item failed', d.id, e);
    }
  }

  await AsyncStorage.setItem(MIGRATED_KEY, '1');
  // Keep local list as offline cache until next successful fetch replaces it.
}

/** Fetch from API (after migration), cache locally. Falls back to AsyncStorage offline. */
export async function loadDeadlinesSynced(): Promise<storage.StoredDeadline[]> {
  const previous = await storage.loadDeadlines();

  if (!(await hasAuthToken())) {
    return previous;
  }

  try {
    await migrateLocalDeadlinesIfNeeded();
    const { items } = await api.listExpiryItems();
    const mapped = items.map((it) => apiItemToStored(it));
    const merged = mergeNotificationIds(mapped, previous);
    await storage.saveDeadlines(merged);
    return merged;
  } catch (e) {
    if (isNetworkError(e)) return previous;
    console.warn('[deadlines] load failed', e);
    return previous;
  }
}

export async function createDeadlineSynced(
  input: Omit<storage.StoredDeadline, 'id' | 'notificationIds'> & { id?: string }
): Promise<storage.StoredDeadline> {
  if (await hasAuthToken()) {
    try {
      const { item } = await api.createExpiryItem({
        title: input.title,
        category: 'documents',
        expiryDate: input.date,
        notes: input.description || '',
        organization: input.organization || '',
        status: input.done ? 'renewed' : 'active',
        reminderDaysBefore: [7, 3, 1, 0],
      });
      return apiItemToStored(item);
    } catch (e) {
      if (!isNetworkError(e)) throw e;
    }
  }

  const local: storage.StoredDeadline = {
    id: input.id || `dl_${Date.now()}`,
    title: input.title,
    date: input.date,
    description: input.description,
    organization: input.organization,
    done: input.done,
  };
  const list = await storage.loadDeadlines();
  await storage.saveDeadlines([local, ...list]);
  return local;
}

export async function updateDeadlineSynced(
  item: storage.StoredDeadline
): Promise<storage.StoredDeadline> {
  if ((await hasAuthToken()) && isMongoObjectId(item.id)) {
    try {
      const { item: updated } = await api.updateExpiryItem(item.id, {
        title: item.title,
        expiryDate: item.date,
        notes: item.description || '',
        organization: item.organization || '',
        status: item.done ? 'renewed' : 'active',
      });
      return { ...apiItemToStored(updated), notificationIds: item.notificationIds };
    } catch (e) {
      if (!isNetworkError(e)) throw e;
    }
  }

  const list = await storage.loadDeadlines();
  const next = list.map((d) => (d.id === item.id ? item : d));
  await storage.saveDeadlines(next);
  return item;
}

export async function deleteDeadlineSynced(id: string): Promise<void> {
  if ((await hasAuthToken()) && isMongoObjectId(id)) {
    try {
      await api.deleteExpiryItem(id);
    } catch (e) {
      if (!isNetworkError(e)) throw e;
    }
  }
  const list = await storage.loadDeadlines();
  await storage.saveDeadlines(list.filter((d) => d.id !== id));
}

export async function persistDeadlinesCache(list: storage.StoredDeadline[]): Promise<void> {
  await storage.saveDeadlines(list);
}
