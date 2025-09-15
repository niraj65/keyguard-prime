/**
 * Master password login component for returning users
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SecurityButton, DangerButton } from '@/components/ui/button-variants';
import { verifyMasterPassword, clearAllData } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, AlertTriangle, Trash2, Fingerprint } from 'lucide-react';
import { 
  isBiometricAvailable, 
  getMasterPasswordWithBiometric, 
  hasBiometricCredentials 
} from '@/lib/biometric';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MasterPasswordLoginProps {
  onLoginSuccess: (password: string) => void;
}

export function MasterPasswordLogin({ onLoginSuccess }: MasterPasswordLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await isBiometricAvailable();
      const hasCredentials = await hasBiometricCredentials();
      setBiometricAvailable(available);
      setHasBiometric(hasCredentials);
    };
    checkBiometric();
  }, []);

  const maxAttempts = 5;
  const isLocked = attempts >= maxAttempts;

  const handleBiometricLogin = async () => {
    if (!biometricAvailable || !hasBiometric) return;

    setIsLoading(true);
    try {
      const result = await getMasterPasswordWithBiometric();
      
      if (result.success && result.masterPassword) {
        const isValid = await verifyMasterPassword(result.masterPassword);
        
        if (isValid) {
          toast({
            title: "Welcome Back",
            description: "Successfully unlocked your password vault with biometrics.",
          });
          onLoginSuccess(result.masterPassword);
        } else {
          toast({
            title: "Biometric Error",
            description: "Biometric authentication succeeded but password verification failed.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Biometric Failed",
          description: result.error || "Biometric authentication failed.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Biometric Error",
        description: "An error occurred during biometric authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isLocked) return;

    setIsLoading(true);
    
    try {
      const isValid = await verifyMasterPassword(password);
      
      if (isValid) {
        toast({
          title: "Welcome Back",
          description: "Successfully unlocked your password vault.",
        });
        onLoginSuccess(password);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          toast({
            title: "Account Locked",
            description: "Too many failed attempts. Please reset your vault or try again later.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Invalid Password",
            description: `Incorrect master password. ${maxAttempts - newAttempts} attempts remaining.`,
            variant: "destructive",
          });
        }
        setPassword('');
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    clearAllData();
    toast({
      title: "Vault Reset",
      description: "All data has been cleared. You can now set up a new master password.",
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md vault-card unlock-animation">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center security-glow">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Unlock Your Vault</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Enter your master password to access your secure password vault.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {biometricAvailable && hasBiometric && (
              <div className="space-y-4">
                <SecurityButton
                  onClick={handleBiometricLogin}
                  className="w-full"
                  disabled={isLoading || isLocked}
                >
                  <Fingerprint className="w-4 h-4 mr-2" />
                  {isLoading ? 'Authenticating...' : 'Unlock with Biometrics'}
                </SecurityButton>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or use master password
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="master-password">Master Password</Label>
              <div className="relative">
                <Input
                  id="master-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  className="pr-10"
                  disabled={isLocked}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLocked}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {attempts > 0 && !isLocked && (
                <div className="flex items-center gap-2 text-sm text-security-medium">
                  <AlertTriangle className="w-4 h-4" />
                  {maxAttempts - attempts} attempts remaining
                </div>
              )}
              
              {isLocked && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Account locked due to too many failed attempts
                  </div>
                </div>
              )}
            </div>

            <SecurityButton
              type="submit"
              className="w-full"
              disabled={!password || isLoading || isLocked}
            >
              {isLoading ? 'Verifying...' : 'Unlock Vault'}
            </SecurityButton>

            {isLocked && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">Forgot your master password?</h4>
                  <p className="text-xs text-muted-foreground">
                    If you can't remember your master password, you'll need to reset your vault. 
                    This will permanently delete all stored passwords.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DangerButton className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset Vault
                    </DangerButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Password Vault?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All stored passwords and data will be permanently deleted. 
                        You will need to set up a new master password and re-add all your passwords.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
                        Yes, Reset Vault
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}