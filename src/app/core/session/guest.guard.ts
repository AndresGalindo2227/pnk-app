import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { Router } from '@angular/router';

import { SessionService } from './session.service';

/** Login and sign-up are only for guests: a logged-in player goes straight to availability. */
export const guestGuard: CanMatchFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return (await session.restore()) ? router.createUrlTree(['/availability']) : true;
};
