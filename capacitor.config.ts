import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.outfitcanvas.app',
  appName: 'Outfit Canvas',
  webDir: 'dist',
  server: {
    // 1. Put your Vercel URL here
    url: 'https://outfitcanvas.com', 
    // 2. THIS FIXES THE CHROME ISSUE:
    allowNavigation: [
      'outfitcanvas.com',
      '*.outfitcanvas.com' // Allows any subdomains if needed
    ]
  }
};



export default config;
