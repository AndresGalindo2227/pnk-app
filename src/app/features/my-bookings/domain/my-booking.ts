/** Summary of a booking in "Mis reservas" (HU-05). Amounts in COP. */
export interface MyBooking {
  readonly id: number;
  readonly code: string;
  readonly fieldName: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  readonly depositAmount: number;
  readonly totalAmount: number;
  /** Status of the last receipt; optional so copies cached by v0.1 still load. */
  readonly paymentStatus?: 'pending' | 'approved' | 'rejected' | null;
}

export type BookingScope = 'upcoming' | 'past';

/** Result of loading the list: fresh from the API, or the last saved copy when offline. */
export interface MyBookingsResult {
  readonly items: readonly MyBooking[];
  readonly savedAt: string;
  readonly isStale: boolean;
}
