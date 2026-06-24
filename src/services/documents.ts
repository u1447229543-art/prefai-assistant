import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { DocumentCategory, StoredDocument } from './storage';

export interface PickedDocument {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
}

/** Opens the system document picker. Returns null if cancelled. */
export async function pickDocument(): Promise<PickedDocument | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*', 'text/*', 'application/msword'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  return {
    name: asset.name,
    uri: asset.uri,
    mimeType: asset.mimeType,
    size: asset.size ?? undefined,
  };
}

/**
 * Attempts to read text content from a picked document.
 * Works for text-based files; for PDFs/images we can't OCR on-device, so we
 * return the file name as context for the AI (the user can also paste text).
 */
export async function readDocumentText(doc: PickedDocument): Promise<string> {
  const isTextual =
    doc.mimeType?.startsWith('text/') || /\.(txt|md|csv|json|html?)$/i.test(doc.name);

  if (isTextual) {
    try {
      const res = await fetch(doc.uri);
      const text = await res.text();
      if (text && text.trim().length > 0) return text.slice(0, 12000);
    } catch {
      // fall through
    }
  }

  return (
    `[Document: ${doc.name}${doc.mimeType ? ` (${doc.mimeType})` : ''}]\n` +
    `The user uploaded a non-text document (likely a scan or PDF). ` +
    `Based on the file name and typical French administrative documents, provide guidance. ` +
    `If you need the exact content, ask the user to paste the text.`
  );
}

let counter = 0;
export function makeDocId(): string {
  counter += 1;
  return `doc_${Date.now()}_${counter}`;
}

export function toStoredDocument(
  picked: PickedDocument,
  category: DocumentCategory,
  summary?: string
): StoredDocument {
  return {
    id: makeDocId(),
    name: picked.name,
    category,
    uri: picked.uri,
    mimeType: picked.mimeType,
    size: picked.size,
    createdAt: new Date().toISOString(),
    summary,
  };
}

export const isWeb = Platform.OS === 'web';
