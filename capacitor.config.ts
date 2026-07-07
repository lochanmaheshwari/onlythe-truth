import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onlythetruth.app',
  appName: 'Only The Truth',
  webDir: 'out',
  // Match the app's warm cream theme so there is no white flash on launch.
  backgroundColor: '#f4ede3',
  ios: {
    // Safe areas are handled in CSS via env(safe-area-inset-*).
    contentInset: 'never',
    scrollEnabled: true,
  },
};

export default config;
