import { LanguageCode, getLanguage } from '../constants/languages';

/**
 * OpenAI service for PrefAI Assistant.
 *
 * The API key is read from the public Expo env var `EXPO_PUBLIC_OPENAI_API_KEY`.
 * For production you should proxy these calls through your own backend so the key
 * is never shipped in the client bundle. The functions below are written so the
 * UI can call them directly during development and be swapped to a backend later.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o';

const API_KEY = (process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '').trim();

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const isConfigured = (): boolean => API_KEY.length > 0;

/**
 * Diagnostics for debugging key issues without ever exposing the full secret.
 * Every genuine OpenAI key contains the marker `T3BlbkFJ`; if `looksLikeRealKey`
 * is false, the value in EXPO_PUBLIC_OPENAI_API_KEY is not a real OpenAI key.
 */
export function getDiagnostics() {
  return {
    configured: isConfigured(),
    keyLength: API_KEY.length,
    keyPrefix: API_KEY ? API_KEY.slice(0, 7) : '(empty)',
    looksLikeRealKey: API_KEY.includes('T3BlbkFJ'),
    model: MODEL,
  };
}

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const d = getDiagnostics();
  // eslint-disable-next-line no-console
  console.log(
    `[PrefAI][OpenAI] key loaded=${d.configured} length=${d.keyLength} ` +
      `prefix=${d.keyPrefix} looksLikeRealKey=${d.looksLikeRealKey}` +
      (d.configured && !d.looksLikeRealKey
        ? ' -> WARNING: this is NOT a valid OpenAI key (missing T3BlbkFJ marker / likely truncated).'
        : '')
  );
}

interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseJson?: boolean;
}

async function complete(
  messages: ChatMessage[],
  { temperature = 0.4, maxTokens = 1200, responseJson = false }: CompletionOptions = {}
): Promise<string> {
  if (!isConfigured()) {
    // Graceful fallback so the app remains usable for demos without a key.
    return mockResponse(messages);
  }

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      max_tokens: maxTokens,
      messages,
      ...(responseJson ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) {
      throw new Error(
        'OpenAI rejected the API key (401). Set a valid full key in EXPO_PUBLIC_OPENAI_API_KEY (.env) and restart the dev server.'
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

const langName = (code: LanguageCode) => getLanguage(code).englishName;

const SYSTEM_BASE =
  'You are PrefAI Assistant, an expert in French administrative procedures (CAF, CPAM, ANEF, Préfecture, Impôts, Pôle Emploi, etc.). ' +
  'You help immigrants, expats and refugees understand and manage French bureaucracy. ' +
  'You are accurate, reassuring and never invent legal facts. You always remind users you do not replace official government services.';

// ---------------------------------------------------------------------------
// Feature-specific helpers
// ---------------------------------------------------------------------------

export interface DocumentExplanation {
  summary: string;
  keyPoints: string[];
  deadlines: string[];
  nextSteps: string[];
  organization: string;
}

export async function explainDocument(
  documentText: string,
  language: LanguageCode
): Promise<DocumentExplanation> {
  const content = await complete(
    [
      { role: 'system', content: SYSTEM_BASE },
      {
        role: 'user',
        content:
          `Analyse the following French administrative document and reply in ${langName(
            language
          )}. ` +
          `Return strict JSON with keys: summary (string, plain simple language), keyPoints (array of strings), ` +
          `deadlines (array of strings with dates if any), nextSteps (array of strings), organization (string, e.g. CAF/CPAM).\n\n` +
          `DOCUMENT:\n${documentText}`,
      },
    ],
    { responseJson: true, temperature: 0.2 }
  );

  try {
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary ?? '',
      keyPoints: parsed.keyPoints ?? [],
      deadlines: parsed.deadlines ?? [],
      nextSteps: parsed.nextSteps ?? [],
      organization: parsed.organization ?? 'Administration',
    };
  } catch {
    return {
      summary: content,
      keyPoints: [],
      deadlines: [],
      nextSteps: [],
      organization: 'Administration',
    };
  }
}

export async function translateText(
  text: string,
  target: LanguageCode,
  source: LanguageCode | 'auto' = 'fr'
): Promise<string> {
  const sourceLabel = source === 'auto' ? 'the detected language' : langName(source as LanguageCode);
  return complete(
    [
      { role: 'system', content: SYSTEM_BASE },
      {
        role: 'user',
        content:
          `Translate this French administrative text from ${sourceLabel} into ${langName(target)}. ` +
          `Keep administrative terms precise, preserve names of organizations, and add a short note in brackets ` +
          `when a term has no direct equivalent. Reply with the translation only.\n\n${text}`,
      },
    ],
    { temperature: 0.2 }
  );
}

export type AdminOrg =
  | 'CAF'
  | 'CPAM'
  | 'Préfecture'
  | 'Impôts'
  | 'Pôle Emploi'
  | 'ANEF'
  | 'Other';

/** Real sender details used to auto-fill generated letters. */
export interface SenderProfile {
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  idNumber?: string;
  phone?: string;
  address?: string;
  email?: string;
}

function senderBlock(s?: SenderProfile): string {
  if (!s) return '';
  const lines = [
    s.fullName && `Nom complet : ${s.fullName}`,
    s.dateOfBirth && `Date de naissance : ${s.dateOfBirth}`,
    s.nationality && `Nationalité : ${s.nationality}`,
    s.idNumber && `Numéro de pièce d'identité / passeport : ${s.idNumber}`,
    s.address && `Adresse : ${s.address}`,
    s.phone && `Téléphone : ${s.phone}`,
    s.email && `Email : ${s.email}`,
  ].filter(Boolean);
  if (lines.length === 0) return '';
  return (
    `\n\nUse THESE real sender details to fill the letter. Insert them in the sender block and body where relevant, ` +
    `and DO NOT leave a [placeholder] for any value provided here. Only keep [brackets] for data that is missing:\n` +
    lines.join('\n')
  );
}

export interface AdminReply {
  /** The official letter in French — this is what the user sends. */
  french: string;
  /** Full translation of the letter in the user's own (app) language. */
  translation: string;
  /** English name of the language the translation is written in. */
  language: string;
}

export async function generateAdminReply(params: {
  organization: AdminOrg;
  situation: string;
  tone?: 'formal' | 'firm' | 'polite';
  /** The user's app language — the translation is produced in this language. */
  language: LanguageCode;
  /** Optional real sender details to auto-fill the letter. */
  sender?: SenderProfile;
}): Promise<AdminReply> {
  const { organization, situation, tone = 'formal', language, sender } = params;
  const targetLanguage = langName(language);

  // Step 1 — generate the official French letter as plain text (no JSON, so it
  // can never be truncated into invalid JSON the way a combined response could).
  const french = (
    await complete(
      [
        { role: 'system', content: SYSTEM_BASE },
        {
          role: 'user',
          content:
            `The user describes their situation in their OWN language (Georgian, Arabic, Chinese, Russian, Hindi, Bengali, English, etc.). ` +
            `Understand it, then write a complete, ready-to-send official French administrative letter addressed to ${organization}. ` +
            `Tone: ${tone}. Use correct French structure (expéditeur/destinataire, date, "Objet :", corps, formule de politesse) ` +
            `and placeholders such as [Votre nom], [Votre adresse], [Numéro allocataire] where personal data is needed. ` +
            `Reply with ONLY the letter in French — no preamble, no explanation.\n\n` +
            `User's situation: "${situation}"` +
            senderBlock(sender),
        },
      ],
      { temperature: 0.5, maxTokens: 1500 }
    )
  ).trim();

  // Step 2 — translate the finished letter into the user's language in a
  // separate call so the translation is always produced reliably. Wrapped in
  // try/catch so a translation hiccup never drops the whole result.
  let translation = '';
  if (french && language !== 'fr') {
    try {
      translation = (await translateText(french, language, 'fr')).trim();
    } catch {
      translation = '';
    }
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log(
      `[PrefAI][AIReply] frenchLen=${french.length} translationLen=${translation.length} target=${targetLanguage}`
    );
  }

  return { french, translation, language: targetLanguage };
}

export interface FormFieldHelp {
  field: string;
  whatItMeans: string;
  whatToWrite: string;
}

export async function explainForm(
  formNameOrText: string,
  language: LanguageCode
): Promise<{ intro: string; fields: FormFieldHelp[]; requiredDocuments: string[] }> {
  const content = await complete(
    [
      { role: 'system', content: SYSTEM_BASE },
      {
        role: 'user',
        content:
          `The user needs help filling a French administrative form. Reply in ${langName(language)}. ` +
          `Return strict JSON: { "intro": string, "fields": [{"field": string, "whatItMeans": string, "whatToWrite": string}], "requiredDocuments": [string] }. ` +
          `Form: "${formNameOrText}".`,
      },
    ],
    { responseJson: true, temperature: 0.3 }
  );
  try {
    const parsed = JSON.parse(content);
    return {
      intro: parsed.intro ?? '',
      fields: parsed.fields ?? [],
      requiredDocuments: parsed.requiredDocuments ?? [],
    };
  } catch {
    return { intro: content, fields: [], requiredDocuments: [] };
  }
}

export interface ExtractedDeadline {
  title: string;
  date: string;
  description: string;
}

export async function extractDeadlines(
  documentText: string,
  language: LanguageCode
): Promise<ExtractedDeadline[]> {
  const content = await complete(
    [
      { role: 'system', content: SYSTEM_BASE },
      {
        role: 'user',
        content:
          `Extract every deadline, due date or appointment from this French document. Reply in ${langName(
            language
          )}. ` +
          `Return strict JSON: { "deadlines": [{"title": string, "date": string (ISO yyyy-mm-dd if possible), "description": string}] }.\n\n${documentText}`,
      },
    ],
    { responseJson: true, temperature: 0.1 }
  );
  try {
    const parsed = JSON.parse(content);
    return parsed.deadlines ?? [];
  } catch {
    return [];
  }
}

export async function chat(
  history: ChatMessage[],
  language: LanguageCode
): Promise<string> {
  return complete(
    [
      {
        role: 'system',
        content:
          SYSTEM_BASE +
          ` Always reply in ${langName(language)} unless the user writes in another language. ` +
          `Keep answers concise, practical and step-by-step.`,
      },
      ...history,
    ],
    { temperature: 0.5 }
  );
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
  return complete(
    [
      {
        role: 'system',
        content:
          SYSTEM_BASE +
          `\n\nThe user is working on this specific administrative step in France:\n${stepContext}\n\n` +
          `Answer ONLY about this step and closely related questions. Be concrete and specific. ` +
          `Reply in ${langName(language)} unless the user writes in another language. ` +
          `Use short, plain language and bullet points or numbered steps. No legal jargon, no walls of text.`,
      },
      ...history,
    ],
    { temperature: 0.4, maxTokens: 700 }
  );
}

export async function generateLetter(params: {
  purpose: string;
  recipient: string;
  language: LanguageCode;
  sender?: SenderProfile;
}): Promise<string> {
  const { purpose, recipient, language, sender } = params;
  return complete(
    [
      { role: 'system', content: SYSTEM_BASE },
      {
        role: 'user',
        content:
          `Generate a complete formal French letter addressed to ${recipient} for this purpose: "${purpose}". ` +
          `Include sender/recipient blocks, date placeholder, "Objet:", body and "formule de politesse". ` +
          `Use placeholders in [brackets] only for data that is missing. After the letter add a one-line explanation in ${langName(language)}.` +
          senderBlock(sender),
      },
    ],
    { temperature: 0.5 }
  );
}

// ---------------------------------------------------------------------------
// Mock fallback (no API key configured)
// ---------------------------------------------------------------------------

function mockResponse(messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]?.content ?? '';
  if (last.includes('"summary"') || last.includes('STRICT JSON') || last.includes('strict JSON')) {
    return JSON.stringify({
      summary:
        '[Demo mode] This is a sample explanation. Add your OpenAI API key (EXPO_PUBLIC_OPENAI_API_KEY) to get real AI results.',
      keyPoints: ['Demo key point 1', 'Demo key point 2'],
      deadlines: ['2026-07-15'],
      nextSteps: ['Reply to the letter', 'Gather your documents'],
      organization: 'CAF',
      intro: '[Demo mode] Add your OpenAI key to enable AI.',
      fields: [
        { field: 'Nom', whatItMeans: 'Your family name', whatToWrite: 'Write your surname in capitals' },
      ],
      requiredDocuments: ['Passport', 'Proof of address'],
      detectedLanguage: 'English',
      french:
        '[Mode démo] Madame, Monsieur,\n\nObjet : Exemple de courrier\n\nCeci est un exemple de lettre. Ajoutez votre clé OpenAI pour générer un vrai courrier.\n\nVeuillez agréer, Madame, Monsieur, mes salutations distinguées.\n[Votre nom]',
      translation:
        '[Demo mode] This is a sample letter translation. Add your OpenAI API key to generate a real letter and its translation.',
    });
  }
  return '[Demo mode] Add your OpenAI API key (EXPO_PUBLIC_OPENAI_API_KEY) in a .env file to enable real AI responses. For now this is placeholder text demonstrating the UI.';
}
