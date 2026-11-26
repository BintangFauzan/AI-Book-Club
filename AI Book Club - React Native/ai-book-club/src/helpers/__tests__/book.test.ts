import { computeProgress, hashColor, makeCoverText } from '../book';

const COVER_COLORS = ['#B7C8D2', '#9DA4AC', '#CFBEAE', '#E89C6C', '#9C7368'];

describe('book helpers', () => {
  it('computeProgress clamps between 0 and 100', () => {
    expect(computeProgress(1, 10)).toBe(10);
    expect(computeProgress(10, 10)).toBe(100);
    expect(computeProgress(0, 10)).toBe(0);
    expect(computeProgress(-5, 10)).toBe(0);
    expect(computeProgress(100, 10)).toBe(100);
    expect(computeProgress(1, 0)).toBe(0);
    expect(computeProgress(3, 7)).toBe(43);
  });

  it('hashColor is deterministic and within palette', () => {
    const color = hashColor('The Creative Act');
    expect(COVER_COLORS).toContain(color);
    expect(hashColor('The Creative Act')).toBe(color);
    expect(hashColor('Another Book')).not.toBe(color);
  });

  it('makeCoverText wraps title into cover lines', () => {
    expect(makeCoverText('The Creative Act')).toBe('THE CREATIVE\nACT');
    expect(makeCoverText('Braiding Sweetgrass')).toBe('BRAIDING\nSWEETGRASS');
    expect(makeCoverText('A Very Long Book Title That Wraps')).toBe(
      'A VERY LONG\nBOOK TITLE\nTHAT WRAPS'
    );
    expect(makeCoverText('')).toBe('BUKU');
  });
});
