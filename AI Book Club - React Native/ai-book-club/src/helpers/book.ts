import { logInput, logOutput, logStart, logSuccess } from './log';

const COVER_COLORS = ['#B7C8D2', '#9DA4AC', '#CFBEAE', '#E89C6C', '#9C7368'];

export function hashColor(title: string): string {
  logStart('BOOK_HELPER', 'hashColor');
  logInput('BOOK_HELPER', 'title', title);
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = ((h << 5) - h + title.charCodeAt(i)) | 0;
  }
  const color = COVER_COLORS[Math.abs(h) % COVER_COLORS.length];
  logOutput('BOOK_HELPER', 'coverColor', color);
  logSuccess('BOOK_HELPER', 'hashColor');
  return color;
}

export function makeCoverText(title: string): string {
  logStart('BOOK_HELPER', 'makeCoverText');
  logInput('BOOK_HELPER', 'title', title);
  const words = title.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [''];
  let line = 0;
  for (const word of words) {
    const candidate = lines[line] ? `${lines[line]} ${word}` : word;
    if (candidate.length <= 14) {
      lines[line] = candidate;
    } else if (line < 2) {
      line++;
      lines[line] = word;
    } else {
      lines[line] = `${lines[line]}…`;
      break;
    }
  }
  const coverText = lines.filter(Boolean).join('\n') || 'BUKU';
  logOutput('BOOK_HELPER', 'coverText', coverText);
  logSuccess('BOOK_HELPER', 'makeCoverText');
  return coverText;
}

export function computeProgress(currentPage: number, totalPages: number): number {
  logStart('BOOK_HELPER', 'computeProgress');
  logInput('BOOK_HELPER', 'currentPage', currentPage);
  logInput('BOOK_HELPER', 'totalPages', totalPages);
  if (totalPages <= 0) {
    logOutput('BOOK_HELPER', 'progressPercent', 0);
    logSuccess('BOOK_HELPER', 'computeProgress');
    return 0;
  }
  const percent = Math.max(0, Math.min(100, Math.round((currentPage / totalPages) * 100)));
  logOutput('BOOK_HELPER', 'progressPercent', percent);
  logSuccess('BOOK_HELPER', 'computeProgress');
  return percent;
}
