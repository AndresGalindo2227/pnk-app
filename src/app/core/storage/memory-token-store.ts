import { Injectable } from '@angular/core';

import { TokenStore } from './token-store';

/**
 * PWA fallback: browsers have no keystore, so the refresh token lives only in memory and the
 * player logs in again after closing the tab. Documented trade-off in ADR-008.
 */
@Injectable()
export class MemoryTokenStore extends TokenStore {
  private refreshToken: string | null = null;

  async getRefreshToken(): Promise<string | null> {
    return this.refreshToken;
  }

  async setRefreshToken(token: string): Promise<void> {
    this.refreshToken = token;
  }

  async clear(): Promise<void> {
    this.refreshToken = null;
  }
}
