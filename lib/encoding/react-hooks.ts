// ============================================
// 📁 lib/encoding/react-hooks.ts
// Optional React hooks for advanced use
// ============================================

'use client';

import { useMemo } from 'react';
import { fixEncoding, fixEncodingDeep } from './index';

/**
 * Hook to fix encoding in strings
 */
export function useFixEncoding(text: string): string {
  return useMemo(() => fixEncoding(text), [text]);
}

/**
 * Hook to fix encoding in objects/arrays
 */
export function useFixEncodingDeep<T>(data: T): T {
  return useMemo(() => fixEncodingDeep(data), [data]);
}