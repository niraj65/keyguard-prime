/**
 * Password entries list component
 */

import { useState } from 'react';
import { type PasswordEntry } from '@/lib/encryption';
import { searchEntries, deletePasswordEntry } from '@/lib/storage';
import { PasswordCard } from './PasswordCard';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Shield } from 'lucide-react';

interface PasswordListProps {
  entries: PasswordEntry[];
  searchQuery: string;
  masterPassword: string;
  onEditEntry: (entry: PasswordEntry) => void;
  onVaultUpdate: () => void;
}

export function PasswordList({
  entries,
  searchQuery,
  masterPassword,
  onEditEntry,
  onVaultUpdate
}: PasswordListProps) {
  const [deleteEntry, setDeleteEntry] = useState<PasswordEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const filteredEntries = searchEntries(entries, searchQuery);

  const handleDeleteEntry = async () => {
    if (!deleteEntry) return;

    setIsDeleting(true);
    try {
      const success = await deletePasswordEntry(deleteEntry.id, masterPassword);
      if (success) {
        toast({
          title: "Password Deleted",
          description: `Password for ${deleteEntry.website} has been removed.`,
        });
        onVaultUpdate();
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete password entry.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Delete Error",
        description: "An error occurred while deleting the password.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteEntry(null);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Passwords Stored</h3>
        <p className="text-muted-foreground mb-6">
          Start securing your accounts by adding your first password.
        </p>
      </div>
    );
  }

  if (filteredEntries.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search terms or add a new password.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {filteredEntries.map((entry) => (
          <PasswordCard
            key={entry.id}
            entry={entry}
            onEdit={() => onEditEntry(entry)}
            onDelete={() => setDeleteEntry(entry)}
          />
        ))}
      </div>

      <AlertDialog open={!!deleteEntry} onOpenChange={() => setDeleteEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Password</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the password for{' '}
              <strong>{deleteEntry?.website}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}