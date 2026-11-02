import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, finalize, from, map, of, shareReplay, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TokenStore } from '../storage/token-store';

import type { SessionPlayer, SessionTokens } from './session.model';

interface AuthSessionDto {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  player: SessionPlayer;
}

/**
 * Holds the current session.
 * - Access token: in memory only (15 min).
 * - Refresh token: in the TokenStore (secure storage on the device).
 * - refresh(): concurrent callers share ONE in-flight request.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly tokenStore = inject(TokenStore);

  private readonly token = signal<string | null>(null);
  private readonly currentPlayer = signal<SessionPlayer | null>(null);
  private refreshInFlight$: Observable<string> | null = null;

  readonly player = this.currentPlayer.asReadonly();
  readonly isAuthenticated = computed(() => this.token() !== null);

  accessToken(): string | null {
    return this.token();
  }

  /** Saves a new session after login, sign-up or refresh (refresh tokens rotate). */
  async start(session: SessionTokens): Promise<void> {
    await this.tokenStore.setRefreshToken(session.refreshToken);
    this.token.set(session.accessToken);
    this.currentPlayer.set(session.player);
  }

  /** Called by the guards on app start: tries to rebuild the session from the stored refresh token. */
  async restore(): Promise<boolean> {
    if (this.isAuthenticated()) return true;
    const stored = await this.tokenStore.getRefreshToken();
    if (!stored) return false;
    try {
      await new Promise<void>((resolve, reject) => this.refresh().subscribe({ next: () => resolve(), error: reject }));
      return true;
    } catch {
      await this.clear();
      return false;
    }
  }

  /** Exchanges the refresh token for a new pair. Concurrent calls share the same request. */
  refresh(): Observable<string> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = from(this.tokenStore.getRefreshToken()).pipe(
        switchMap((refreshToken) =>
          refreshToken
            ? this.http.post<AuthSessionDto>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken })
            : throwError(() => ({ kind: 'unauthorized', code: 'SESSION_EXPIRED' })),
        ),
        switchMap((dto) => from(this.start(dto)).pipe(map(() => dto.accessToken))),
        finalize(() => (this.refreshInFlight$ = null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.refreshInFlight$;
  }

  /** Closes the session locally: tokens and player are removed. */
  async clear(): Promise<void> {
    this.token.set(null);
    this.currentPlayer.set(null);
    await this.tokenStore.clear();
  }

  /** Revokes the refresh token on the server (best effort) and clears the local session. */
  logout(): Observable<void> {
    return from(this.tokenStore.getRefreshToken()).pipe(
      switchMap((refreshToken) => this.http.post<void>(`${environment.apiBaseUrl}/auth/logout`, { refreshToken })),
      catchError(() => of(undefined)),
      finalize(() => void this.clear()),
    );
  }
}
