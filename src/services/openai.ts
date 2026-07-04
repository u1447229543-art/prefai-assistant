import { LanguageCode } from '../constants/languages';
import {
  API_URL,
  ApiError,
  aiExplainDocument,
  aiExplainForm,
  aiGenerateLetter,
  aiGenerateReply,
  aiTranslate,
  AdminOrg,
  AdminReply,
  DocumentExplanation,
  FormFieldHelp,
  SenderProfile,
} from './api';

/**
 * AI service for PrefAI Assistant.
 *
 * All OpenAI calls are proxied through the PrefAI backend (`/api/ai/*`).
 * The OpenAI API key lives server-side only (`OPENAI_API_KEY` on Railway).
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** True when the app can reach the backend AI proxy (requires login for real calls). */
export const isConfigured = (): boolean => API_URL.length > 0;

/** Journey step chat is not proxied yet — kept separate from main AI features. */
export const isStepAiConfigured = (): boolean => false;

export function getDiagnostics() {
  return {
    configured: isConfigured(),
    backendUrl: API_URL || '(empty)',
    proxyMode: true,
    model: 'gpt-4o (server)',
  };
}

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const d = getDiagnostics();
  // eslint-disable-next-line no-console
  console.log(
    `[PrefAI][AI] proxyMode=${d.proxyMode} backend=${d.backendUrl} configured=${d.configured}`
  );
}

function mapApiError(e: unknown): Error {
  if (e instanceof ApiError) {
    if (e.status === 401) {
      return new Error('Session expired. Please log in again to use AI features.');
    }
    if (e.status === 429) {
      return new Error('OpenAI rate limit / quota reached (429). Check your plan and billing, then try again.');
    }
    if (e.status === 503) {
      return new Error('AI is not configured on the server. Add OPENAI_API_KEY to the backend.');
    }
    return new Error(e.message);
  }
  return e instanceof Error ? e : new Error('AI request failed');
}

async function withBackend<T>(fn: () => Promise<T>, mock: () => T): Promise<T> {
  if (!isConfigured()) {
    return mock();
  }
  try {
    return await fn();
  } catch (e) {
    throw mapApiError(e);
  }
}

// Re-export types used by screens.
export type { AdminOrg, AdminReply, DocumentExplanation, FormFieldHelp, SenderProfile };

export async function explainDocument(
  documentText: string,
  language: LanguageCode
): Promise<DocumentExplanation> {
  return withBackend(
    () => aiExplainDocument(documentText, language),
    () => ({
      summary: '[Demo mode] Set EXPO_PUBLIC_API_URL and log in to use real AI.',
      keyPoints: ['Demo key point 1', 'Demo key point 2'],
      deadlines: ['2026-07-15'],
      nextSteps: ['Reply to the letter', 'Gather your documents'],
      organization: 'CAF',
    })
  );
}

export async function translateText(
  text: string,
  target: LanguageCode,
  source: LanguageCode | 'auto' = 'fr'
): Promise<string> {
  return withBackend(
    async () => {
      const out = await aiTranslate(text, target, source);
      return out.text;
    },
    () => '[Demo mode] Translation placeholder. Configure EXPO_PUBLIC_API_URL and log in.'
  );
}

export async function generateAdminReply(params: {
  organization: AdminOrg;
  situation: string;
  tone?: 'formal' | 'firm' | 'polite';
  language: LanguageCode;
  sender?: SenderProfile;
}): Promise<AdminReply> {
  return withBackend(
    () => aiGenerateReply(params),
    () => ({
      french:
        '[Mode démo] Madame, Monsieur,\n\nObjet : Exemple de courrier\n\nCeci est un exemple de lettre.\n\nVeuillez agréer, Madame, Monsieur, mes salutations distinguées.\n[Votre nom]',
      translation: '[Demo mode] Sample letter translation.',
      language: 'English',
    })
  );
}

export async function explainForm(
  formNameOrText: string,
  language: LanguageCode
): Promise<{ intro: string; fields: FormFieldHelp[]; requiredDocuments: string[] }> {
  return withBackend(
    () => aiExplainForm(formNameOrText, language),
    () => ({
      intro: '[Demo mode] Add EXPO_PUBLIC_API_URL and log in to enable AI.',
      fields: [
        { field: 'Nom', whatItMeans: 'Your family name', whatToWrite: 'Write your surname in capitals' },
      ],
      requiredDocuments: ['Passport', 'Proof of address'],
    })
  );
}

export interface ExtractedDeadline {
  title: string;
  date: string;
  description: string;
}

export async function extractDeadlines(
  _documentText: string,
  _language: LanguageCode
): Promise<ExtractedDeadline[]> {
  return [];
}

export async function chat(_history: ChatMessage[], _language: LanguageCode): Promise<string> {
  throw new Error('General chat is not available in this version.');
}

export async function askAboutStep(
  _stepContext: string,
  _history: ChatMessage[],
  _language: LanguageCode
): Promise<string> {
  throw new Error('Step assistant is not available in this version.');
}

export async function generateLetter(params: {
  purpose: string;
  recipient: string;
  language: LanguageCode;
  sender?: SenderProfile;
}): Promise<string> {
  return withBackend(
    async () => {
      const out = await aiGenerateLetter(params);
      return out.letter;
    },
    () => '[Demo mode] Letter placeholder. Configure EXPO_PUBLIC_API_URL and log in.'
  );
}
