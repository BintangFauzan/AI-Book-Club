import AsyncStorage from '@react-native-async-storage/async-storage';

export const HIGHLIGHTS_KEY = '@folio_highlights_v2';

export type Highlight = {
  id: string;
  page: number;
  index: number;
  start: number;
  end: number;
  color: string;
  note: string;
  text: string;
  savedAt: number;
};

export type HighlightsByBook = Record<string, Highlight[]>;

export async function loadHighlights(): Promise<HighlightsByBook> {
  const raw = await AsyncStorage.getItem(HIGHLIGHTS_KEY);
  return raw ? (JSON.parse(raw) as HighlightsByBook) : {};
}

export async function saveHighlights(next: HighlightsByBook): Promise<void> {
  await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(next));
}
