/**
 * Main Password Manager component - handles routing between auth and vault
 */

import { useState, useEffect } from 'react';
import { MasterPasswordSetup } from './auth/MasterPasswordSetup';
import { MasterPasswordLogin } from './auth/MasterPasswordLogin';
import { PasswordVault } from './vault/PasswordVault';
import { isMasterPasswordSetup } from '@/lib/storage';
import { Loader2, Shield } from 'lucide-react';

export function PasswordManager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if master password is already set up
    const checkSetup = async () => {
      const setupStatus = isMasterPasswordSetup();
      setIsSetup(setupStatus);
      setIsLoading(false);
    };
    
    checkSetup();
  }, []);

  const handleSetupComplete = (password: string) => {
    setMasterPassword(password);
    setIsAuthenticated(true);
    setIsSetup(true);
  };

  const handleLoginSuccess = (password: string) => {
    setMasterPassword(password);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMasterPassword('');
    // Don't clear setup status on logout
  };

  if (isLoading) {
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
      />
    );
  }

  if (isSetup === false) {
    return <MasterPasswordSetup onSetupComplete={handleSetupComplete} />;
  }

  return <MasterPasswordLogin onLoginSuccess={handleLoginSuccess} />;
}