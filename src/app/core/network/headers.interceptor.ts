import type { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

/**
 * Adds the headers every request to pnk-api carries:
 * - X-App-Version: lets the API apply the minimum app version policy (ADR-007).
 * - X-Request-Id: correlates a client error with the API logs without logging personal data.
 */
export const headersInterceptor: HttpInterceptorFn = (req, next) =>
  next(
    req.clone({
      setHeaders: {
        Accept: 'application/json',
        'X-App-Version': environment.appVersion,
        'X-Request-Id': crypto.randomUUID(),
      },
    }),
  );
