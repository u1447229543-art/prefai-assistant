import { LanguageCode, getLanguage } from '../constants/languages';
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
 * Most OpenAI calls are proxied through the PrefAI backend (`/api/ai/*`).
 * Journey step chat still uses `EXPO_PUBLIC_OPENAI_API_KEY` on the client
 * until a dedicated `/api/ai/step` route is available.
 */

const STEP_OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const STEP_MODEL = 'gpt-4o';
const STEP_API_KEY = (process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '').trim();

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** True when the app can reach the backend AI proxy (requires login for real calls). */
export const isConfigured = (): boolean => API_URL.length > 0;

/** True when journey step chat can call OpenAI (client key present). */
export const isStepAiConfigured = (): boolean => STEP_API_KEY.length > 0;

export function getDiagnostics() {
  return {
    configured: isConfigured(),
    backendUrl: API_URL || '(empty)',
    proxyMode: true,
    model: 'gpt-4o (server)',
    stepAiConfigured: isStepAiConfigured(),
  };
}

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const d = getDiagnostics();
  // eslint-disable-next-line no-console
  console.log(
    `[PrefAI][AI] proxyMode=${d.proxyMode} backend=${d.backendUrl} configured=${d.configured} stepAi=${d.stepAiConfigured}`
  );
}

function mapApiError(e: unknown): Error {
  if (e instanceof ApiError) {
    if (e.status === 401) {
      return new Error('Session expired. Please log in again to use AI features.');
    }
    if (e.status === 404) {
      return new Error(
        'AI service is not available on the server yet. Redeploy the backend with /api/ai routes enabled.'
      );
    }
    if (e.status === 429) {
      return new Error('OpenAI rate limit / quota reached (429). Check your plan and billing, then try again.');
    }
    if (e.status === 502 && e.message.includes('OpenAI rejected the API key')) {
      return new Error(
        'The server OpenAI API key is invalid. Update OPENAI_API_KEY on Railway and redeploy the backend.'
      );
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

const STEP_SYSTEM_BASE =
  'You are PrefAI Assistant, an expert in French administrative procedures (CAF, CPAM, ANEF, Préfecture, Impôts, Pôle Emploi, etc.). ' +
  'You help immigrants, expats and refugees understand and manage French bureaucracy. ' +
  'You are accurate, reassuring and never invent legal facts. You always remind users you do not replace official government services.';

async function completeStepChat(messages: ChatMessage[]): Promise<string> {
  if (!isStepAiConfigured()) {
    throw new Error(
      'Step assistant is not configured. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env and restart the app.'
    );
  }

  const res = await fetch(STEP_OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STEP_API_KEY}`,
    },
    body: JSON.stringify({
      model: STEP_MODEL,
      temperature: 0.4,
      max_tokens: 700,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) {
      throw new Error(
        'OpenAI rejected the API key (401). Set a valid EXPO_PUBLIC_OPENAI_API_KEY in .env and restart.'
      );
    }
    if (res.status === 429) {
      throw new Error('OpenAI rate limit / quota reached (429). Check your plan and billing, then try again.');
    }
    throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? '';
}

/**
 * Step-aware assistant. `stepContext` is pre-loaded so the model answers
 * questions specifically about the administrative step the user is on.
 */
export async function askAboutStep(
  stepContext: string,
  history: ChatMessage[],
  language: LanguageCode
): Promise<string> {
  const langName = getLanguage(language).englishName;
  return completeStepChat([
    {
      role: 'system',
      content:
        STEP_SYSTEM_BASE +
        `\n\nThe user is working on this specific administrative step in France:\n${stepContext}\n\n` +
        `Answer ONLY about this step and closely related questions. Be concrete and specific. ` +
        `Reply in ${langName} unless the user writes in another language. ` +
        `Use short, plain language and bullet points or numbered steps. No legal jargon, no walls of text.`,
    },
    ...history.filter((m) => m.role === 'user' || m.role === 'assistant'),
  ]);
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
