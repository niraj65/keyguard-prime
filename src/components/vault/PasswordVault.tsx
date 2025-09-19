/**
 * Main password vault interface
 */

import { useState, useEffect } from 'react';
import { loadVault, type VaultData } from '@/lib/storage';
import { type PasswordEntry } from '@/lib/encryption';
import { VaultHeader } from './VaultHeader';
import { PasswordList } from './PasswordList';
import { AddPasswordDialog } from './AddPasswordDialog';
import { PasswordGeneratorDialog } from './PasswordGeneratorDialog';
import { EditPasswordDialog } from './EditPasswordDialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

interface PasswordVaultProps {
  masterPassword: string;
  onLogout: () => void;
  onVaultDeleted: () => void;
}

export function PasswordVault({ masterPassword, onLogout, onVaultDeleted }: PasswordVaultProps) {
  const [vault, setVault] = useState<VaultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  // Load vault data
  useEffect(() => {
    const loadVaultData = async () => {
      try {
        const data = await loadVault(masterPassword);
        setVault(data);
      } catch (error) {
        toast({
          title: "Failed to Load Vault",
          description: "Could not decrypt your password vault.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadVaultData();
  }, [masterPassword, toast]);

  const handleVaultUpdate = async () => {
    // Reload vault data after updates
    const data = await loadVault(masterPassword);
    setVault(data);
  };

  const handleEditEntry = (entry: PasswordEntry) => {
    setSelectedEntry(entry);
    setShowEditDialog(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Shield className="w-16 h-16 text-primary mx-auto security-glow" />
            <Loader2 className="w-8 h-8 text-primary-glow animate-spin absolute top-4 left-1/2 transform -translate-x-1/2" />
          </div>
          <p className="text-muted-foreground">Decrypting Vault...</p>
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-destructive mx-auto" />
          <div>
            <h2 className="text-xl font-semibold">Failed to Load Vault</h2>
            <p className="text-muted-foreground">Unable to decrypt your password vault.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VaultHeader
        onLogout={onLogout}
        onAddPassword={() => setShowAddDialog(true)}
        onGeneratePassword={() => setShowGeneratorDialog(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        entriesCount={vault.entries.length}
        masterPassword={masterPassword}
        onVaultUpdate={handleVaultUpdate}
        onVaultDeleted={onVaultDeleted}
      />

      <main className="container mx-auto px-4 py-6">
        <PasswordList
          entries={vault.entries}
          searchQuery={searchQuery}
          masterPassword={masterPassword}
          onEditEntry={handleEditEntry}
          onVaultUpdate={handleVaultUpdate}
        />
      </main>

      <AddPasswordDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        masterPassword={masterPassword}
        onSuccess={handleVaultUpdate}
      />

      <PasswordGeneratorDialog
        open={showGeneratorDialog}
        onOpenChange={setShowGeneratorDialog}
      />

      <EditPasswordDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        entry={selectedEntry}
        masterPassword={masterPassword}
        onSuccess={handleVaultUpdate}
      />
    </div>
  );
}