import type { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

/**
 * Adds the headers every request to pnk-api carries:
 * - X-App-Version: lets the API apply the minimum app version policy (ADR-007).
 * - X-Request-Id: correlates a client error with the API logs without logging personal data.
 * - ngrok-skip-browser-warning: only while the API is published through an ngrok free domain,
 *   which otherwise answers browser requests with an HTML warning page instead of the API.
 */
const NGROK_HEADERS: Record<string, string> = environment.apiBaseUrl.includes('.ngrok')
  ? { 'ngrok-skip-browser-warning': 'true' }
  : {};

export const headersInterceptor: HttpInterceptorFn = (req, next) =>
  next(
    req.clone({
      setHeaders: {
        Accept: 'application/json',
        'X-App-Version': environment.appVersion,
        'X-Request-Id': crypto.randomUUID(),
        ...NGROK_HEADERS,
      },
    }),
  );
