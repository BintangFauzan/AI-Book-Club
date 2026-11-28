import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onTranslateTask } from 'expo-translate-text';

import { mapHighlightRanges, segmentParagraph } from '@/helpers/translation';
import {
  loadPageTranslation,
  savePageTranslation,
  translatePage,
} from '@/services/translation';
import type { Highlight } from '@/services/highlights';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

jest.mock('expo-translate-text', () => ({
  onTranslateTask: jest.fn(),
}));

jest.mock('@/helpers/log', () => ({
  logError: jest.fn(),
  logInput: jest.fn(),
  logOutput: jest.fn(),
  logStart: jest.fn(),
  logSuccess: jest.fn(),
}));

const translateMock = onTranslateTask as jest.MockedFunction<typeof onTranslateTask>;
const getItemMock = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const setItemMock = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

function makeHighlight(overrides: Partial<Highlight> = {}): Highlight {
  return {
    id: 'h1',
    page: 1,
    index: 0,
    start: 0,
    end: 7,
    color: '#fff',
    note: '',
    text: 'kutipan',
    savedAt: 1,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  getItemMock.mockResolvedValue(null);
  setItemMock.mockResolvedValue();
});

describe('translatePage', () => {
  it('menerjemahkan paragraf dan kutipan dalam satu batch', async () => {
    translateMock.mockResolvedValue({
      translatedTexts: ['Hello', 'World', 'a quote'],
      sourceLanguage: 'id',
      targetLanguage: 'en',
    });

    const result = await translatePage(
      ['Halo', 'Dunia'],
      [{ id: 'h1', text: 'kutipan' }],
      'en'
    );

    expect(translateMock).toHaveBeenCalledWith({
      input: ['Halo', 'Dunia', 'kutipan'],
      targetLangCode: 'en',
    });
    expect(result).toEqual({
      paragraphs: ['Hello', 'World'],
      quotes: { h1: 'a quote' },
    });
  });

  it('mempertahankan teks asli bila hasil terjemahan tidak lengkap', async () => {
    translateMock.mockResolvedValue({
      translatedTexts: ['Hello'],
      sourceLanguage: 'id',
      targetLanguage: 'en',
    });

    const result = await translatePage(['Halo', 'Dunia'], [], 'en');

    expect(result).toEqual({ paragraphs: ['Hello', 'Dunia'], quotes: {} });
  });
});

describe('cache terjemahan', () => {
  it('menyimpan dan membaca per buku, bahasa, dan halaman', async () => {
    const data = { paragraphs: ['Hi'], quotes: { h1: 'quote' } };

    await savePageTranslation('book-1', 'en', 2, data);

    expect(setItemMock).toHaveBeenCalledWith(
      '@folio_translations:book-1:en:2',
      JSON.stringify(data)
    );

    getItemMock.mockResolvedValue(JSON.stringify(data));
    await expect(loadPageTranslation('book-1', 'en', 2)).resolves.toEqual(data);
  });
});

describe('mapHighlightRanges', () => {
  it('menemukan kutipan terjemahan tanpa peduli huruf besar', () => {
    const range = mapHighlightRanges(
      ['Ini kutipan penting'],
      { h1: 'KUTIPAN' },
      [makeHighlight()]
    );

    expect(range).toEqual([
      { id: 'h1', index: 0, start: 4, end: 11, color: '#fff' },
    ]);
  });

  it('melewati kutipan yang tidak ditemukan', () => {
    const range = mapHighlightRanges(['Ini kutipan penting'], { h1: 'hilang' }, [makeHighlight()]);
    expect(range).toEqual([]);
  });
});

describe('segmentParagraph', () => {
  it('memecah paragraf di sekitar range highlight', () => {
    const range = { id: 'h1', index: 0, start: 1, end: 3, color: '#fff' };
    const segments = segmentParagraph('abcdef', [range]);

    expect(segments.map((segment) => segment.text)).toEqual(['a', 'bc', 'def']);
    expect(segments[1].range).toEqual(range);
  });
});
