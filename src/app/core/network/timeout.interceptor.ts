import type { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';

export const REQUEST_TIMEOUT_MS = 15_000;
export const UPLOAD_TIMEOUT_MS = 60_000;

/** No request waits forever: 15 s for JSON calls, 60 s for photo uploads (multipart). */
export const timeoutInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(timeout(req.body instanceof FormData ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS));
