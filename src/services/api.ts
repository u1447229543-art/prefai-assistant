import * as storage from './storage';

/**
 * REST client for the PrefAI backend.
 * JWT is attached automatically; 401 triggers the registered logout handler.
 * Network failures throw ApiError with status 0 so callers can fall back to cache.
 */

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const isNetworkError = (e: unknown): boolean =>
  e instanceof ApiError && e.status === 0;

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** Register a callback invoked on 401 (typically logout + redirect to auth). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  nationality: string;
  city: string;
  phoneNumber: string;
  idNumber: string;
  dateOfBirth: string;
  address: string;
  subscriptionPlan: 'free' | 'basic' | 'pro';
  documentsUsedThisMonth: number;
  createdAt: string;
}

export interface ApiJourney {
  journeyType: string;
  completedSteps: string[];
  progress: number;
  startedAt?: string;
}

export interface ApiDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: string;
  fileUrl: string;
  uploadedAt: string;
}

const BACKEND_TO_CATEGORY: Record<string, storage.DocumentCategory> = {
  CAF: 'caf',
  CPAM: 'cpam',
  ANEF: 'visa',
  Prefecture: 'passport',
  Other: 'other',
};

export const CATEGORY_TO_BACKEND: Record<storage.DocumentCategory, string> = {
  passport: 'Prefecture',
  visa: 'ANEF',
  caf: 'CAF',
  cpam: 'CPAM',
  contract: 'Other',
  tax: 'Other',
  other: 'Other',
};

async function request<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (withAuth) {
    const token = await storage.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0);
  }

  const text = await res.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError('Invalid server response', res.status);
    }
  }

  if (res.status === 401) {
    onUnauthorized?.();
    throw new ApiError(
      typeof data.error === 'string' ? data.error : 'Session expired. Please log in again.',
      401
    );
  }

  if (!res.ok) {
    throw new ApiError(
      typeof data.error === 'string' ? data.error : `Request failed (${res.status})`,
      res.status
    );
  }

  return data as T;
}

/** Map backend user → app's StoredUser. */
export function toStoredUser(u: ApiUser): storage.StoredUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name || `${u.firstName} ${u.lastName}`.trim() || u.email.split('@')[0],
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    dateOfBirth: u.dateOfBirth || '',
    nationality: u.nationality || '',
    idNumber: u.idNumber || '',
    phone: u.phoneNumber || '',
    address: u.address || '',
    city: u.city || '',
    createdAt: u.createdAt || new Date().toISOString(),
  };
}

/** Map backend journey → app's JourneyProgress. */
export function toJourneyProgress(j: ApiJourney): storage.JourneyProgress {
  return {
    journeyId: j.journeyType as storage.JourneyProgress['journeyId'],
    completedStepIds: j.completedSteps || [],
    startedAt: j.startedAt,
    progress: j.progress ?? 0,
  };
}

/** Map backend document → app's StoredDocument. */
export function toStoredDocument(d: ApiDocument): storage.StoredDocument {
  return {
    id: d.id,
    remoteId: d.id,
    name: d.fileName,
    category: BACKEND_TO_CATEGORY[d.category] ?? 'other',
    uri: d.fileUrl,
    mimeType: d.fileType,
    size: d.fileSize,
    createdAt: d.uploadedAt || new Date().toISOString(),
  };
}

// ---- Auth -----------------------------------------------------------------

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  nationality?: string;
  city?: string;
  phoneNumber?: string;
  idNumber?: string;
  dateOfBirth?: string;
  address?: string;
}

export async function register(payload: RegisterPayload): Promise<{ token: string; user: ApiUser }> {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }, false);
}

export async function login(email: string, password: string): Promise<{ token: string; user: ApiUser }> {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false);
}

export async function me(): Promise<{ user: ApiUser }> {
  return request('/api/auth/me', { method: 'GET' });
}

// ---- User -----------------------------------------------------------------

export async function getProfile(): Promise<{ user: ApiUser }> {
  return request('/api/user/profile', { method: 'GET' });
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  nationality?: string;
  city?: string;
  phoneNumber?: string;
  idNumber?: string;
  dateOfBirth?: string;
  address?: string;
}

export async function updateProfile(data: ProfileUpdate): Promise<{ user: ApiUser }> {
  return request('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) });
}

export async function getSubscription(): Promise<{
  plan: string;
  documentsUsedThisMonth: number;
  documentLimit: number | null;
}> {
  return request('/api/user/subscription', { method: 'GET' });
}

// ---- Journey --------------------------------------------------------------

export async function getJourney(): Promise<{ journey: ApiJourney | null }> {
  return request('/api/journey', { method: 'GET' });
}

export async function setJourney(journeyType: string): Promise<{ journey: ApiJourney }> {
  return request('/api/journey', { method: 'POST', body: JSON.stringify({ journeyType }) });
}

export async function completeStep(stepId: string, completed?: boolean): Promise<{ journey: ApiJourney }> {
  return request(`/api/journey/step/${encodeURIComponent(stepId)}`, {
    method: 'PUT',
    body: JSON.stringify(completed === undefined ? {} : { completed }),
  });
}

export async function getProgress(): Promise<{
  progress: number;
  completedSteps: string[];
  journeyType: string | null;
}> {
  return request('/api/journey/progress', { method: 'GET' });
}

// ---- Documents ------------------------------------------------------------

export async function getDocuments(): Promise<{ documents: ApiDocument[] }> {
  return request('/api/documents', { method: 'GET' });
}

export interface DocumentPayload {
  fileName: string;
  fileSize?: number;
  fileType?: string;
  category?: string;
  fileUrl?: string;
}

export async function addDocument(payload: DocumentPayload): Promise<{ document: ApiDocument }> {
  return request('/api/documents', { method: 'POST', body: JSON.stringify(payload) });
}

export async function deleteDocument(id: string): Promise<{ success: boolean; id: string }> {
  return request(`/api/documents/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ---- AI (proxied through backend; OpenAI key stays server-side) ------------

export interface DocumentExplanation {
  summary: string;
  keyPoints: string[];
  deadlines: string[];
  nextSteps: string[];
  organization: string;
}

export interface FormFieldHelp {
  field: string;
  whatItMeans: string;
  whatToWrite: string;
}

export interface AdminReply {
  french: string;
  translation: string;
  language: string;
}

export type AdminOrg =
  | 'CAF'
  | 'CPAM'
  | 'Préfecture'
  | 'Impôts'
  | 'Pôle Emploi'
  | 'ANEF'
  | 'Other';

export interface SenderProfile {
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  idNumber?: string;
  phone?: string;
  address?: string;
  email?: string;
}

export async function aiExplainDocument(
  documentText: string,
  language: string
): Promise<DocumentExplanation> {
  return request('/api/ai/explain', {
    method: 'POST',
    body: JSON.stringify({ documentText, language }),
  });
}

export async function aiTranslate(
  text: string,
  target: string,
  source: string | 'auto' = 'fr'
): Promise<{ text: string }> {
  return request('/api/ai/translate', {
    method: 'POST',
    body: JSON.stringify({ text, target, source }),
  });
}

export async function aiGenerateReply(params: {
  organization: AdminOrg;
  situation: string;
  tone?: 'formal' | 'firm' | 'polite';
  language: string;
  sender?: SenderProfile;
}): Promise<AdminReply> {
  return request('/api/ai/reply', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function aiExplainForm(
  formNameOrText: string,
  language: string
): Promise<{ intro: string; fields: FormFieldHelp[]; requiredDocuments: string[] }> {
  return request('/api/ai/form-assist', {
    method: 'POST',
    body: JSON.stringify({ formNameOrText, language }),
  });
}

export async function aiGenerateLetter(params: {
  purpose: string;
  recipient: string;
  language: string;
  sender?: SenderProfile;
}): Promise<{ letter: string }> {
  return request('/api/ai/pdf', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export { API_URL };
