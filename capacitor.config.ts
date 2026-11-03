import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration (see pnk-docs/05-release).
 *
 * Release (default): pnk-api is reached over HTTPS, so cleartext (plain HTTP) traffic is NOT allowed
 * (security-rules.md: HTTPS only).
 * LAN demo: `PNK_LAN=1 npx cap sync android` allows plain HTTP to reach the API on the developer PC
 * (php -S 0.0.0.0:8000), used together with `ng build --configuration device`.
 * The WebView keeps the http://localhost origin in both cases, so the API CORS list does not change.
 */
const lanDemo = process.env['PNK_LAN'] === '1';

const config: CapacitorConfig = {
  appId: 'co.panenka.booking',
  appName: 'PANENKA Booking',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: lanDemo,
  },
  plugins: {
    LocalNotifications: {
      iconColor: '#1B7F3B',
    },
  },
};

export default config;
