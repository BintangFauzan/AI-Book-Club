declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const expect: <T>(actual: T) => {
  not: { toBe(expected: T): void; toContain(expected: unknown): void };
  toBe(expected: T): void;
  toContain(expected: unknown): void;
  toEqual(expected: unknown): void;
  toHaveLength(length: number): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toMatch(regexp: RegExp | string): void;
  toThrow?(): void;
};
declare const jest: any;
