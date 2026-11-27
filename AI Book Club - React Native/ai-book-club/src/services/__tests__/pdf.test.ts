
import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

type FileInfo = {
  exists: boolean;
  isDirectory?: boolean;
  size?: number;
};

type PdfMock = {
  numPages: number;
  getMetadata: () => Promise<Record<string, unknown>>;
};

// Factory mock tidak bergantung pada variabel luar.
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  readAsStringAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('pdfjs-dist/legacy/build/pdf.worker.mjs', () => ({
  WorkerMessageHandler: { initializeFromPort: jest.fn() },
}));

jest.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  getDocument: jest.fn(),
  PDFWorker: class {
    destroy() {}
  },
}));

jest.mock('@/helpers/log', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
  logInput: jest.fn(),
  logOutput: jest.fn(),
  logStart: jest.fn(),
  logSuccess: jest.fn(),
  logWarn: jest.fn(),
}));

jest.mock('@/helpers/book', () => ({
  hashColor: () => '#000',
  makeCoverText: () => 'BOOK',
}));

type FsMocks = {
  getInfoAsync: jest.MockedFunction<(uri: string) => Promise<FileInfo>>;
  copyAsync: jest.MockedFunction<
    (options: { from: string; to: string }) => Promise<void>
  >;
  makeDirectoryAsync: jest.MockedFunction<
    (uri: string, options: { intermediates: boolean }) => Promise<void>
  >;
  deleteAsync: jest.MockedFunction<
    (uri: string, options: { idempotent: boolean }) => Promise<void>
  >;
  readAsStringAsync: jest.MockedFunction<
    (uri: string, options: { encoding: string }) => Promise<string>
  >;
};

type PdfMocks = {
  getDocument: jest.MockedFunction<
    (options: { data: Uint8Array; worker?: unknown }) => {
      promise: Promise<PdfMock>;
      destroy: () => Promise<void>;
    }
  >;
};

const mockFs = jest.requireMock('expo-file-system/legacy') as FsMocks;
const mockGetDocument = (
  jest.requireMock('pdfjs-dist/legacy/build/pdf.mjs') as PdfMocks
).getDocument;

// eslint-disable-next-line import/first
import { importBook } from '../pdf';

describe('PDF storage import', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockFs.getInfoAsync.mockImplementation(async (uri: string) => {
      if (uri.endsWith('books/')) {
        return { exists: true, isDirectory: true };
      }

      if (uri === 'source.pdf') {
        return { exists: true, isDirectory: false, size: 20 };
      }

      return { exists: true, isDirectory: false, size: 20 };
    });

    mockFs.copyAsync.mockResolvedValue(undefined);
    mockFs.makeDirectoryAsync.mockResolvedValue(undefined);
    mockFs.deleteAsync.mockResolvedValue(undefined);
    mockFs.readAsStringAsync.mockResolvedValue('base64');

    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 0,
        getMetadata: async () => ({}),
      }),
      destroy: jest.fn(async () => {}),
    });
  });


  it('accepts existing directory and verifies copied file before reading', async () => {
    const book = await importBook('source.pdf', 'source.pdf');
    expect(book.uri).toMatch(/books\/.*\.pdf$/);
    expect(mockFs.makeDirectoryAsync).not.toHaveBeenCalled();
    expect(mockFs.getInfoAsync).toHaveBeenCalledWith(book.uri);
    expect(mockFs.readAsStringAsync).toHaveBeenCalledWith(book.uri, { encoding: 'base64' });
    expect(mockGetDocument).toHaveBeenCalledWith(
      expect.objectContaining({ worker: expect.anything() }),
    );
  });

  it('creates a missing directory', async () => {
    mockFs.getInfoAsync.mockImplementation(async (uri: string) => {
      if (uri.endsWith('books/')) return mockFs.makeDirectoryAsync.mock.calls.length
        ? { exists: true, isDirectory: true } : { exists: false };
      if (uri === 'source.pdf') return { exists: true, isDirectory: false, size: 20 };
      return { exists: true, isDirectory: false, size: 20 };
    });
    await importBook('source.pdf', 'source.pdf');
    expect(mockFs.makeDirectoryAsync).toHaveBeenCalledWith('file:///docs/books/', { intermediates: true });
  });

  it('rejects directory creation failure', async () => {
    mockFs.getInfoAsync.mockResolvedValue({ exists: false });
    mockFs.makeDirectoryAsync.mockRejectedValue(new Error('mkdir failed'));
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('mkdir failed');
    expect(mockFs.copyAsync).not.toHaveBeenCalled();
  });

  it('rejects missing source', async () => {
    mockFs.getInfoAsync.mockImplementation(async (uri: string) => uri.endsWith('books/')
      ? { exists: true, isDirectory: true } : { exists: false });
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('Invalid source file');
  });

  it('rejects copy failure and never reads destination', async () => {
    mockFs.copyAsync.mockRejectedValue(new Error('copy failed'));
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('copy failed');
    expect(mockFs.readAsStringAsync).not.toHaveBeenCalled();
    expect(mockFs.deleteAsync).toHaveBeenCalledWith(expect.stringMatching(/\.pdf$/), { idempotent: true });
  });

  it.each([
    ['missing target', { exists: false, isDirectory: false }],
    ['empty target', { exists: true, isDirectory: false, size: 0 }],
  ])('rejects %s after copy', async (_name, info) => {
    mockFs.getInfoAsync.mockImplementation(async (uri: string) => {
      if (uri.endsWith('books/')) return { exists: true, isDirectory: true };
      if (uri === 'source.pdf') return { exists: true, isDirectory: false, size: 20 };
      return info;
    });
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('Destination verification failed');
    expect(mockFs.readAsStringAsync).not.toHaveBeenCalled();
    expect(mockFs.deleteAsync).toHaveBeenCalledWith(expect.stringMatching(/\.pdf$/), { idempotent: true });
  });

  it('rejects read failure, returns no book, and cleans destination', async () => {
    mockFs.readAsStringAsync.mockRejectedValue(new Error('read failed'));
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('read failed');
    expect(mockFs.deleteAsync).toHaveBeenCalledWith(expect.stringMatching(/\.pdf$/), { idempotent: true });
  });

  it('keeps cover-only fallback for PDF.js failure after successful read', async () => {
    mockGetDocument.mockReturnValue({
      promise: Promise.reject(new Error('pdfjs failed')),
      destroy: jest.fn(async () => {}),
    });

    const book = await importBook('source.pdf', 'source.pdf');

    expect(book.uri).toMatch(/books\/.*\.pdf$/);
    expect(mockFs.readAsStringAsync).toHaveBeenCalled();
    expect(mockFs.deleteAsync).not.toHaveBeenCalled();
  });
});
