import {
  documentDirectory,
  readAsStringAsync,
  copyAsync,
  makeDirectoryAsync,
  deleteAsync,
  getInfoAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
// @ts-expect-error PDF.js tidak menyediakan deklarasi TypeScript untuk worker.
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs';
import type { Book } from '@/hooks/useBooks';
import { hashColor, makeCoverText } from '@/helpers/book';
import {
  logError,
  logInfo,
  logInput,
  logOutput,
  logStart,
  logSuccess,
  logWarn,
} from '@/helpers/log';

const BOOK_DIR = `${documentDirectory ?? ''}books/`;
const HAS_STORAGE = documentDirectory != null;

type PdfJsWorkerModule = {
  WorkerMessageHandler: unknown;
};

type PdfJsGlobal = typeof globalThis & {
  pdfjsWorker?: PdfJsWorkerModule;
};

(globalThis as PdfJsGlobal).pdfjsWorker =
  pdfjsWorker as PdfJsWorkerModule;

async function ensureDir(): Promise<void> {
  logStart('PDF_STORAGE', 'ensureDir');
  if (!HAS_STORAGE) throw new Error('[PDF_STORAGE] documentDirectory unavailable');
  logInput('PDF_STORAGE', 'bookDir', BOOK_DIR);
  try {
    const info = await getInfoAsync(BOOK_DIR);
    logInfo('PDF_STORAGE', `Directory exists: ${info.exists}`);
    if (!info.exists) {
      logStart('PDF_STORAGE', 'makeDirectoryAsync');
      await makeDirectoryAsync(BOOK_DIR, { intermediates: true });
      logSuccess('PDF_STORAGE', 'makeDirectoryAsync');
    }
    const verified = await getInfoAsync(BOOK_DIR);
    if (!verified.exists || !verified.isDirectory) throw new Error(`Invalid book directory: ${JSON.stringify(verified)}`);
    logSuccess('PDF_STORAGE', 'ensureDir');
  } catch (err: unknown) {
    logError('PDF_STORAGE', 'Failed to prepare book directory', {
      functionName: 'ensureDir()', reason: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
}

function base64ToBytes(base64: string): Uint8Array {
  logStart('PDF_EXTRACT', 'base64ToBytes');
  logInput('PDF_EXTRACT', 'base64Length', base64.length);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = base64.replace(/\s/g, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let bi = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = chars.indexOf(clean[i]);
    const c1 = chars.indexOf(clean[i + 1]);
    const c2 = chars.indexOf(clean[i + 2]);
    const c3 = chars.indexOf(clean[i + 3]);
    bytes[bi++] = (c0 << 2) | (c1 >> 4);
    if (clean[i + 2] !== '=') bytes[bi++] = ((c1 & 15) << 4) | (c2 >> 2);
    if (clean[i + 3] !== '=') bytes[bi++] = ((c2 & 3) << 6) | c3;
  }
  logOutput('PDF_EXTRACT', 'byteLength', bytes.length);
  logSuccess('PDF_EXTRACT', 'base64ToBytes');
  return bytes;
}

async function cleanupFile(uri: string): Promise<void> {
  try {
    await deleteAsync(uri, { idempotent: true });
  } catch (cleanupError) {
    logError('PDF_STORAGE', 'Cleanup failed', {
      functionName: 'cleanupFile()',
      reason: cleanupError instanceof Error
        ? cleanupError.message
        : String(cleanupError),
    });
  }
}

export async function importBook(uri: string, fileName: string): Promise<Book> {
  logStart('PDF_IMPORT', 'PDF import');
  logInput('PDF_IMPORT', 'fileName', fileName);
  logInput('PDF_IMPORT', 'uri', uri);

  await ensureDir();
  if (!uri?.trim()) throw new Error('[PDF_STORAGE] Source URI is empty');
  const source = await getInfoAsync(uri);
  logInfo('PDF_STORAGE', `Source file: ${JSON.stringify(source)}`);
  if (!source.exists || source.isDirectory) {
    throw new Error(`[PDF_STORAGE] Invalid source file: ${uri}`);
  }
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const dest = `${BOOK_DIR}${id}.pdf`;
  logInfo('PDF_STORAGE', `Copy from ${uri} to ${dest}`);

  try {
    await copyAsync({ from: uri, to: dest });
  } catch (err: unknown) {
    logError('PDF_STORAGE', 'Copy failed', {
      functionName: 'copyAsync()',
      reason: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    await cleanupFile(dest);

    throw err;
  }
  let target;
  try {
    target = await getInfoAsync(dest);
    logInfo('PDF_STORAGE', `Destination verification: ${JSON.stringify(target)}`);
    if (!target.exists || target.isDirectory || (target.size != null && target.size <= 0)) {
      throw new Error(`[PDF_STORAGE] Destination verification failed: ${dest}`);
    }
  } catch (err: unknown) {
    await cleanupFile(dest);
       throw err;
  }

  const title = (fileName || 'Buku PDF').replace(/\.pdf$/i, '');
  const coverColor = hashColor(title);
  const coverText = makeCoverText(title);

  let text = '';
  let totalPages = 0;
  let author = 'Penulis tidak diketahui';
  let base64: string;

  // Baca file PDF dari penyimpanan aplikasi.
  // Jika gagal, hentikan proses impor.
  try {
    base64 = await readAsStringAsync(dest, {
      encoding: EncodingType.Base64,
    });
  } catch (err: unknown) {
    logError('PDF_STORAGE', 'Failed to read verified PDF', {
      functionName: 'readAsStringAsync()',
      reason: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    await cleanupFile(dest);
    throw err;
  }

  // Ekstraksi teks menggunakan PDF.js.
  // Kegagalan PDF.js tetap diperbolehkan karena buku
  // masih bisa disimpan tanpa teks hasil ekstraksi.
  try {
    logStart('PDF_EXTRACT', 'text extraction');
    logInput('PDF_EXTRACT', 'file', dest);

    const pdf: any = await getDocument({
      data: base64ToBytes(base64),
    }).promise;

    totalPages = pdf.numPages || 0;
    logOutput('PDF_EXTRACT', 'totalPages', totalPages);

    try {
      const meta = await pdf.getMetadata();
      author = meta?.info?.Author || author;
      logOutput('PDF_EXTRACT', 'author', author);
    } catch {}

    const parts: string[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      parts.push(
        (content.items as { str: string }[])
          .map((it) => it.str)
          .join(' ')
      );
    }

    text = parts.join('\n\n').trim();

    logOutput('PDF_EXTRACT', 'extractedCharacters', text.length);
    logSuccess('PDF_EXTRACT', 'text extraction');

  } catch (err: unknown) {
    logError('PDF_EXTRACT', 'Failed to extract PDF text', {
      functionName: 'importBook()',
      reason: err instanceof Error ? err.message : 'Unknown extraction error',
      stack: err instanceof Error ? err.stack : undefined,
    });

    logWarn(
      'PDF_EXTRACT',
      'Extraction unavailable; keeping book with fallback cover'
    );
  }

  logOutput('PDF_IMPORT', 'bookId', id);
  logOutput('PDF_IMPORT', 'title', title);
  logOutput('PDF_IMPORT', 'totalPages', totalPages);
  logOutput('PDF_IMPORT', 'extractedCharacters', text.length);
  logSuccess('PDF_IMPORT', 'PDF import');

  return {
    id,
    title,
    author,
    coverColor,
    coverText,
    uri: dest,
    totalPages,
    currentPage: 1,
    progressPercent: 0,
    text,
    addedAt: new Date().toISOString(),
  };
}
