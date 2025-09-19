/**
 * File system utilities for PWA file handling and scanning
 */

export interface VaultFile {
  name: string;
  lastModified: number;
  size: number;
  file: File;
}

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window || 'showOpenFilePicker' in window;
}

/**
 * Check if we're running as a PWA
 */
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}

/**
 * Scan for .pmvault files using File System Access API
 */
export async function scanForVaultFiles(): Promise<VaultFile[]> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API not supported');
  }

  try {
    // For now, we'll use file picker since directory scanning requires user permission
    const fileHandles = await (window as any).showOpenFilePicker({
      multiple: true,
      types: [{
        description: 'Password Vault files',
        accept: {
          'application/octet-stream': ['.pmvault'],
          'application/json': ['.pmvault']
        }
      }]
    });

    const vaultFiles: VaultFile[] = [];
    
    for (const fileHandle of fileHandles) {
      const file = await fileHandle.getFile();
      if (file.name.endsWith('.pmvault')) {
        vaultFiles.push({
          name: file.name,
          lastModified: file.lastModified,
          size: file.size,
          file: file
        });
      }
    }

    // Sort by last modified (newest first)
    return vaultFiles.sort((a, b) => b.lastModified - a.lastModified);
  } catch (error) {
    console.error('Failed to scan for vault files:', error);
    return [];
  }
}

/**
 * Get the latest vault file from a list
 */
export function getLatestVaultFile(vaultFiles: VaultFile[]): VaultFile | null {
  if (vaultFiles.length === 0) return null;
  return vaultFiles[0]; // Already sorted by lastModified
}

/**
 * Request directory access for more comprehensive scanning (future enhancement)
 */
export async function requestDirectoryAccess(): Promise<any> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('Directory picker not supported');
  }

  try {
    return await (window as any).showDirectoryPicker({
      mode: 'read'
    });
  } catch (error) {
    console.error('Failed to get directory access:', error);
    throw error;
  }
}

/**
 * Check if vault file exists in downloads or accessible directories
 */
export async function findVaultFilesInDirectory(dirHandle: any): Promise<VaultFile[]> {
  const vaultFiles: VaultFile[] = [];
  
  try {
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file' && name.endsWith('.pmvault')) {
        const file = await handle.getFile();
        vaultFiles.push({
          name: file.name,
          lastModified: file.lastModified,
          size: file.size,
          file: file
        });
      }
    }
  } catch (error) {
    console.error('Error scanning directory:', error);
  }

  return vaultFiles.sort((a, b) => b.lastModified - a.lastModified);
}