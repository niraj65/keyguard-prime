/**
 * Biometric authentication utilities for secure master password storage
 */

import { Capacitor } from '@capacitor/core';

// Types for biometric authentication (defined locally until plugin is added)
interface BiometricResult {
  isAvailable: boolean;
  biometryType?: string;
}

interface BiometricSecret {
  key: string;
  value: string;
  promptMessage: string;
}

interface BiometricSecretResult {
  value: string;
}

const BIOMETRIC_KEY = 'secure_vault_master_password';

export interface BiometricAuthResult {
  success: boolean;
  masterPassword?: string;
  error?: string;
}

/**
 * Check if biometric authentication is available on the device
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      // TODO: Replace with actual plugin when @capacitor-community/biometric-auth is installed
      // const result = await BiometricAuth.isAvailable();
      // return result.isAvailable;
      
      // For now, assume biometrics are available on native platforms
      return true;
    }
    // For web, biometrics aren't available (use fallback)
    return false;
  } catch (error) {
    console.log('Biometric not available:', error);
    return false;
  }
}

/**
 * Get the type of biometric authentication available
 */
export async function getBiometricType(): Promise<string | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      // TODO: Replace with actual plugin implementation
      // const result = await BiometricAuth.isAvailable();
      // return result.biometryType === 'fingerprint' ? 'fingerprint' : 'face';
      
      // For now, return fingerprint as default
      return 'fingerprint';
    }
    return null;
  } catch (error) {
    console.log('Could not get biometric type:', error);
    return null;
  }
}

/**
 * Store the master password securely with biometric protection
 */
export async function storeMasterPasswordWithBiometric(masterPassword: string): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      // TODO: Replace with actual plugin when installed
      // await BiometricAuth.setBiometricSecret({
      //   key: BIOMETRIC_KEY,
      //   value: masterPassword,
      //   promptMessage: 'Store your master password securely'
      // });
      
      // For now, use secure storage simulation
      const encrypted = btoa(masterPassword + ':native');
      localStorage.setItem(BIOMETRIC_KEY + '_native', encrypted);
      return true;
    } else {
      // Fallback for web - simple encoding (not secure for production)
      const encrypted = btoa(masterPassword);
      localStorage.setItem(BIOMETRIC_KEY, encrypted);
      return true;
    }
  } catch (error) {
    console.error('Failed to store master password with biometric:', error);
    return false;
  }
}

/**
 * Retrieve the master password using biometric authentication
 */
export async function getMasterPasswordWithBiometric(): Promise<BiometricAuthResult> {
  try {
    if (Capacitor.isNativePlatform()) {
      // TODO: Replace with actual plugin implementation
      // const result = await BiometricAuth.getBiometricSecret({
      //   key: BIOMETRIC_KEY,
      //   promptMessage: 'Use biometric authentication to unlock your vault'
      // });
      // return { success: true, masterPassword: result.value };
      
      // For now, simulate native biometric prompt
      const confirmed = confirm('🔒 Use fingerprint to unlock your vault?');
      if (!confirmed) {
        return {
          success: false,
          error: 'Biometric authentication cancelled'
        };
      }
      
      const encrypted = localStorage.getItem(BIOMETRIC_KEY + '_native');
      if (!encrypted) {
        return {
          success: false,
          error: 'No biometric credentials stored'
        };
      }
      
      const masterPassword = atob(encrypted).replace(':native', '');
      return {
        success: true,
        masterPassword
      };
    } else {
      // Fallback for web - simple confirm dialog
      const confirmed = confirm('Use biometric authentication to unlock vault? (Web Demo)');
      if (!confirmed) {
        return {
          success: false,
          error: 'Biometric authentication cancelled'
        };
      }
      
      const encrypted = localStorage.getItem(BIOMETRIC_KEY);
      if (!encrypted) {
        return {
          success: false,
          error: 'No biometric credentials stored'
        };
      }
      
      const masterPassword = atob(encrypted);
      return {
        success: true,
        masterPassword
      };
    }
  } catch (error: any) {
    console.log('Biometric authentication failed:', error);
    return {
      success: false,
      error: error.message || 'Biometric authentication failed'
    };
  }
}

/**
 * Delete stored biometric credentials
 */
export async function deleteBiometricCredentials(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      // TODO: Replace with actual plugin
      // await BiometricAuth.deleteBiometricSecret({ key: BIOMETRIC_KEY });
      localStorage.removeItem(BIOMETRIC_KEY + '_native');
    } else {
      localStorage.removeItem(BIOMETRIC_KEY);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete biometric credentials:', error);
    return false;
  }
}

/**
 * Check if biometric credentials are stored
 */
export async function hasBiometricCredentials(): Promise<boolean> {
  try {
    const available = await isBiometricAvailable();
    if (!available) return false;
    
    if (Capacitor.isNativePlatform()) {
      // Check if credentials exist in native storage
      const stored = localStorage.getItem(BIOMETRIC_KEY + '_native');
      return !!stored;
    } else {
      // For web, check localStorage flag
      return localStorage.getItem('biometric_enabled') === 'true';
    }
  } catch (error) {
    return false;
  }
}

/**
 * Enable biometric authentication by storing the flag
 */
export function enableBiometricAuth(): void {
  localStorage.setItem('biometric_enabled', 'true');
}

/**
 * Disable biometric authentication
 */
export async function disableBiometricAuth(): Promise<void> {
  localStorage.removeItem('biometric_enabled');
  await deleteBiometricCredentials();
}