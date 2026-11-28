import type { Highlight } from '@/services/highlights';

export type HighlightRange = {
  id: string;
  index: number;
  start: number;
  end: number;
  color: string;
};

export type TextSegment = {
  text: string;
  range?: HighlightRange;
};

/*
  Terjemahan tidak menyimpan pemetaan karakter. Kutipan dicari kembali di
  paragraf terjemahan; yang tidak ketemu dilewati tanpa mengubah data highlight.
*/
export function mapHighlightRanges(
  paragraphs: string[],
  quotes: Record<string, string>,
  highlights: Highlight[]
): HighlightRange[] {
  const ranges: HighlightRange[] = [];
  for (const highlight of highlights) {
    const quote = quotes[highlight.id];
    const paragraph = paragraphs[highlight.index];
    if (!quote || !paragraph) continue;
    const start = paragraph.toLowerCase().indexOf(quote.toLowerCase());
    if (start < 0) continue;
    ranges.push({
      id: highlight.id,
      index: highlight.index,
      start,
      end: start + quote.length,
      color: highlight.color,
    });
  }
  return ranges;
}

export function segmentParagraph(text: string, ranges: HighlightRange[]): TextSegment[] {
  const sorted = ranges
    .filter((range) => range.start >= 0 && range.end > range.start && range.start < text.length)
    .sort((a, b) => a.start - b.start);
  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const range of sorted) {
    const start = Math.max(range.start, cursor);
    if (start >= range.end) continue;
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start) });
    }
    const end = Math.min(range.end, text.length);
    segments.push({ text: text.slice(start, end), range });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }
  return segments;
}
