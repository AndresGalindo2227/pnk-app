/**
 * Development environment.
 * `apiBaseUrl` points to the Prism mock server generated from the OpenAPI contract
 * (`npx @stoplight/prism-cli mock -d 03-api-and-data/openapi.yaml` in pnk-docs), so the app can be
 * built before pnk-api exists. Prism serves the contract paths at the root (no `/api/v1` prefix);
 * the real API keeps the `/api/v1` prefix (see environment.prod.ts and ADR-007).
 */
export const environment = {
  production: false,
  appVersion: '0.1.0',
  apiBaseUrl: 'http://localhost:4010',
};
