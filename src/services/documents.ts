import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { DocumentCategory, StoredDocument } from './storage';

export interface PickedDocument {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
}

/** Accepted document types: PDF, JPG/JPEG and PNG. */
const ACCEPTED_MIME = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const WEB_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

/**
 * Opens the system document picker for PDF / JPG / PNG. Returns null if the
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
