import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { catchError, retry, throwError, timer } from 'rxjs';

import type { AppError } from './app-error';

const MAX_GET_RETRIES = 2;

/**
 * 1. Retries GET requests on transient failures (no network, timeout, 5xx) with
 *    exponential backoff: 1 s, then 2 s. POST/PUT are never retried automatically.
 * 2. Maps whatever is left to an AppError, so the rest of the app never sees HTTP details.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    retry({
      count: req.method === 'GET' ? MAX_GET_RETRIES : 0,
      delay: (error: unknown, attempt: number): Observable<number> =>
        isTransient(error) ? timer(1000 * 2 ** (attempt - 1)) : throwError(() => error),
    }),
    catchError((error: unknown) => throwError(() => toAppError(error))),
  );

function isTransient(error: unknown): boolean {
  if (error instanceof HttpErrorResponse) return error.status === 0 || error.status >= 500;
  return error instanceof Error && error.name === 'TimeoutError';
}

function toAppError(error: unknown): AppError {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error && error.name === 'TimeoutError' ? { kind: 'network' } : { kind: 'unknown' };
  }
  const code: string = error.error?.code ?? 'UNKNOWN';
  switch (error.status) {
    case 0:
      return { kind: 'network' };
    case 401:
      return { kind: 'unauthorized', code };
    case 403:
      return { kind: 'forbidden' };
    case 404:
      return { kind: 'not-found' };
    case 409:
      return { kind: 'conflict', code };
    case 422:
      return {
        kind: 'validation',
        fields: (error.error?.details ?? []).map((d: { field: string }) => d.field),
      };
    case 429:
      return { kind: 'rate-limited' };
    default:
      return { kind: 'unknown' };
  }
}
