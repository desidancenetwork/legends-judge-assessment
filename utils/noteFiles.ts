import { MAX_NOTE_UPLOAD_BYTES } from './constants';

const EXTENSION_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
};
const ALLOWED_TYPES = new Set(Object.values(EXTENSION_TYPES));

export type PreparedNote = { blob: Blob; type: string } | { error: string };

export function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Re-encodes a large photo as a JPEG under the upload limit. Returns null if the browser can't decode it. */
async function shrinkImage(file: File): Promise<Blob | null> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return null;
  }

  try {
    for (const [maxDimension, quality] of [[2400, 0.85], [2000, 0.8], [1600, 0.75]]) {
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext('2d');
      if (!context) return null;
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= MAX_NOTE_UPLOAD_BYTES) return blob;
    }
    return null;
  } finally {
    bitmap.close();
  }
}

/** Checks a selected file and, for oversized photos, shrinks it so it fits in one upload request. */
export async function prepareNoteFile(file: File): Promise<PreparedNote> {
  // Some browsers report an empty type for HEIC photos, so fall back to the extension.
  const type = file.type || EXTENSION_TYPES[file.name.split('.').pop()?.toLowerCase() ?? ''] || '';
  if (!ALLOWED_TYPES.has(type)) {
    return { error: 'Only photos (JPG, PNG, HEIC) and PDFs can be uploaded.' };
  }
  if (file.size <= MAX_NOTE_UPLOAD_BYTES) {
    return { blob: file, type };
  }
  if (type.startsWith('image/')) {
    const shrunk = await shrinkImage(file);
    if (shrunk) return { blob: shrunk, type: 'image/jpeg' };
  }
  return { error: `Too large to upload (limit ${formatBytes(MAX_NOTE_UPLOAD_BYTES)}).` };
}
