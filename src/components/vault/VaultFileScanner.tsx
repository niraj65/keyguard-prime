/**
 * Vault file scanner component for PWA file detection
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityButton, VaultButton } from '@/components/ui/button-variants';
import { useToast } from '@/hooks/use-toast';
import { Scan, FileSearch, Clock, HardDrive, Smartphone } from 'lucide-react';
import { 
  scanForVaultFiles, 
  getLatestVaultFile, 
  isFileSystemAccessSupported,
  isPWA,
  type VaultFile 
} from '@/lib/fileSystem';
import { uploadVaultFile } from '@/lib/storage';

interface VaultFileScannerProps {
  onFileSelected: (file: File) => void;
  onScanComplete: () => void;
}

export function VaultFileScanner({ onFileSelected, onScanComplete }: VaultFileScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [foundFiles, setFoundFiles] = useState<VaultFile[]>([]);
  const [showFiles, setShowFiles] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showPWAInfo, setShowPWAInfo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const supported = isFileSystemAccessSupported();
    const pwa = isPWA();
    setIsSupported(supported);
    setShowPWAInfo(pwa && supported);
  }, []);

  const handleScanFiles = async () => {
    if (!isFileSystemAccessSupported()) {
      toast({
        title: "Feature Not Supported",
        description: "File scanning is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    try {
      const files = await scanForVaultFiles();
      setFoundFiles(files);
      setShowFiles(true);
      
      if (files.length === 0) {
        toast({
          title: "No Vault Files Found",
          description: "No .pmvault files were found in the selected location.",
        });
      } else {
        toast({
          title: "Vault Files Found",
          description: `Found ${files.length} vault file${files.length !== 1 ? 's' : ''}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to scan for vault files. Please try manual selection.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectFile = (vaultFile: VaultFile) => {
    onFileSelected(vaultFile.file);
    onScanComplete();
  };

  const handleLoadLatest = async () => {
    const latestFile = getLatestVaultFile(foundFiles);
    if (latestFile) {
      handleSelectFile(latestFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {showPWAInfo && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">PWA Enhanced Features</h4>
                <p className="text-xs text-muted-foreground">
                  Running as PWA! You can now scan your device storage for vault files automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isSupported && (
        <Card className="vault-card">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Auto-Scan for Vault Files</CardTitle>
              <CardDescription>
                Automatically find .pmvault files on your device
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <SecurityButton
              onClick={handleScanFiles}
              disabled={isScanning}
              className="w-full"
            >
              <Scan className="w-4 h-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Scan Device Storage'}
            </SecurityButton>

            {showFiles && foundFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Found Vault Files</h4>
                  <VaultButton
                    onClick={handleLoadLatest}
                    size="sm"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Load Latest
                  </VaultButton>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {foundFiles.map((vaultFile, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleSelectFile(vaultFile)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{vaultFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(vaultFile.lastModified)} • {formatFileSize(vaultFile.size)}
                        </p>
                      </div>
                      <HardDrive className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}