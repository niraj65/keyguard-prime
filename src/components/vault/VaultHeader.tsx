/**
 * Header component for password vault
 */

import { Search, Plus, KeyRound, LogOut, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SecurityButton, VaultButton, DangerButton } from '@/components/ui/button-variants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VaultHeaderProps {
  onLogout: () => void;
  onAddPassword: () => void;
  onGeneratePassword: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  entriesCount: number;
}

export function VaultHeader({
  onLogout,
  onAddPassword,
  onGeneratePassword,
  searchQuery,
  onSearchChange,
  entriesCount
}: VaultHeaderProps) {
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
            
            <DangerButton onClick={onLogout} size="sm">
              <LogOut className="w-4 h-4" />
            </DangerButton>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <VaultButton size="sm">
                  <Plus className="w-4 h-4" />
                </VaultButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onAddPassword}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onGeneratePassword}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Generate Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
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
      </div>
    </header>
  );
}