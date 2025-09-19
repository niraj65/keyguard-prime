/**
 * Main Password Manager component - handles routing between auth and vault
 */

import { useState, useEffect } from 'react';
import { VaultInitial } from './auth/VaultInitial';
import { MasterPasswordSetup } from './auth/MasterPasswordSetup';
import { MasterPasswordLogin } from './auth/MasterPasswordLogin';
import { PasswordVault } from './vault/PasswordVault';
import { hasVaultSetup, verifyMasterPassword } from '@/lib/storage';
import { Loader2, Shield } from 'lucide-react';

export function PasswordManager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [vaultState, setVaultState] = useState<'loading' | 'initial' | 'setup' | 'login'>('loading');

  useEffect(() => {
    // Check if vault is already loaded
    const checkVaultState = async () => {
      const hasVault = hasVaultSetup();
      if (hasVault) {
        setVaultState('login');
      } else {
        setVaultState('initial');
      }
    };
    
    checkVaultState();
  }, []);

  const handleImportSuccess = () => {
    setVaultState('login');
  };

  const handleCreateNew = () => {
    setVaultState('setup');
  };

  const handleSetupComplete = (password: string) => {
    setMasterPassword(password);
    setIsAuthenticated(true);
  };

  const handleLoginSuccess = (password: string) => {
    setMasterPassword(password);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMasterPassword('');
    setVaultState('initial');
  };

  const handleVaultDeleted = () => {
    setIsAuthenticated(false);
    setMasterPassword('');
    setVaultState('initial');
  };

  if (vaultState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Shield className="w-16 h-16 text-primary mx-auto security-glow" />
            <Loader2 className="w-8 h-8 text-primary-glow animate-spin absolute top-4 left-1/2 transform -translate-x-1/2" />
          </div>
          <p className="text-muted-foreground">Initializing Secure Vault...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <PasswordVault 
        masterPassword={masterPassword} 
        onLogout={handleLogout}
        onVaultDeleted={handleVaultDeleted}
      />
    );
  }

  if (vaultState === 'initial') {
    return (
      <VaultInitial 
        onImportSuccess={handleImportSuccess}
        onCreateNew={handleCreateNew}
      />
    );
  }

  if (vaultState === 'setup') {
    return <MasterPasswordSetup onSetupComplete={handleSetupComplete} />;
  }

  return <MasterPasswordLogin onLoginSuccess={handleLoginSuccess} />;
}