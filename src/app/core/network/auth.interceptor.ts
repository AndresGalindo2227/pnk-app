import type { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { SessionService } from '../session/session.service';

import { isAppError } from './app-error';

/** Endpoints that never carry the access token (see the OpenAPI contract). */
const PUBLIC_PATHS = [
  '/health',
  '/config',
  '/fields',
  '/availability',
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
];

/**
 * Attaches the access token and recovers from an expired one:
 * on 401 it refreshes the session ONCE (concurrent 401s share the same refresh)
 * and retries the original request. If that fails, the session is closed.
 * See pnk-docs/03-api-and-data/authentication.md
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPublic(req)) return next(req);

  const session = inject(SessionService);
  const router = inject(Router);

  return next(withToken(req, session.accessToken())).pipe(
    catchError((error: unknown) => {
      if (!isAppError(error) || error.kind !== 'unauthorized') return throwError(() => error);

      return session.refresh().pipe(
        switchMap((newToken) => next(withToken(req, newToken))),
        catchError((refreshError: unknown) =>
          from(session.clear()).pipe(
            switchMap(() => from(router.navigate(['/login'], { replaceUrl: true, queryParams: { expired: 1 } }))),
            switchMap(() => throwError(() => refreshError)),
          ),
        ),
      );
    }),
  );
};

function isPublic(req: HttpRequest<unknown>): boolean {
  return PUBLIC_PATHS.some((path) => new URL(req.url, 'http://local').pathname.endsWith(path));
}

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}
