import { Injectable, computed, inject, signal } from '@angular/core';

import { errorMessage } from '../../../core/i18n/error-messages.es';
import { errorCodeOf, isAppError } from '../../../core/network/app-error';
import { SessionService } from '../../../core/session/session.service';
import type { Credentials, SignUpData } from '../domain/credentials';
import { LoginUseCase } from '../domain/login.usecase';
import { SignUpUseCase } from '../domain/sign-up.usecase';

/** Immutable state of the login and sign-up screens (ADR-001: one store per feature). */
export type AuthFormState =
  | { readonly status: 'idle' }
  | { readonly status: 'submitting' }
  | { readonly status: 'error'; readonly message: string; readonly fields: readonly string[] };

@Injectable()
export class AuthStore {
  private readonly login = inject(LoginUseCase);
  private readonly signUp = inject(SignUpUseCase);
  private readonly session = inject(SessionService);

  private readonly state = signal<AuthFormState>({ status: 'idle' });

  readonly view = this.state.asReadonly();
  readonly isSubmitting = computed(() => this.state().status === 'submitting');

  /** Returns true when the session started, so the page can navigate. */
  async submitLogin(credentials: Credentials): Promise<boolean> {
    return this.run(() => this.login.execute(credentials));
  }

  async submitSignUp(data: SignUpData): Promise<boolean> {
    return this.run(() => this.signUp.execute(data));
  }

  private async run(action: () => ReturnType<LoginUseCase['execute']>): Promise<boolean> {
    if (this.isSubmitting()) return false;
    this.state.set({ status: 'submitting' });
    try {
      await this.session.start(await action());
      this.state.set({ status: 'idle' });
      return true;
    } catch (error) {
      const fields = isAppError(error) && error.kind === 'validation' ? error.fields : [];
      this.state.set({ status: 'error', message: errorMessage(errorCodeOf(error)), fields });
      return false;
    }
  }
}
