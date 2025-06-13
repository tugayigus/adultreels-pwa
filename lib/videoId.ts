/**
 * Video ID utility for generating permanent, non-sequential, non-guessable IDs
 * Format: 13-character alphanumeric string using [A-Za-z0-9]
 * Total combinations: 62^13 ≈ 3.2e+23
 */

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 13;

/**
 * Generate a cryptographically secure 13-character alphanumeric ID
 */
export function generateVideoId(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment with crypto API
    const array = new Uint8Array(ID_LENGTH);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => CHARSET[byte % CHARSET.length]).join('');
  } else if (typeof global !== 'undefined' && global.crypto) {
    // Node.js environment with crypto
    const array = new Uint8Array(ID_LENGTH);
    global.crypto.getRandomValues(array);
    return Array.from(array, byte => CHARSET[byte % CHARSET.length]).join('');
  } else {
    // Fallback for environments without crypto (should be rare)
    console.warn('Crypto API not available, using Math.random() fallback');
    let result = '';
    for (let i = 0; i < ID_LENGTH; i++) {
      result += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }
    return result;
  }
}

/**
 * Validate if a string is a valid video ID format
 */
export function isValidVideoId(id: string): boolean {
  if (id.length !== ID_LENGTH) return false;
  return /^[A-Za-z0-9]+$/.test(id);
}

/**
 * Convert legacy numeric ID to new format (for migration)
 * This maps old IDs to predetermined alphanumeric IDs for consistency
 */
export function migrateLegacyId(numericId: string | number): string {
  const legacyMappings: Record<string, string> = {
    '1': 'a8b92cDdX01p1',
    '2': 'k7M3nP9qR5sT2', 
    '3': 'h4L6wE8vY2uI3',
    '4': 'f9A1zN7mQ3xC4',
    '5': 'j2K5bG8tV6oH5',
  };
  
  const key = String(numericId);
  return legacyMappings[key] || generateVideoId();
}

/**
 * Get legacy numeric ID from permanent ID (for backward compatibility)
 */
export function getLegacyId(permanentId: string): string | null {
  const reverseMappings: Record<string, string> = {
    'a8b92cDdX01p1': '1',
    'k7M3nP9qR5sT2': '2',
    'h4L6wE8vY2uI3': '3',
    'f9A1zN7mQ3xC4': '4',
    'j2K5bG8tV6oH5': '5',
  };
  
  return reverseMappings[permanentId] || null;
}