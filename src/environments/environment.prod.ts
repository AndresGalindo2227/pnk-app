/**
 * Production environment (ng build --configuration production): PWA on Firebase Hosting,
 * signed release APK/AAB and the CI build.
 * pnk-api is published over HTTPS through an ngrok static domain (05-release/deployment.md);
 * the real domain (api.panenka.co) replaces it when the API moves to a hosting provider.
 */
export const environment = {
  production: true,
  appVersion: '0.1.0',
  apiBaseUrl: 'https://hangout-frown-salt.ngrok-free.dev/api/v1',
};
