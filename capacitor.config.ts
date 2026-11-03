import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration (see pnk-docs/05-release).
 *
 * Classroom / LAN demo: pnk-api runs on the developer PC over plain HTTP
 * (php -S 0.0.0.0:8000), so the WebView uses the http scheme and cleartext traffic is allowed.
 * Production: the API is served over HTTPS, `androidScheme` goes back to 'https' and
 * `cleartext` is removed (security-rules.md: HTTPS only).
 */
const config: CapacitorConfig = {
  appId: 'co.panenka.booking',
  appName: 'PANENKA Booking',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      iconColor: '#1B7F3B',
    },
  },
};

export default config;
