/**
 * Typed error used by every layer above the network.
 * Pages and stores never read HttpErrorResponse: the error interceptor maps it to AppError.
 * See pnk-docs/02-code-and-ui/coding-standards.md
 */
export type AppError =
  | { readonly kind: 'network' }
  | { readonly kind: 'unauthorized'; readonly code: string }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'conflict'; readonly code: string }
  | { readonly kind: 'validation'; readonly fields: readonly string[] }
  | { readonly kind: 'rate-limited' }
  | { readonly kind: 'unknown' };

export function isAppError(value: unknown): value is AppError {
  return typeof value === 'object' && value !== null && 'kind' in value;
}

/** Stable code used to look up the user message in error-messages.es.ts. */
export function errorCodeOf(error: unknown): string {
  if (!isAppError(error)) return 'UNKNOWN';
  switch (error.kind) {
    case 'network':
      return 'NETWORK';
    case 'unauthorized':
    case 'conflict':
      return error.code;
    case 'not-found':
      return 'NOT_FOUND';
    case 'validation':
      return 'VALIDATION_ERROR';
    case 'rate-limited':
      return 'TOO_MANY_REQUESTS';
    default:
      return 'UNKNOWN';
  }
}
