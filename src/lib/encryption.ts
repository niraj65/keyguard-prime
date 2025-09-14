/**
 * Advanced encryption utilities for password manager
 * Uses AES-256-GCM with PBKDF2 key derivation for maximum security
 */

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  salt: string;
}

export interface PasswordEntry {
  id: string;
  website: string;
  username: string;
  password: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const ITERATIONS = 100000; // PBKDF2 iterations for key derivation
const KEY_LENGTH = 256; // AES-256

/**
 * Derives encryption key from master password using PBKDF2
 */
async function deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(masterPassword);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive AES key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-256-GCM
 */
export async function encryptData(data: string, masterPassword: string): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key from master password
  const key = await deriveKey(masterPassword, salt);
  
  // Encrypt data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataBuffer
  );
  
  return {
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt))
  };
}

/**
 * Decrypts data using AES-256-GCM
 */
export async function decryptData(encryptedData: EncryptedData, masterPassword: string): Promise<string> {
  const { encryptedData: data, iv: ivString, salt: saltString } = encryptedData;
  
  // Convert base64 strings back to Uint8Arrays
  const encryptedBuffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivString), c => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(saltString), c => c.charCodeAt(0));
  
  // Derive key from master password
  const key = await deriveKey(masterPassword, salt);
  
  try {
    // Decrypt data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Invalid master password or corrupted data');
  }
}

/**
 * Generates a secure random password with customizable options
 */
export interface PasswordGeneratorOptions {
  length: number;
  includeNumbers: boolean;
  includeSymbols: boolean;
  includeUppercase: boolean;
  includeLowercase: boolean;
  numbersCount?: number;
  symbolsCount?: number;
}

export function generatePassword(options: PasswordGeneratorOptions): string {
  const {
    length,
    includeNumbers,
    includeSymbols,
    includeUppercase,
    includeLowercase,
    numbersCount = Math.floor(length * 0.2),
    symbolsCount = Math.floor(length * 0.15)
  } = options;

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charset = '';
  let password = '';
  
  // Build charset based on options
  if (includeLowercase) charset += lowercase;
  if (includeUppercase) charset += uppercase;
  if (includeNumbers) charset += numbers;
  if (includeSymbols) charset += symbols;

  if (charset === '') throw new Error('At least one character type must be selected');

  // Ensure minimum character requirements
  const requirements: { chars: string; count: number }[] = [];
  
  if (includeNumbers && numbersCount > 0) {
    requirements.push({ chars: numbers, count: Math.min(numbersCount, length) });
  }
  if (includeSymbols && symbolsCount > 0) {
    requirements.push({ chars: symbols, count: Math.min(symbolsCount, length) });
  }

  // Add required characters first
  for (const req of requirements) {
    for (let i = 0; i < req.count; i++) {
      const randomIndex = crypto.getRandomValues(new Uint8Array(1))[0] % req.chars.length;
      password += req.chars[randomIndex];
    }
  }

  // Fill remaining length with random characters from full charset
  while (password.length < length) {
    const randomIndex = crypto.getRandomValues(new Uint8Array(1))[0] % charset.length;
    password += charset[randomIndex];
  }

  // Shuffle the password to avoid predictable patterns
  return shuffleString(password);
}

/**
 * Shuffles a string using Fisher-Yates algorithm with crypto.getRandomValues
 */
function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const randomBytes = crypto.getRandomValues(new Uint8Array(1));
    const j = randomBytes[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Calculates password strength score (0-100)
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length scoring
  if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else feedback.push('Use at least 12 characters');

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Include numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  else feedback.push('Include special characters');

  // Complexity bonus
  if (password.length >= 16) score += 10;

  return { score: Math.min(score, 100), feedback };
}