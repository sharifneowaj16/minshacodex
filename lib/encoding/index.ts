import { EncodingFixer } from './core';

const fixer = EncodingFixer.getInstance();

export function fixEncoding(text: string): string {
  return fixer.fix(text);
}

export function fixEncodingDeep<T>(data: T): T {
  return fixer.fixDeep(data);
}
