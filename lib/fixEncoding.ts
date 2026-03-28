/**
 * Fixes corrupted emoji and text encoding in strings
 * Handles mojibake and double-encoded UTF-8 issues
 */
export function fixEncoding(text: string): string {
  if (!text) return text;

  let fixed = text;

  // Step 1: Fix common mojibake patterns using regex
  // These patterns match corrupted emoji without using literal corrupted chars
  const patterns: Array<[RegExp, string | ((match: string) => string)]> = [
    // Eye emoji variations
    [/\u00F0\u009F\u0091\u0081[\uFE0F\uFEFF]*/g, '\u{1F441}\uFE0F'],
    
    // Chart emoji
    [/\u00F0\u009F\u0093\u008A[\uFE0F\uFEFF]*/g, '\u{1F4CA}'],
    
    // Money bag emoji
    [/\u00F0\u009F\u0092\u00B0[\uFE0F\uFEFF]*/g, '\u{1F4B0}'],
    
    // Chart increasing emoji
    [/\u00F0\u009F\u0093\u0088[\uFE0F\uFEFF]*/g, '\u{1F4C8}'],
    
    // Target emoji
    [/\u00F0\u009F\u008E\u00AF[\uFE0F\uFEFF]*/g, '\u{1F3AF}'],
    
    // Generic emoji corruption pattern (4-byte sequences)
    [/\u00F0[\u0080-\u00BF]{3}/g, (match) => {
      try {
        // Try to recover the emoji
        const bytes = [];
        for (let i = 0; i < match.length; i++) {
          bytes.push(match.charCodeAt(i));
        }
        // Basic emoji reconstruction
        if (bytes.length === 4 && bytes[0] === 0xF0) {
          const codePoint = 
            ((bytes[0] & 0x07) << 18) |
            ((bytes[1] & 0x3F) << 12) |
            ((bytes[2] & 0x3F) << 6) |
            (bytes[3] & 0x3F);
          return String.fromCodePoint(codePoint);
        }
      } catch (e) {
        console.warn('Failed to decode emoji:', e);
      }
      return match;
    }],
  ];

  // Apply pattern replacements
  for (const [pattern, replacement] of patterns) {
    if (typeof replacement === 'function') {
      fixed = fixed.replace(pattern, replacement);
    } else {
      fixed = fixed.replace(pattern, replacement);
    }
  }

  // Step 2: Clean up excessive variation selectors and zero-width characters
  fixed = fixed
    .replace(/\uFEFF+/g, '') // Zero-width no-break space
    .replace(/\u200B+/g, '') // Zero-width space
    .replace(/\u200C+/g, '') // Zero-width non-joiner
    // .replace(/[\uFE0E\uFE0F]{2,}/g, String.fromCodePoint(0xFE0F)) // Duplicate variation selectors - Temporarily commented
    .replace(/\uFFFD/g, ''); // Remove replacement characters

  // Step 3: Normalize Unicode composition
  try {
    fixed = fixed.normalize('NFC');
  } catch (e) {
    console.warn('Unicode normalization failed:', e);
  }

  return fixed;
}

/**
 * Server-side encoding fix using Buffer
 * Use this in API routes or server components
 */
export function fixEncodingServerSide(text: string): string {
  if (!text) return text;

  // Only run on server
  if (typeof window !== 'undefined') {
    return fixEncoding(text);
  }

  try {
    // Attempt to fix latin1 -> utf8 double encoding
    const buffer = Buffer.from(text, 'latin1');
    const decoded = buffer.toString('utf-8');
    
    // Apply additional cleanup
    return fixEncoding(decoded);
  } catch (e) {
    console.warn('Server-side encoding fix failed:', e);
    return fixEncoding(text);
  }
}

/**
 * Detects if text has encoding issues
 */
export function hasEncodingIssues(text: string): boolean {
  if (!text) return false;

  const issues = [
    /\u00F0[\u0080-\u00BF]{3}/, // Mojibake emoji pattern
    /\uFFFD/, // Replacement character
    /[\u00C0-\u00FF]{3,}/, // Multiple Latin-1 supplement chars
    /\uFEFF{2,}/, // Multiple zero-width no-break spaces
  ];

  return issues.some(pattern => pattern.test(text));
}

/**
 * Validates if string contains proper emoji
 */
export function containsValidEmoji(str: string): boolean {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
}

/**
 * Extracts all emoji from text
 */
export function extractEmoji(text: string): string[] {
  if (!text) return [];
  
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}][\uFE0F\uFE0E]?/gu;
  return text.match(emojiRegex) || [];
}

/**
 * Removes all emoji from text
 */
export function removeEmoji(text: string): string {
  if (!text) return text;
  
  return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}][\uFE0F\uFE0E]?/gu, '');
}

/**
 * Map of common corrupted patterns to correct emoji
 * Use this for manual corrections if needed
 */
export const EMOJI_CORRECTIONS: Record<string, string> = {
  // Use escaped sequences only
  '\u00F0\u009F\u0091\u0081': '\u{1F441}\uFE0F', // Eye
  '\u00F0\u009F\u0093\u008A': '\u{1F4CA}', // Chart
  '\u00F0\u009F\u0092\u00B0': '\u{1F4B0}', // Money bag
  '\u00F0\u009F\u0093\u0088': '\u{1F4C8}', // Chart increasing
  '\u00F0\u009F\u008E\u00AF': '\u{1F3AF}', // Target
};