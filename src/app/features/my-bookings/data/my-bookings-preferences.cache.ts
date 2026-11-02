import { Injectable, inject } from '@angular/core';

import { LocalCache } from '../../../core/storage/local-cache';
import type { BookingScope, MyBooking } from '../domain/my-booking';
import { MyBookingsCache } from '../domain/my-bookings.ports';

/** Adapter: keeps the last list per scope in Preferences (key pnk.cache.myBookings.<scope>.v1). */
@Injectable()
export class MyBookingsPreferencesCache extends MyBookingsCache {
  private readonly cache = inject(LocalCache);

  async read(scope: BookingScope): Promise<{ items: readonly MyBooking[]; savedAt: string } | null> {
    const entry = await this.cache.read<MyBooking[]>(key(scope));
    return entry ? { items: entry.value, savedAt: entry.savedAt } : null;
  }

  async write(scope: BookingScope, items: readonly MyBooking[]): Promise<void> {
    await this.cache.write(key(scope), items);
  }
}

function key(scope: BookingScope): string {
  return `myBookings.${scope}.v1`;
}
