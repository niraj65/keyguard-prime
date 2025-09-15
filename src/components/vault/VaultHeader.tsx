/**
 * Header component for password vault
 */

import { Search, Plus, KeyRound, LogOut, Shield, Download, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SecurityButton, VaultButton, DangerButton } from '@/components/ui/button-variants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { downloadVaultFile, uploadVaultFile } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

interface VaultHeaderProps {
  onLogout: () => void;
  onAddPassword: () => void;
  onGeneratePassword: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  entriesCount: number;
  masterPassword: string;
  onVaultUpdate: () => void;
}

export function VaultHeader({
  onLogout,
  onAddPassword,
  onGeneratePassword,
  searchQuery,
  onSearchChange,
  entriesCount,
  masterPassword,
  onVaultUpdate
}: VaultHeaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = async () => {
    const success = await downloadVaultFile(masterPassword);
    if (success) {
      toast({
        title: "Vault Downloaded",
        description: "Your encrypted vault file has been downloaded successfully.",
      });
    } else {
      toast({
        title: "Download Failed",
        description: "Failed to download vault file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const success = await uploadVaultFile(file, masterPassword);
      if (success) {
        onVaultUpdate();
        toast({
          title: "Vault Imported",
          description: "Your vault file has been imported successfully.",
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to import vault file. Please check your master password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Invalid vault file or wrong master password.",
        variant: "destructive",
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <header className="border-b border-border/20 bg-security-vault">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center security-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SecureVault</h1>
              <p className="text-xs text-muted-foreground">
                {entriesCount} password{entriesCount !== 1 ? 's' : ''} stored
              </p>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <VaultButton onClick={onGeneratePassword}>
              <KeyRound className="w-4 h-4 mr-2" />
              Generate
            </VaultButton>
            
            <SecurityButton onClick={onAddPassword}>
              <Plus className="w-4 h-4 mr-2" />
              Add Password
            </SecurityButton>

            <VaultButton onClick={handleDownload} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </VaultButton>

            <VaultButton onClick={handleUpload} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </VaultButton>
            
            <DangerButton onClick={onLogout} size="sm">
              <LogOut className="w-4 h-4" />
            </DangerButton>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <VaultButton size="sm" className="relative">
                  <Plus className="w-4 h-4" />
                </VaultButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48"
                sideOffset={8}
                avoidCollisions={true}
                collisionPadding={16}
              >
                <DropdownMenuItem 
                  onClick={onAddPassword}
                  className="cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Password
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onGeneratePassword}
                  className="cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Generate Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDownload}
                  className="cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Vault
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleUpload}
                  className="cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Vault
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onLogout} 
                  className="text-destructive cursor-pointer focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pmvault,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </header>
  );
}