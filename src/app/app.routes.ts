import type { Routes } from '@angular/router';

import { authGuard } from './core/session/auth.guard';
import { guestGuard } from './core/session/guest.guard';
import { provideAuth } from './features/auth/auth.providers';

/**
 * Single route table of pnk-app (ADR-002). Keep it in sync with
 * pnk-docs/01-architecture/navigation.md in the same pull request.
 */
export const routes: Routes = [
  {
    path: 'login',
    canMatch: [guestGuard],
    providers: [provideAuth()],
    loadComponent: () => import('./features/auth/presentation/login.page'),
  },
  {
    path: 'sign-up',
    canMatch: [guestGuard],
    providers: [provideAuth()],
    loadComponent: () => import('./features/auth/presentation/sign-up.page'),
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./core/shell/shell.page'),
    children: [
      { path: 'availability', loadComponent: () => import('./features/bookings/presentation/availability.page') },
      { path: 'my-bookings', loadComponent: () => import('./features/my-bookings/presentation/my-bookings.page') },
      { path: 'profile', loadComponent: () => import('./features/auth/presentation/profile.page') },
      { path: '', pathMatch: 'full', redirectTo: 'availability' },
    ],
  },
  { path: '**', redirectTo: 'availability' },
];
