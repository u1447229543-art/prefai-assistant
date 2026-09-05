import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { DocumentCategory, StoredDocument } from './storage';

export interface PickedDocument {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
}

/** Accepted document types: PDF, Word, JPG/JPEG and PNG. */
const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const WEB_ACCEPT =
  '.pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp';

/**
 * Opens the system document picker for PDF / Word / JPG / PNG. Returns null if the
 * user cancels.
 *
 * On web we use a native <input type="file"> because it is the most reliable
 * way to trigger the browser file dialog from a user gesture. On iOS/Android we
 * use expo-document-picker.
 */
export async function pickDocument(): Promise<PickedDocument | null> {
  if (Platform.OS === 'web') {
    return pickViaWebInput();
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: ACCEPTED_MIME,
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

/** Web-only: opens the browser file dialog via a hidden input element. */
function pickViaWebInput(): Promise<PickedDocument | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = WEB_ACCEPT;
    input.style.display = 'none';

    let settled = false;
    const cleanup = () => {
      input.onchange = null;
      input.oncancel = null;
      if (input.parentNode) input.parentNode.removeChild(input);
    };
    const finish = (value: PickedDocument | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) {
        finish(null);
        return;
      }
      finish({
        name: file.name,
        uri: URL.createObjectURL(file),
        mimeType: file.type || undefined,
        size: file.size,
      });
    };
    // Fired when the user closes the dialog without choosing a file (modern browsers).
    input.oncancel = () => finish(null);

    document.body.appendChild(input);
    input.click();
  });
}

/** Human-readable file size, e.g. "1.4 MB". */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

/**
 * Attempts to read text content from a picked document.
 * Works for text-based files; images / PDF / Word use the explain upload API.
 */
export function isExplainImage(doc: PickedDocument): boolean {
  const mime = (doc.mimeType || '').toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/png' || mime === 'image/webp') {
    return true;
  }
  return /\.(jpe?g|png|webp)$/i.test(doc.name);
}

export function isExplainPdf(doc: PickedDocument): boolean {
  const mime = (doc.mimeType || '').toLowerCase();
  return mime === 'application/pdf' || /\.pdf$/i.test(doc.name);
}

export function isExplainDocx(doc: PickedDocument): boolean {
  const mime = (doc.mimeType || '').toLowerCase();
  return (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword' ||
    /\.docx?$/i.test(doc.name)
  );
}

/** Files uploaded to backend /api/ai/explain as multipart (image, PDF, Word). */
export function isExplainUploadFile(doc: PickedDocument): boolean {
  return isExplainImage(doc) || isExplainPdf(doc) || isExplainDocx(doc);
}

/** @deprecated Prefer isExplainUploadFile — kept for any leftover callers. */
export function isUnsupportedExplainFile(doc: PickedDocument): boolean {
  if (isExplainUploadFile(doc)) return false;
  const mime = (doc.mimeType || '').toLowerCase();
  if (mime.startsWith('text/')) return false;
  if (/\.(txt|md|csv|json|html?)$/i.test(doc.name)) return false;
  return true;
}

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

  throw new Error(
    'Could not read this file as plain text. Upload a PDF, Word document, or photo instead.'
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
