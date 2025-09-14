/**
 * Standalone password generator dialog
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { VaultButton, SuccessButton } from '@/components/ui/button-variants';
import { generatePassword, calculatePasswordStrength, type PasswordGeneratorOptions } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Copy, KeyRound, Check, Eye, EyeOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface PasswordGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordGeneratorDialog({
  open,
  onOpenChange
}: PasswordGeneratorDialogProps) {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generatorOptions, setGeneratorOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeNumbers: true,
    includeSymbols: true,
    includeUppercase: true,
    includeLowercase: true,
    numbersCount: 3,
    symbolsCount: 2
  });
  const { toast } = useToast();

  const { score, feedback } = calculatePasswordStrength(generatedPassword);

  const generateNewPassword = () => {
    try {
      const newPassword = generatePassword(generatorOptions);
      setGeneratedPassword(newPassword);
      setCopied(false);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please select at least one character type.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    if (!generatedPassword) return;

    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
      
      // Clear copy state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      // Auto-clear clipboard after 30 seconds for security
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 30000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

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

  // Generate initial password when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && !generatedPassword) {
      generateNewPassword();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent className="max-w-md vault-card" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Password Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generated Password Display */}
          {generatedPassword && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Generated Password</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="font-mono text-sm bg-muted p-3 rounded border break-all">
                      {showPassword ? generatedPassword : '••••••••••••••••'}
                    </div>
                  </div>
                  <VaultButton
                    onClick={() => setShowPassword(!showPassword)}
                    size="sm"
                    className="p-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </VaultButton>
                  <VaultButton
                    onClick={copyToClipboard}
                    size="sm"
                    className="p-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                  </VaultButton>
                </div>

                {/* Password strength */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Strength: {getStrengthText()}</span>
                    <span className="text-muted-foreground">{score}/100</span>
                  </div>
                  <Progress value={score} className="h-2">
                    <div className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`} 
                         style={{ width: `${score}%` }} />
                  </Progress>
                </div>
              </div>
            </div>
          )}

          {/* Generator Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Generator Settings</Label>
            
            {/* Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Length: {generatorOptions.length}</Label>
              </div>
              <Slider
                value={[generatorOptions.length]}
                onValueChange={([value]) => setGeneratorOptions(prev => ({ ...prev, length: value }))}
                min={8}
                max={64}
                step={1}
                className="w-full"
              />
            </div>

            {/* Character types */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gen-uppercase"
                  checked={generatorOptions.includeUppercase}
                  onCheckedChange={(checked) => 
                    setGeneratorOptions(prev => ({ ...prev, includeUppercase: !!checked }))
                  }
                />
                <Label htmlFor="gen-uppercase" className="text-sm">Uppercase Letters (A-Z)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gen-lowercase"
                  checked={generatorOptions.includeLowercase}
                  onCheckedChange={(checked) => 
                    setGeneratorOptions(prev => ({ ...prev, includeLowercase: !!checked }))
                  }
                />
                <Label htmlFor="gen-lowercase" className="text-sm">Lowercase Letters (a-z)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gen-numbers"
                  checked={generatorOptions.includeNumbers}
                  onCheckedChange={(checked) => 
                    setGeneratorOptions(prev => ({ ...prev, includeNumbers: !!checked }))
                  }
                />
                <Label htmlFor="gen-numbers" className="text-sm">Numbers (0-9)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gen-symbols"
                  checked={generatorOptions.includeSymbols}
                  onCheckedChange={(checked) => 
                    setGeneratorOptions(prev => ({ ...prev, includeSymbols: !!checked }))
                  }
                />
                <Label htmlFor="gen-symbols" className="text-sm">Special Characters (!@#$%^&*)</Label>
              </div>
            </div>

            {/* Advanced options */}
            {generatorOptions.includeNumbers && (
              <div className="space-y-2">
                <Label className="text-sm">Minimum Numbers: {generatorOptions.numbersCount}</Label>
                <Slider
                  value={[generatorOptions.numbersCount || 0]}
                  onValueChange={([value]) => setGeneratorOptions(prev => ({ ...prev, numbersCount: value }))}
                  min={1}
                  max={Math.floor(generatorOptions.length / 2)}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {generatorOptions.includeSymbols && (
              <div className="space-y-2">
                <Label className="text-sm">Minimum Symbols: {generatorOptions.symbolsCount}</Label>
                <Slider
                  value={[generatorOptions.symbolsCount || 0]}
                  onValueChange={([value]) => setGeneratorOptions(prev => ({ ...prev, symbolsCount: value }))}
                  min={1}
                  max={Math.floor(generatorOptions.length / 2)}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <VaultButton
              onClick={() => onOpenChange(false)}
              className="flex-1"
              variant="outline"
            >
              Close
            </VaultButton>
            <SuccessButton
              onClick={generateNewPassword}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New
            </SuccessButton>
          </div>

          {/* Security tip */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Use unique, strong passwords for each account. 
              This password will be automatically cleared from your clipboard after 30 seconds.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}