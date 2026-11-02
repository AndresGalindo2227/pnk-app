import type { SessionTokens } from '../../../core/session/session.model';

import type { AuthRepository } from './auth.repository';
import type { Credentials } from './credentials';

/** Log in with email and password. The email is normalized before calling the API. */
export class LoginUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(credentials: Credentials): Promise<SessionTokens> {
    return this.repository.login({ email: credentials.email.trim().toLowerCase(), password: credentials.password });
  }
}
