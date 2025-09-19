/**
 * Delete vault confirmation dialog with 2-step verification
 */

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DangerButton } from '@/components/ui/button-variants';
import { deleteVault } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVaultDeleted: () => void;
}

export function DeleteVaultDialog({ open, onOpenChange, onVaultDeleted }: DeleteVaultDialogProps) {
  const [step, setStep] = useState(1);
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setStep(1);
    setConfirmation('');
    setIsDeleting(false);
    onOpenChange(false);
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalDelete = async () => {
    if (confirmation.toLowerCase() !== 'delete vault') {
      toast({
        title: "Confirmation Failed",
        description: "Please type 'DELETE VAULT' exactly to confirm.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteVault();
      if (success) {
        toast({
          title: "Vault Deleted",
          description: "Your password vault has been permanently deleted from memory and cache. Note: Downloaded vault files in your device storage must be manually deleted.",
          duration: 6000,
        });
        onVaultDeleted();
        handleClose();
      } else {
        toast({
          title: "Deletion Failed",
          description: "Failed to delete the vault. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Deletion Error",
        description: "An error occurred while deleting the vault.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {step === 1 ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <Trash2 className="w-5 h-5 text-destructive" />
            )}
            <AlertDialogTitle>
              {step === 1 ? 'Delete Password Vault?' : 'Confirm Vault Deletion'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            {step === 1 ? (
              <div className="space-y-2">
                <p>This action will permanently delete your entire password vault and cannot be undone.</p>
                <p className="text-destructive font-semibold">All your stored passwords will be lost forever.</p>
                <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
                  <p className="font-semibold">What will be deleted:</p>
                  <p>• All password entries from memory</p>
                  <p>• Application cache and stored data</p>
                  <p>• Biometric credentials (if any)</p>
                  <p className="text-muted-foreground mt-2">Note: Downloaded .pmvault files on your device storage must be manually deleted.</p>
                </div>
                <p>Make sure you have a backup if you want to keep your passwords.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p>To confirm deletion, type <strong>"DELETE VAULT"</strong> in the field below:</p>
                <div className="space-y-2">
                  <Label htmlFor="delete-confirmation">Confirmation</Label>
                  <Input
                    id="delete-confirmation"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="Type DELETE VAULT"
                    className="font-mono"
                  />
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          {step === 1 ? (
            <DangerButton onClick={handleFirstConfirm}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Continue
            </DangerButton>
          ) : (
            <AlertDialogAction asChild>
              <DangerButton 
                onClick={handleFinalDelete}
                disabled={isDeleting || confirmation.toLowerCase() !== 'delete vault'}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Vault Forever'}
              </DangerButton>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}