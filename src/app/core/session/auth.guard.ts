import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { Router } from '@angular/router';

import { SessionService } from './session.service';

/** Protected routes: without a session the page is not even loaded (canMatch). See ADR-002. */
export const authGuard: CanMatchFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return (await session.restore()) ? true : router.createUrlTree(['/login']);
};
