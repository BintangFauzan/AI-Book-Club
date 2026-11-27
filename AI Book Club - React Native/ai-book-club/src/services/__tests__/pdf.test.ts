const mockFs = {
  documentDirectory: 'file:///docs/',
  readAsStringAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
};
const mockGetDocument = jest.fn();
const mockMocks = { fs: mockFs, getDocument: mockGetDocument };

jest.mock('expo-file-system/legacy', () => mockMocks.fs);
jest.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({ getDocument: mockMocks.getDocument }));
jest.mock('@/helpers/log', () => new Proxy({}, { get: () => jest.fn() }));
jest.mock('@/helpers/book', () => ({ hashColor: () => '#000', makeCoverText: () => 'BOOK' }));

import { importBook } from '../pdf';

describe('PDF storage import', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.getInfoAsync.mockImplementation(async (uri: string) => {
      if (uri.endsWith('books/')) return { exists: true, isDirectory: true };
      if (uri === 'source.pdf') return { exists: true, isDirectory: false, size: 20 };
      return { exists: true, isDirectory: false, size: 20 };
    });
    mockFs.copyAsync.mockResolvedValue(undefined);
    mockFs.makeDirectoryAsync.mockResolvedValue(undefined);
    mockFs.deleteAsync.mockResolvedValue(undefined);
    mockFs.readAsStringAsync.mockResolvedValue('base64');
    mockGetDocument.mockResolvedValue({ promise: Promise.resolve({ numPages: 0, getMetadata: async () => ({}) }) });
  });

  it('accepts existing directory and verifies copied file before reading', async () => {
    const book = await importBook('source.pdf', 'source.pdf');
    expect(book.uri).toMatch(/books\/.*\.pdf$/);
    expect(mockFs.makeDirectoryAsync).not.toHaveBeenCalled();
    expect(mockFs.getInfoAsync).toHaveBeenCalledWith(book.uri);
    expect(mockFs.readAsStringAsync).toHaveBeenCalledWith(book.uri, { encoding: 'base64' });
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
    mockGetDocument.mockRejectedValue(new Error('pdfjs failed'));
    const book = await importBook('source.pdf', 'source.pdf');
    expect(book.uri).toMatch(/books\/.*\.pdf$/);
    expect(mockFs.readAsStringAsync).toHaveBeenCalled();
    expect(mockFs.deleteAsync).not.toHaveBeenCalled();
  });
});
