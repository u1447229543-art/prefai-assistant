import { DocumentCategory } from '../services/storage';
import { TranslationKey } from './translations';

const CATEGORY_KEYS: Record<DocumentCategory, TranslationKey> = {
  passport: 'catPassport',
  visa: 'catVisa',
  caf: 'catCaf',
  cpam: 'catCpam',
  contract: 'catContract',
  tax: 'catTax',
  other: 'catOther',
};

export const getCategoryLabel = (
  t: (key: TranslationKey) => string,
  category: DocumentCategory
): string => t(CATEGORY_KEYS[category]);

export const TASK_TITLE_KEYS: Record<string, TranslationKey> = {
  'task-1': 'taskGatherDocs',
  'task-2': 'taskValidateVisa',
  'task-3': 'taskBankAccount',
};

export const getTaskTitle = (
  t: (key: TranslationKey) => string,
  taskId: string,
  fallback: string
): string => {
  const key = TASK_TITLE_KEYS[taskId];
  return key ? t(key) : fallback;
};

export const greetingKey = (): TranslationKey => {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 18) return 'goodAfternoon';
  return 'goodEvening';
};
