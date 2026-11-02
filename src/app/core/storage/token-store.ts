/**
 * Port: where the session tokens are kept on the device.
 * Implementations: SecureTokenStore (Android Keystore / iOS Keychain) and, on the PWA,
 * MemoryTokenStore (the refresh token is not persisted in the browser). See ADR-008.
 */
export abstract class TokenStore {
  abstract getRefreshToken(): Promise<string | null>;
  abstract setRefreshToken(token: string): Promise<void>;
  abstract clear(): Promise<void>;
}
