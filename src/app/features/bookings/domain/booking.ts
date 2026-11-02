export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | null;

/** A booking of the logged-in player. Amounts are integers of COP. */
export interface Booking {
  readonly id: number;
  readonly code: string;
  readonly fieldId: number;
  readonly fieldName: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: BookingStatus;
  readonly totalAmount: number;
  readonly depositAmount: number;
  readonly paymentStatus: PaymentStatus;
  readonly canCancel: boolean;
}

/** What the player asks for when booking (HU-04). */
export interface BookingRequest {
  readonly fieldId: number;
  readonly startsAt: string;
  readonly hours: number;
}
