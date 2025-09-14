/**
 * Individual password entry card component
 */

import { useState } from 'react';
import { type PasswordEntry } from '@/lib/encryption';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { VaultButton, DangerButton } from '@/components/ui/button-variants';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Globe,
  User,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  StickyNote,
  Calendar,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordCardProps {
  entry: PasswordEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export function PasswordCard({ entry, onEdit, onDelete }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      });
      
      // Clear copy state after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
      
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

  const getWebsiteIcon = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isRecentlyCreated = () => {
    const created = new Date(entry.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7; // Show "New" badge for entries created in last 7 days
  };

  return (
    <Card className="vault-card group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {getWebsiteIcon(entry.website) ? (
                <img
                  src={getWebsiteIcon(entry.website)!}
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                  }}
                />
              ) : null}
              <Globe className="w-4 h-4 text-primary" style={{ display: getWebsiteIcon(entry.website) ? 'none' : 'block' }} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-semibold truncate">
                {entry.website}
              </CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <User className="w-3 h-3" />
                {entry.username}
              </p>
            </div>
          </div>
          
          {isRecentlyCreated() && (
            <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
              New
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Password field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Password</span>
            <div className="flex items-center gap-1">
              <VaultButton
                size="sm"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                className="h-6 w-6 p-0"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </VaultButton>
              <VaultButton
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(entry.password, 'Password')}
                className="h-6 w-6 p-0"
              >
                {copiedField === 'Password' ? (
                  <Check className="w-3 h-3 text-accent" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </VaultButton>
            </div>
          </div>
          <div className="font-mono text-sm bg-muted px-3 py-2 rounded border">
            {showPassword ? entry.password : '••••••••••••'}
          </div>
        </div>

        {/* Notes */}
        {entry.notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <StickyNote className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Notes</span>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded border">
              {entry.notes}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/20">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created {formatDate(entry.createdAt)}
          </div>
          {entry.updatedAt !== entry.createdAt && (
            <span>Updated {formatDate(entry.updatedAt)}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center gap-2 w-full">
          <VaultButton
            size="sm"
            onClick={() => copyToClipboard(entry.username, 'Username')}
            className="flex-1"
          >
            {copiedField === 'Username' ? (
              <Check className="w-3 h-3 mr-1 text-accent" />
            ) : (
              <User className="w-3 h-3 mr-1" />
            )}
            Copy Username
          </VaultButton>
          
          <VaultButton
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="p-2"
          >
            <Edit className="w-3 h-3" />
          </VaultButton>
          
          <DangerButton
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="p-2 hover:bg-destructive/10"
          >
            <Trash2 className="w-3 h-3" />
          </DangerButton>
        </div>
      </CardFooter>
    </Card>
  );
}