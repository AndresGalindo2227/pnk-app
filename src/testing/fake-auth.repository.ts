import type { SessionTokens } from '../app/core/session/session.model';
import { AuthRepository } from '../app/features/auth/domain/auth.repository';
import type { Credentials, SignUpData } from '../app/features/auth/domain/credentials';

/** Hand-written test double: records calls and returns a fixed session. No HTTP, no Angular. */
export class FakeAuthRepository extends AuthRepository {
  readonly registerCalls: SignUpData[] = [];
  readonly loginCalls: Credentials[] = [];

  readonly session: SessionTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    player: { id: 1, fullName: 'Demo Player', email: 'demo@example.com', phone: '3101234567', role: 'player' },
  };

  async login(credentials: Credentials): Promise<SessionTokens> {
    this.loginCalls.push(credentials);
    return this.session;
  }

  async register(data: SignUpData): Promise<SessionTokens> {
    this.registerCalls.push(data);
    return this.session;
  }
}
