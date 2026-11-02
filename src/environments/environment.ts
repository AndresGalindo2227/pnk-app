/**
 * Development environment.
 * `apiBaseUrl` points to pnk-api running locally:  php -S 0.0.0.0:8000 -t public  (in pnk-api).
 * To work without the backend, run the Prism mock of the contract in pnk-docs
 * (`npx @stoplight/prism-cli mock 03-api-and-data/openapi.yaml`) and use 'http://localhost:4010':
 * Prism serves the contract paths at the root, without the /api/v1 prefix (ADR-007).
 */
export const environment = {
  production: false,
  appVersion: '0.1.0',
  apiBaseUrl: 'http://localhost:8000/api/v1',
};
