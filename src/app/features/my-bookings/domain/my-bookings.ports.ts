import type { BookingScope, MyBooking } from './my-booking';

/** Port: the player's bookings from pnk-api (GET /bookings?scope=). */
export abstract class MyBookingsRemote {
  abstract list(scope: BookingScope): Promise<readonly MyBooking[]>;
}

/** Port: last copy saved on the device (read-through cache, ADR-004). */
export abstract class MyBookingsCache {
  abstract read(scope: BookingScope): Promise<{ items: readonly MyBooking[]; savedAt: string } | null>;
  abstract write(scope: BookingScope, items: readonly MyBooking[]): Promise<void>;
}
