import { Injectable } from '@angular/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

import { TokenStore } from './token-store';

const REFRESH_TOKEN_KEY = 'pnk.auth.refreshToken.v1';

/** Refresh token in the platform keystore (Android Keystore / iOS Keychain). Never in Preferences. */
@Injectable()
export class SecureTokenStore extends TokenStore {
  async getRefreshToken(): Promise<string | null> {
    const value = await SecureStorage.get(REFRESH_TOKEN_KEY);
    return typeof value === 'string' ? value : null;
  }

  async setRefreshToken(token: string): Promise<void> {
    await SecureStorage.set(REFRESH_TOKEN_KEY, token);
  }

  async clear(): Promise<void> {
    await SecureStorage.remove(REFRESH_TOKEN_KEY);
  }
}
