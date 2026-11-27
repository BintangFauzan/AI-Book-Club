const fs = {
  documentDirectory: 'file:///docs/',
  readAsStringAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
};
const getDocument = jest.fn();

jest.mock('expo-file-system/legacy', () => fs);
jest.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({ getDocument }));
jest.mock('@/helpers/log', () => new Proxy({}, { get: () => jest.fn() }));
jest.mock('@/helpers/book', () => ({ hashColor: () => '#000', makeCoverText: () => 'BOOK' }));

import { importBook } from '../pdf';

describe('PDF storage import', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.getInfoAsync.mockImplementation(async (uri: string) => {
      if (uri.endsWith('books/')) return { exists: true, isDirectory: true };
      if (uri === 'source.pdf') return { exists: true, isDirectory: false, size: 20 };
      return { exists: true, isDirectory: false, size: 20 };
    });
    fs.copyAsync.mockResolvedValue(undefined);
    fs.makeDirectoryAsync.mockResolvedValue(undefined);
    fs.deleteAsync.mockResolvedValue(undefined);
    fs.readAsStringAsync.mockResolvedValue('base64');
    getDocument.mockResolvedValue({ promise: Promise.resolve({ numPages: 0, getMetadata: async () => ({}) }) });
  });

  it('accepts existing directory and verifies copied file before reading', async () => {
    const book = await importBook('source.pdf', 'source.pdf');
    expect(book.uri).toMatch(/books\/.*\.pdf$/);
    expect(fs.makeDirectoryAsync).not.toHaveBeenCalled();
    expect(fs.getInfoAsync).toHaveBeenCalledWith(book.uri);
    expect(fs.readAsStringAsync).toHaveBeenCalledWith(book.uri, { encoding: 'base64' });
  });

  it('creates a missing directory', async () => {
    fs.getInfoAsync.mockImplementation(async (uri: string) => {
      if (uri.endsWith('books/')) return fs.makeDirectoryAsync.mock.calls.length
        ? { exists: true, isDirectory: true } : { exists: false };
      if (uri === 'source.pdf') return { exists: true, isDirectory: false, size: 20 };
      return { exists: true, isDirectory: false, size: 20 };
    });
    await importBook('source.pdf', 'source.pdf');
    expect(fs.makeDirectoryAsync).toHaveBeenCalledWith('file:///docs/books/', { intermediates: true });
  });

  it('rejects directory creation failure', async () => {
    fs.getInfoAsync.mockResolvedValue({ exists: false });
    fs.makeDirectoryAsync.mockRejectedValue(new Error('mkdir failed'));
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('mkdir failed');
    expect(fs.copyAsync).not.toHaveBeenCalled();
  });

  it('rejects missing source', async () => {
    fs.getInfoAsync.mockImplementation(async (uri: string) => uri.endsWith('books/')
      ? { exists: true, isDirectory: true } : { exists: false });
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('Invalid source file');
  });

  it('rejects copy failure and never reads destination', async () => {
    fs.copyAsync.mockRejectedValue(new Error('copy failed'));
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('copy failed');
    expect(fs.readAsStringAsync).not.toHaveBeenCalled();
    expect(fs.deleteAsync).toHaveBeenCalledWith(expect.stringMatching(/\.pdf$/), { idempotent: true });
  });

  it.each([
    ['missing target', { exists: false, isDirectory: false }],
    ['empty target', { exists: true, isDirectory: false, size: 0 }],
  ])('rejects %s after copy', async (_name, info) => {
    fs.getInfoAsync.mockImplementation(async (uri: string) => {
      if (uri.endsWith('books/')) return { exists: true, isDirectory: true };
      if (uri === 'source.pdf') return { exists: true, isDirectory: false, size: 20 };
      return info;
    });
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('Destination verification failed');
    expect(fs.readAsStringAsync).not.toHaveBeenCalled();
    expect(fs.deleteAsync).toHaveBeenCalledWith(expect.stringMatching(/\.pdf$/), { idempotent: true });
  });

  it('rejects read failure, returns no book, and cleans destination', async () => {
    fs.readAsStringAsync.mockRejectedValue(new Error('read failed'));
    await expect(importBook('source.pdf', 'source.pdf')).rejects.toThrow('read failed');
    expect(fs.deleteAsync).toHaveBeenCalledWith(expect.stringMatching(/\.pdf$/), { idempotent: true });
  });

  it('keeps cover-only fallback for PDF.js failure after successful read', async () => {
    getDocument.mockRejectedValue(new Error('pdfjs failed'));
    const book = await importBook('source.pdf', 'source.pdf');
    expect(book.uri).toMatch(/books\/.*\.pdf$/);
    expect(fs.readAsStringAsync).toHaveBeenCalled();
    expect(fs.deleteAsync).not.toHaveBeenCalled();
  });
});
