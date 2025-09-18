/**
 * Initial screen for vault - Import existing or Create new
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SecurityButton } from '@/components/ui/button-variants';
import { uploadVaultFile } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Shield, Upload, Plus, FileKey, Fingerprint } from 'lucide-react';
import { 
  isBiometricAvailable, 
  hasBiometricCredentials,
  getMasterPasswordWithBiometric 
} from '@/lib/biometric';

interface VaultInitialProps {
  onImportSuccess: () => void;
  onCreateNew: () => void;
}

export function VaultInitial({ onImportSuccess, onCreateNew }: VaultInitialProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPassword, setImportPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await isBiometricAvailable();
      const hasCredentials = await hasBiometricCredentials();
      setBiometricAvailable(available);
      setHasBiometric(hasCredentials);
    };
    checkBiometric();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.pmvault')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a valid .pmvault file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBiometricImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const biometricResult = await getMasterPasswordWithBiometric();
      if (biometricResult.success && biometricResult.masterPassword) {
        const success = await uploadVaultFile(selectedFile, biometricResult.masterPassword);
        if (success) {
          toast({
            title: "Vault Imported Successfully",
            description: "Your password vault has been loaded using biometric authentication.",
          });
          onImportSuccess();
        } else {
          toast({
            title: "Import Failed",
            description: "Invalid file or biometric credentials don't match this vault.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Biometric Authentication Failed",
          description: biometricResult.error || "Could not authenticate with biometrics.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to import vault file with biometric authentication.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !importPassword) return;

    setIsImporting(true);
    try {
      const success = await uploadVaultFile(selectedFile, importPassword);
      if (success) {
        toast({
          title: "Vault Imported Successfully",
          description: "Your password vault has been loaded.",
        });
        onImportSuccess();
      } else {
        toast({
          title: "Import Failed",
          description: "Invalid file or incorrect master password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to import vault file. Please check the file and password.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center security-glow">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Secure Password Vault</h1>
            <p className="text-muted-foreground mt-2">
              Import an existing vault or create a new one to get started
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Import Existing Vault */}
          <Card className="vault-card unlock-animation">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileKey className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Import Existing Vault</CardTitle>
                <CardDescription>
                  Load your password vault from a .pmvault file
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleImport} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vault-file">Vault File (.pmvault)</Label>
                  <div className="relative">
                    <Input
                      id="vault-file"
                      type="file"
                      accept=".pmvault"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                      required
                    />
                    <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import-password">Master Password</Label>
                  <Input
                    id="import-password"
                    type="password"
                    value={importPassword}
                    onChange={(e) => setImportPassword(e.target.value)}
                    placeholder="Enter your master password"
                    required
                  />
                </div>

                {biometricAvailable && hasBiometric && selectedFile && (
                  <SecurityButton
                    type="button"
                    onClick={handleBiometricImport}
                    className="w-full mb-3"
                    disabled={isImporting}
                    variant="outline"
                  >
                    <Fingerprint className="w-4 h-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import with Biometrics'}
                  </SecurityButton>
                )}

                <SecurityButton
                  type="submit"
                  className="w-full"
                  disabled={!selectedFile || !importPassword || isImporting}
                >
                  {isImporting ? 'Importing...' : 'Import with Password'}
                </SecurityButton>
              </form>
            </CardContent>
          </Card>

          {/* Create New Vault */}
          <Card className="vault-card unlock-animation" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Create New Vault</CardTitle>
                <CardDescription>
                  Set up a new secure password vault from scratch
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">What you'll get:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• AES-256-GCM encryption</li>
                    <li>• Secure password generation</li>
                    <li>• Local file storage</li>
                    <li>• Export/import functionality</li>
                  </ul>
                </div>

                <SecurityButton
                  onClick={onCreateNew}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Vault
                </SecurityButton>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Security & Privacy</h4>
                <p className="text-xs text-muted-foreground">
                  Your vault is encrypted and stored locally on your device. We never have access to your data or passwords. 
                  Always keep backup copies of your vault file in a secure location.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}