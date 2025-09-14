import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9fde4d183aa64986bee4f09fc94516f3',
  appName: 'SecureVault - Password Manager',
  webDir: 'dist',
  server: {
    url: 'https://9fde4d18-3aa6-4986-bee4-f09fc94516f3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: false
    }
  }
};

export default config;