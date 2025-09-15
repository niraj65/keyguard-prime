/**
 * Biometric authentication utilities for secure master password storage
 */

import { Capacitor } from '@capacitor/core';

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
    // For now, we'll simulate biometric availability based on platform
    // In a real implementation, you'd use a proper biometric plugin
    if (Capacitor.isNativePlatform()) {
      return true; // Assume biometrics are available on native platforms
    }
    return false; // Not available on web
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
      return 'fingerprint'; // Simplified for demo
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
    // For demo purposes, we'll encrypt and store in localStorage
    // In a real implementation, this would use secure native storage
    const encrypted = btoa(masterPassword); // Simple encoding for demo
    localStorage.setItem(BIOMETRIC_KEY, encrypted);
    return true;
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
    // Simulate biometric prompt
    if (Capacitor.isNativePlatform()) {
      // In a real implementation, this would show native biometric prompt
      const confirmed = confirm('Use biometric authentication to unlock vault?');
      if (!confirmed) {
        return {
          success: false,
          error: 'Biometric authentication cancelled'
        };
      }
    }
    
    const encrypted = localStorage.getItem(BIOMETRIC_KEY);
    if (!encrypted) {
      return {
        success: false,
        error: 'No biometric credentials stored'
      };
    }
    
    const masterPassword = atob(encrypted); // Simple decoding for demo
    return {
      success: true,
      masterPassword
    };
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
    localStorage.removeItem(BIOMETRIC_KEY);
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
    // Try to check if credentials exist by attempting to get them
    // This is a bit hacky but the plugin doesn't have a direct "exists" method
    const available = await isBiometricAvailable();
    if (!available) return false;
    
    // We'll store a flag in localStorage to track if biometric is set up
    return localStorage.getItem('biometric_enabled') === 'true';
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