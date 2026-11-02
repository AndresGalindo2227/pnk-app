import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { SessionTokens } from '../../../core/session/session.model';
import { AuthRepository } from '../domain/auth.repository';
import type { Credentials, SignUpData } from '../domain/credentials';

import type { AuthSessionDto } from './auth-session.dto';

/** Adapter: implements the AuthRepository port with pnk-api (POST /auth/login, /auth/register). */
@Injectable()
export class AuthHttpRepository extends AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async login(credentials: Credentials): Promise<SessionTokens> {
    return toSession(await firstValueFrom(this.http.post<AuthSessionDto>(`${this.baseUrl}/auth/login`, credentials)));
  }

  async register(data: SignUpData): Promise<SessionTokens> {
    return toSession(await firstValueFrom(this.http.post<AuthSessionDto>(`${this.baseUrl}/auth/register`, data)));
  }
}

function toSession(dto: AuthSessionDto): SessionTokens {
  return { accessToken: dto.accessToken, refreshToken: dto.refreshToken, player: { ...dto.player } };
}
