import type { BookingScope, MyBooking } from '../app/features/my-bookings/domain/my-booking';
import { MyBookingsCache, MyBookingsRemote } from '../app/features/my-bookings/domain/my-bookings.ports';

export const SAMPLE_BOOKING: MyBooking = {
  id: 87,
  code: 'PNK-2611-0087',
  fieldName: 'Cancha 5B',
  startsAt: '2026-11-07T22:00:00-05:00',
  endsAt: '2026-11-07T23:00:00-05:00',
  status: 'pending',
  depositAmount: 35000,
  totalAmount: 70000,
};

/** Remote double: returns a list, or fails with the given error (e.g. { kind: 'network' }). */
export class FakeMyBookingsRemote extends MyBookingsRemote {
  failWith: unknown = null;

  async list(): Promise<readonly MyBooking[]> {
    if (this.failWith) throw this.failWith;
    return [SAMPLE_BOOKING];
  }
}

/** In-memory cache double. */
export class InMemoryMyBookingsCache extends MyBookingsCache {
  readonly saved = new Map<BookingScope, { items: readonly MyBooking[]; savedAt: string }>();

  async read(scope: BookingScope): Promise<{ items: readonly MyBooking[]; savedAt: string } | null> {
    return this.saved.get(scope) ?? null;
  }

  async write(scope: BookingScope, items: readonly MyBooking[]): Promise<void> {
    this.saved.set(scope, { items, savedAt: '2026-11-02T10:00:00-05:00' });
  }
}
