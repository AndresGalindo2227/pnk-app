import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { PreloadAllModules, RouteReuseStrategy, provideRouter, withPreloading } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/network/auth.interceptor';
import { errorInterceptor } from './core/network/error.interceptor';
import { headersInterceptor } from './core/network/headers.interceptor';
import { timeoutInterceptor } from './core/network/timeout.interceptor';
import { MemoryTokenStore } from './core/storage/memory-token-store';
import { SecureTokenStore } from './core/storage/secure-token-store';
import { TokenStore } from './core/storage/token-store';

/**
 * Global composition root.
 * Interceptor order matters: requests flow top to bottom, responses bottom to top.
 * `timeoutInterceptor` is the innermost one so each attempt has its own 15 s limit and
 * `errorInterceptor` can retry a timed-out GET and map it to AppError.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: TokenStore, useClass: Capacitor.isNativePlatform() ? SecureTokenStore : MemoryTokenStore },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([headersInterceptor, authInterceptor, errorInterceptor, timeoutInterceptor])),
  ],
};
