/**
 * Dialog for editing existing password entries
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SecurityButton, VaultButton } from '@/components/ui/button-variants';
import { updatePasswordEntry } from '@/lib/storage';
import { calculatePasswordStrength, type PasswordEntry } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Globe, User, Lock, StickyNote } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface EditPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: PasswordEntry | null;
  masterPassword: string;
  onSuccess: () => void;
}

export function EditPasswordDialog({
  open,
  onOpenChange,
  entry,
  masterPassword,
  onSuccess
}: EditPasswordDialogProps) {
  const [formData, setFormData] = useState({
    website: '',
    username: '',
    password: '',
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { score, feedback } = calculatePasswordStrength(formData.password);

  // Initialize form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        website: entry.website,
        username: entry.username,
        password: entry.password,
        notes: entry.notes
      });
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || !formData.website || !formData.username || !formData.password) return;

    setIsLoading(true);
    try {
      const success = await updatePasswordEntry(entry.id, formData, masterPassword);
      if (success) {
        toast({
          title: "Password Updated",
          description: `Password for ${formData.website} has been updated.`,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update password entry.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update Error",
        description: "An error occurred while updating the password.",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md vault-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Edit Password
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="edit-website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="edit-website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="example.com"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="edit-username" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Username/Email
            </Label>
            <Input
              id="edit-username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-3">
            <Label htmlFor="edit-password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
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
                
                {feedback.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {feedback.map((item, index) => (
                      <div key={index}>• {item}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Notes (Optional)
            </Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or information"
              className="min-h-[80px]"
            />
          </div>

          {/* Entry metadata */}
          <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground space-y-1">
            <div>Created: {formatDate(entry.createdAt)}</div>
            {entry.updatedAt !== entry.createdAt && (
              <div>Last updated: {formatDate(entry.updatedAt)}</div>
            )}
            <div>Entry ID: {entry.id.slice(0, 8)}...</div>
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
              {isLoading ? 'Updating...' : 'Update Password'}
            </SecurityButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}