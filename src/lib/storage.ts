/**
 * Secure file-based storage utilities for password manager
 * Handles encrypted file storage of password entries with download/upload functionality
 */

import { encryptData, decryptData, type PasswordEntry, type EncryptedData } from './encryption';

const STORAGE_KEYS = {
  MASTER_HASH: 'pm_master_hash',
  SETTINGS: 'pm_settings'
} as const;

const VAULT_FILE_NAME = 'secure_vault.pmvault';

// In-memory vault storage for current session
let currentVaultData: VaultData | null = null;

export interface VaultData {
  entries: PasswordEntry[];
  version: string;
  lastModified: string;
  masterPasswordHash: string;
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
    
    // Initialize empty vault with master password hash
    const emptyVault: VaultData = {
      entries: [],
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      masterPasswordHash: hash
    };
    
    await saveVault(emptyVault, masterPassword);
    return true;
  } catch (error) {
    console.error('Failed to setup master password:', error);
    return false;
  }
}

/**
 * Verifies the master password against the vault data
 */
export async function verifyMasterPassword(masterPassword: string): Promise<boolean> {
  try {
    if (!currentVaultData?.masterPasswordHash) return false;
    
    const inputHash = await hashMasterPassword(masterPassword);
    return currentVaultData.masterPasswordHash === inputHash;
  } catch (error) {
    console.error('Failed to verify master password:', error);
    return false;
  }
}

/**
 * Checks if vault data exists (indicating setup is complete)
 */
export function hasVaultSetup(): boolean {
  return currentVaultData !== null && !!currentVaultData.masterPasswordHash;
}

/**
 * Saves the vault data to in-memory storage
 */
export async function saveVault(vaultData: VaultData, masterPassword: string): Promise<boolean> {
  try {
    currentVaultData = vaultData;
    return true;
  } catch (error) {
    console.error('Failed to save vault:', error);
    return false;
  }
}

/**
 * Loads the vault data from in-memory storage
 */
export async function loadVault(masterPassword: string): Promise<VaultData | null> {
  try {
    if (!currentVaultData) {
      // Return null if no vault is loaded
      return null;
    }
    return currentVaultData;
  } catch (error) {
    console.error('Failed to load vault:', error);
    return null;
  }
}

/**
 * Downloads the encrypted vault file
 */
export async function downloadVaultFile(masterPassword: string): Promise<boolean> {
  try {
    if (!currentVaultData) return false;
    
    const jsonData = JSON.stringify(currentVaultData);
    const encryptedData = await encryptData(jsonData, masterPassword);
    
    const blob = new Blob([JSON.stringify(encryptedData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = VAULT_FILE_NAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to download vault file:', error);
    return false;
  }
}

/**
 * Uploads and loads an encrypted vault file
 */
export async function uploadVaultFile(file: File, masterPassword: string): Promise<boolean> {
  try {
    const fileContent = await file.text();
    const encryptedData: EncryptedData = JSON.parse(fileContent);
    const decryptedString = await decryptData(encryptedData, masterPassword);
    const vaultData: VaultData = JSON.parse(decryptedString);
    
    currentVaultData = vaultData;
    return true;
  } catch (error) {
    console.error('Failed to upload vault file:', error);
    return false;
  }
}

/**
 * Checks if vault data exists in memory
 */
export function hasVaultData(): boolean {
  return currentVaultData !== null && currentVaultData.entries.length > 0;
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
  currentVaultData = null;
}