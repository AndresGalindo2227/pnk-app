import type { SessionTokens } from '../../../core/session/session.model';

import type { Credentials, SignUpData } from './credentials';

/** Port implemented by the data layer (AuthHttpRepository). */
export abstract class AuthRepository {
  abstract login(credentials: Credentials): Promise<SessionTokens>;
  abstract register(data: SignUpData): Promise<SessionTokens>;
}
