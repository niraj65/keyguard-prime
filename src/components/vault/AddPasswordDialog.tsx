/**
 * Dialog for adding new password entries
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SecurityButton, VaultButton, SuccessButton } from '@/components/ui/button-variants';
import { addPasswordEntry } from '@/lib/storage';
import { generatePassword, calculatePasswordStrength, type PasswordGeneratorOptions } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, RefreshCw, Globe, User, Lock, StickyNote } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface AddPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterPassword: string;
  onSuccess: () => void;
}

export function AddPasswordDialog({
  open,
  onOpenChange,
  masterPassword,
  onSuccess
}: AddPasswordDialogProps) {
  const [formData, setFormData] = useState({
    website: '',
    username: '',
    password: '',
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
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

  const { score, feedback } = calculatePasswordStrength(formData.password);

  const generateNewPassword = () => {
    try {
      const newPassword = generatePassword(generatorOptions);
      setFormData(prev => ({ ...prev, password: newPassword }));
      toast({
        title: "Password Generated",
        description: "A strong password has been generated for you.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate password. Please adjust your settings.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.website || !formData.username || !formData.password) return;

    setIsLoading(true);
    try {
      const success = await addPasswordEntry(formData, masterPassword);
      if (success) {
        toast({
          title: "Password Added",
          description: `Password for ${formData.website} has been saved securely.`,
        });
        onSuccess();
        onOpenChange(false);
        setFormData({ website: '', username: '', password: '', notes: '' });
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save password entry.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Save Error",
        description: "An error occurred while saving the password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (score >= 80) return 'bg-security-high';
    if (score >= 60) return 'bg-security-medium';
    return 'bg-security-low';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md vault-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Add New Password
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="example.com"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Username/Email
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-3">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter or generate password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <VaultButton
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </VaultButton>
            </div>

            {/* Password strength */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Strength</span>
                  <span className="text-muted-foreground">{score}/100</span>
                </div>
                <Progress value={score} className="h-2">
                  <div className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`} 
                       style={{ width: `${score}%` }} />
                </Progress>
              </div>
            )}

            {/* Password generator */}
            {showGenerator && (
              <div className="bg-muted p-4 rounded-lg space-y-4">
                <h4 className="font-semibold text-sm">Password Generator</h4>
                
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
                      id="uppercase"
                      checked={generatorOptions.includeUppercase}
                      onCheckedChange={(checked) => 
                        setGeneratorOptions(prev => ({ ...prev, includeUppercase: !!checked }))
                      }
                    />
                    <Label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={generatorOptions.includeLowercase}
                      onCheckedChange={(checked) => 
                        setGeneratorOptions(prev => ({ ...prev, includeLowercase: !!checked }))
                      }
                    />
                    <Label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={generatorOptions.includeNumbers}
                      onCheckedChange={(checked) => 
                        setGeneratorOptions(prev => ({ ...prev, includeNumbers: !!checked }))
                      }
                    />
                    <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="symbols"
                      checked={generatorOptions.includeSymbols}
                      onCheckedChange={(checked) => 
                        setGeneratorOptions(prev => ({ ...prev, includeSymbols: !!checked }))
                      }
                    />
                    <Label htmlFor="symbols" className="text-sm">Symbols (!@#$%)</Label>
                  </div>
                </div>

                <SuccessButton
                  type="button"
                  onClick={generateNewPassword}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Password
                </SuccessButton>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or information"
              className="min-h-[80px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <VaultButton
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              variant="outline"
            >
              Cancel
            </VaultButton>
            <SecurityButton
              type="submit"
              disabled={!formData.website || !formData.username || !formData.password || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Password'}
            </SecurityButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}