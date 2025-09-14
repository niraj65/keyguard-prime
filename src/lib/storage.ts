/**
 * Secure local storage utilities for password manager
 * Handles encrypted storage of password entries and master password verification
 */

import { encryptData, decryptData, type PasswordEntry, type EncryptedData } from './encryption';

const STORAGE_KEYS = {
  VAULT: 'pm_vault',
  MASTER_HASH: 'pm_master_hash',
  SETTINGS: 'pm_settings'
} as const;

export interface VaultData {
  entries: PasswordEntry[];
  version: string;
  lastModified: string;
}

export interface AppSettings {
  autoLockTimeout: number; // minutes
  clipboardClearTimeout: number; // seconds
  showPasswords: boolean;
}

/**
 * Creates a hash of the master password for verification
 */
async function hashMasterPassword(masterPassword: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(masterPassword + 'password_manager_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

/**
 * Sets up the master password (first time setup)
 */
export async function setupMasterPassword(masterPassword: string): Promise<boolean> {
  try {
    const hash = await hashMasterPassword(masterPassword);
    localStorage.setItem(STORAGE_KEYS.MASTER_HASH, hash);
    
    // Initialize empty vault
    const emptyVault: VaultData = {
      entries: [],
      version: '1.0.0',
      lastModified: new Date().toISOString()
    };
    
    await saveVault(emptyVault, masterPassword);
    return true;
  } catch (error) {
    console.error('Failed to setup master password:', error);
    return false;
  }
}

/**
 * Verifies the master password
 */
export async function verifyMasterPassword(masterPassword: string): Promise<boolean> {
  try {
    const storedHash = localStorage.getItem(STORAGE_KEYS.MASTER_HASH);
    if (!storedHash) return false;
    
    const inputHash = await hashMasterPassword(masterPassword);
    return storedHash === inputHash;
  } catch (error) {
    console.error('Failed to verify master password:', error);
    return false;
  }
}

/**
 * Checks if master password is already set up
 */
export function isMasterPasswordSetup(): boolean {
  return !!localStorage.getItem(STORAGE_KEYS.MASTER_HASH);
}

/**
 * Saves the vault data encrypted to localStorage
 */
export async function saveVault(vaultData: VaultData, masterPassword: string): Promise<boolean> {
  try {
    const jsonData = JSON.stringify(vaultData);
    const encryptedData = await encryptData(jsonData, masterPassword);
    localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(encryptedData));
    return true;
  } catch (error) {
    console.error('Failed to save vault:', error);
    return false;
  }
}

/**
 * Loads the vault data from localStorage and decrypts it
 */
export async function loadVault(masterPassword: string): Promise<VaultData | null> {
  try {
    const encryptedString = localStorage.getItem(STORAGE_KEYS.VAULT);
    if (!encryptedString) return null;
    
    const encryptedData: EncryptedData = JSON.parse(encryptedString);
    const decryptedString = await decryptData(encryptedData, masterPassword);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Failed to load vault:', error);
    return null;
  }
}

/**
 * Adds a new password entry to the vault
 */
export async function addPasswordEntry(
  entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>,
  masterPassword: string
): Promise<boolean> {
  try {
    const vault = await loadVault(masterPassword);
    if (!vault) return false;
    
    const newEntry: PasswordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    vault.entries.push(newEntry);
    vault.lastModified = new Date().toISOString();
    
    return await saveVault(vault, masterPassword);
  } catch (error) {
    console.error('Failed to add password entry:', error);
    return false;
  }
}

/**
 * Updates an existing password entry
 */
export async function updatePasswordEntry(
  entryId: string,
  updates: Partial<Omit<PasswordEntry, 'id' | 'createdAt'>>,
  masterPassword: string
): Promise<boolean> {
  try {
    const vault = await loadVault(masterPassword);
    if (!vault) return false;
    
    const entryIndex = vault.entries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) return false;
    
    vault.entries[entryIndex] = {
      ...vault.entries[entryIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    vault.lastModified = new Date().toISOString();
    return await saveVault(vault, masterPassword);
  } catch (error) {
    console.error('Failed to update password entry:', error);
    return false;
  }
}

/**
 * Deletes a password entry from the vault
 */
export async function deletePasswordEntry(entryId: string, masterPassword: string): Promise<boolean> {
  try {
    const vault = await loadVault(masterPassword);
    if (!vault) return false;
    
    vault.entries = vault.entries.filter(e => e.id !== entryId);
    vault.lastModified = new Date().toISOString();
    
    return await saveVault(vault, masterPassword);
  } catch (error) {
    console.error('Failed to delete password entry:', error);
    return false;
  }
}

/**
 * Searches password entries
 */
export function searchEntries(entries: PasswordEntry[], query: string): PasswordEntry[] {
  if (!query.trim()) return entries;
  
  const lowercaseQuery = query.toLowerCase();
  return entries.filter(entry =>
    entry.website.toLowerCase().includes(lowercaseQuery) ||
    entry.username.toLowerCase().includes(lowercaseQuery) ||
    entry.notes.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Saves app settings
 */
export function saveSettings(settings: AppSettings): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

/**
 * Loads app settings with defaults
 */
export function loadSettings(): AppSettings {
  try {
    const settingsString = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!settingsString) return getDefaultSettings();
    
    return { ...getDefaultSettings(), ...JSON.parse(settingsString) };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return getDefaultSettings();
  }
}

/**
 * Gets default app settings
 */
function getDefaultSettings(): AppSettings {
  return {
    autoLockTimeout: 15, // 15 minutes
    clipboardClearTimeout: 30, // 30 seconds
    showPasswords: false
  };
}

/**
 * Clears all app data (for reset/logout)
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}