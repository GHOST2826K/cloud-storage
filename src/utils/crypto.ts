/**
 * Client-Side Zero-Knowledge Cryptography using Web Crypto API (SubtleCrypto)
 * - AES-GCM 256-bit encryption
 * - PBKDF2 with 100,000 iterations + SHA-256 for key derivation
 * - Cryptographically secure 96-bit IV (Initialization Vector) per record
 * - Cryptographically secure 128-bit Salt per encryption
 */

const PBKDF2_ITERATIONS = 100_000;
const HASH_ALGO = 'SHA-256';

// Helper: Convert string to Uint8Array
function strToBuf(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Helper: Convert Uint8Array to string
function bufToStr(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

// Helper: Convert ArrayBuffer to Hex string
function bufToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert Hex string to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Derive an AES-GCM 256-bit CryptoKey from a user passphrase using PBKDF2
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    strToBuf(passphrase) as any,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGO,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext string using user passphrase
 */
export async function encryptData(
  plaintext: string,
  passphrase: string
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  // Generate random salt (16 bytes) and IV (12 bytes)
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(passphrase, salt);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
    },
    key,
    strToBuf(plaintext) as any
  );

  return {
    ciphertext: bufToHex(encryptedBuffer),
    iv: bufToHex(iv.buffer),
    salt: bufToHex(salt.buffer),
  };
}

/**
 * Decrypt ciphertext hex using user passphrase
 */
export async function decryptData(
  ciphertextHex: string,
  ivHex: string,
  saltHex: string,
  passphrase: string
): Promise<string> {
  const salt = hexToBuf(saltHex);
  const iv = hexToBuf(ivHex);
  const ciphertext = hexToBuf(ciphertextHex);

  const key = await deriveKey(passphrase, salt);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
    },
    key,
    ciphertext as any
  );

  return bufToStr(decryptedBuffer);
}

/**
 * Hash a passphrase with SHA-256 for local verification
 */
export async function hashPassphrase(passphrase: string): Promise<string> {
  const hash = await window.crypto.subtle.digest('SHA-256', strToBuf(passphrase) as any);
  return bufToHex(hash);
}

/**
 * Generate a cryptographically secure 24-character human readable emergency recovery key
 */
export function generateRecoveryKey(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // base32 without ambiguous characters
  const randomValues = new Uint8Array(24);
  window.crypto.getRandomValues(randomValues);

  const code = Array.from(randomValues)
    .map((v) => chars[v % chars.length])
    .join('');

  // Format as XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
  return code.match(/.{1,4}/g)?.join('-') || code;
}
