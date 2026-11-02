import type { Provider } from '@angular/core';

import { AuthHttpRepository } from './data/auth-http.repository';
import { AuthRepository } from './domain/auth.repository';
import { LoginUseCase } from './domain/login.usecase';
import { SignUpUseCase } from './domain/sign-up.usecase';

/** Composition of the auth feature: the only place that knows which adapter implements the port. */
export function provideAuth(): Provider[] {
  return [
    { provide: AuthRepository, useClass: AuthHttpRepository },
    { provide: LoginUseCase, useFactory: (repo: AuthRepository) => new LoginUseCase(repo), deps: [AuthRepository] },
    { provide: SignUpUseCase, useFactory: (repo: AuthRepository) => new SignUpUseCase(repo), deps: [AuthRepository] },
  ];
}
