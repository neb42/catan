import { webcrypto } from 'node:crypto';

// Polyfill minimal crypto for Node if global crypto is missing
const crypto = (globalThis.crypto || webcrypto) as Crypto;

/**
 * Cryptographically-secure Fisher-Yates shuffle.
 * Returns a new shuffled array without mutating the original.
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  const randomValues = new Uint32Array(result.length);
  crypto.getRandomValues(randomValues);

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
