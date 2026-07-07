// Central runtime config for the web app and the Capacitor mobile shell.

// Where the scanner posts /api/analyze from inside the native app.
// On the web this stays '' (same-origin). In the Capacitor WebView there is
// no server, so requests go to the hosted backend. Override at build time:
//   NEXT_PUBLIC_API_BASE=https://your-deployment.example npm run build:mobile
export const MOBILE_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://192.168.0.176:3000';

export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && Boolean((window as unknown as { Capacitor?: unknown }).Capacitor);
}

export function apiBase(): string {
  return isNativeApp() ? MOBILE_API_BASE : '';
}
