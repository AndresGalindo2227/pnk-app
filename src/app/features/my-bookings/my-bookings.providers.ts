import type { Provider } from '@angular/core';

import { MyBookingsHttpRemote } from './data/my-bookings-http.remote';
import { MyBookingsPreferencesCache } from './data/my-bookings-preferences.cache';
import { LoadMyBookingsUseCase } from './domain/load-my-bookings.usecase';
import { MyBookingsCache, MyBookingsRemote } from './domain/my-bookings.ports';

/** Composition of the my-bookings feature. */
export function provideMyBookings(): Provider[] {
  return [
    { provide: MyBookingsRemote, useClass: MyBookingsHttpRemote },
    { provide: MyBookingsCache, useClass: MyBookingsPreferencesCache },
    {
      provide: LoadMyBookingsUseCase,
      useFactory: (remote: MyBookingsRemote, cache: MyBookingsCache) => new LoadMyBookingsUseCase(remote, cache),
      deps: [MyBookingsRemote, MyBookingsCache],
    },
  ];
}
