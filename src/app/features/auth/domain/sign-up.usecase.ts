import type { SessionTokens } from '../../../core/session/session.model';

import type { AuthRepository } from './auth.repository';
import type { SignUpData } from './credentials';
import { invalidSignUpFields } from './sign-up-rules';

/**
 * HU-01: create an account. Validates locally first, so an invalid form never reaches the API.
 * Plain class (no Angular): wired with DI in auth.providers.ts and unit-tested with a fake repository.
 */
export class SignUpUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(data: SignUpData): Promise<SessionTokens> {
    const normalized: SignUpData = { ...data, email: data.email.trim().toLowerCase(), fullName: data.fullName.trim() };
    const invalid = invalidSignUpFields(normalized);
    if (invalid.length > 0) {
      throw { kind: 'validation', fields: invalid };
    }
    return this.repository.register(normalized);
  }
}
