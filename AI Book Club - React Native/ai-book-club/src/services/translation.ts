import AsyncStorage from '@react-native-async-storage/async-storage';
import { onTranslateTask } from 'expo-translate-text';

import { logError, logInput, logOutput, logStart, logSuccess } from '@/helpers/log';

export type LanguageCode = 'en' | 'id';

export const TRANSLATE_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Indonesia' },
];

export type PageTranslation = {
  paragraphs: string[];
  quotes: Record<string, string>;
};

export type QuoteInput = {
  id: string;
  text: string;
};

const KEY_PREFIX = '@folio_translations';

function pageKey(bookId: string, language: LanguageCode, page: number): string {
  // shortcut: cache satu key per halaman tanpa batas jumlah; AsyncStorage Android berbagi kuota ~6MB.
  return `${KEY_PREFIX}:${bookId}:${language}:${page}`;
}

export async function loadPageTranslation(
  bookId: string,
  language: LanguageCode,
  page: number
): Promise<PageTranslation | null> {
  try {
    const raw = await AsyncStorage.getItem(pageKey(bookId, language, page));
    return raw ? (JSON.parse(raw) as PageTranslation) : null;
  } catch (err: unknown) {
    logError('TRANSLATION', 'Failed to read cached page', {
      functionName: 'loadPageTranslation()',
      reason: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function savePageTranslation(
  bookId: string,
  language: LanguageCode,
  page: number,
  data: PageTranslation
): Promise<void> {
  try {
    await AsyncStorage.setItem(pageKey(bookId, language, page), JSON.stringify(data));
  } catch (err: unknown) {
    logError('TRANSLATION', 'Failed to cache page', {
      functionName: 'savePageTranslation()',
      reason: err instanceof Error ? err.message : String(err),
    });
  }
}

/*
  Modul native menolak panggilan bersamaan (TRANSLATION_IN_PROGRESS),
  jadi semua permintaan dijalankan berurutan lewat antrean ini.
*/
let queue: Promise<unknown> = Promise.resolve();

export function translatePage(
  paragraphs: string[],
  quotes: QuoteInput[],
  language: LanguageCode
): Promise<PageTranslation> {
  const input = [...paragraphs, ...quotes.map((quote) => quote.text)];
  if (input.length === 0) {
    return Promise.resolve({ paragraphs: [], quotes: {} });
  }

  logStart('TRANSLATION', 'translate page');
  logInput('TRANSLATION', 'targetLanguage', language);
  logInput('TRANSLATION', 'paragraphs', paragraphs.length);
  logInput('TRANSLATION', 'quotes', quotes.length);

  function runTask() {
    return onTranslateTask({ input, targetLangCode: language });
  }

  const run = queue.then(runTask, runTask);
  queue = run.catch(() => undefined);

  return run
    .then(function mapResult(result) {
      const translated = Array.isArray(result.translatedTexts) ? result.translatedTexts : [];
      const mappedParagraphs = paragraphs.map((paragraph, index) => translated[index] || paragraph);
      const mappedQuotes: Record<string, string> = {};
      quotes.forEach((quote, index) => {
        const value = translated[paragraphs.length + index];
        if (value) mappedQuotes[quote.id] = value;
      });
      logOutput('TRANSLATION', 'sourceLanguage', result.sourceLanguage);
      logSuccess('TRANSLATION', 'translate page');
      return { paragraphs: mappedParagraphs, quotes: mappedQuotes };
    })
    .catch(function onTranslateError(err: unknown) {
      logError('TRANSLATION', 'Failed to translate page', {
        functionName: 'translatePage()',
        reason: err instanceof Error ? err.message : String(err),
      });
      throw err;
    });
}
