/**
 * Master password setup component for first-time users
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SecurityButton } from '@/components/ui/button-variants';
import { setupMasterPassword } from '@/lib/storage';
import { calculatePasswordStrength } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MasterPasswordSetupProps {
  onSetupComplete: (password: string) => void;
}

export function MasterPasswordSetup({ onSetupComplete }: MasterPasswordSetupProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { score, feedback } = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const canSubmit = score >= 60 && passwordsMatch;

  const getStrengthColor = () => {
    if (score >= 80) return 'bg-security-high';
    if (score >= 60) return 'bg-security-medium';
    return 'bg-security-low';
  };

  const getStrengthText = () => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Weak';
    return 'Very Weak';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    
    try {
      const success = await setupMasterPassword(password);
      if (success) {
        toast({
          title: "Vault Created Successfully",
          description: "Your secure password vault has been initialized.",
        });
        onSetupComplete(password);
      } else {
        toast({
          title: "Setup Failed",
          description: "Failed to create your vault. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md vault-card unlock-animation">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center security-glow">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Create Master Password</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              This password will protect all your stored credentials. Choose a strong, memorable password.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="master-password">Master Password</Label>
              <div className="relative">
                <Input
                  id="master-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong master password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Strength: {getStrengthText()}</span>
                    <span className="text-muted-foreground">{score}/100</span>
                  </div>
                  <Progress value={score} className="h-2">
                    <div className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`} 
                         style={{ width: `${score}%` }} />
                  </Progress>
                  
                  {feedback.length > 0 && (
                    <div className="space-y-1">
                      {feedback.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3 text-security-medium" />
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Master Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your master password"
                  className="pr-10"
                  required
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {passwordsMatch ? (
                      <CheckCircle className="w-4 h-4 text-security-high" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-security-low" />
                    )}
                  </div>
                )}
              </div>
              
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-security-low">Passwords do not match</p>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Security Notice
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Your master password cannot be recovered if forgotten</li>
                <li>• All data is encrypted using AES-256-GCM encryption</li>
                <li>• Data is stored locally on your device only</li>
                <li>• Choose a password that is both strong and memorable</li>
              </ul>
            </div>

            <SecurityButton
              type="submit"
              className="w-full"
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? 'Creating Vault...' : 'Create Secure Vault'}
            </SecurityButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}