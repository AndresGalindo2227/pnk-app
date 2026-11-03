/**
 * Build configuration "device" (npx ng build --configuration device):
 * the Android app talks to pnk-api running on the developer PC in the same WiFi network.
 * The IP is the PC address in the local network (ipconfig -> IPv4). If the router gives the PC
 * another IP, update it here and rebuild. Production uses HTTPS (environment.prod.ts).
 */
export const environment = {
  production: true,
  appVersion: '0.1.0',
  apiBaseUrl: 'http://192.168.1.24:8000/api/v1',
};
