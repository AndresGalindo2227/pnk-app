/**
 * Label shown to the player for a booking (used by "Detalle" and "Mis reservas").
 * A pending booking has three payment moments:
 * no receipt yet (pending), receipt sent and waiting for PANENKA (in_review),
 * or receipt rejected (rejected: the player must send another one).
 */
export type BookingBadge = 'pending' | 'in_review' | 'rejected' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

/** The two fields of a booking that decide its label. */
export interface BadgeSource {
  readonly status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  readonly paymentStatus?: 'pending' | 'approved' | 'rejected' | null;
}

export function badgeOf(booking: BadgeSource): BookingBadge {
  if (booking.status !== 'pending') return booking.status;
  if (booking.paymentStatus === 'pending') return 'in_review';
  if (booking.paymentStatus === 'rejected') return 'rejected';
  return 'pending';
}

/** True while the player still has to send the transfer receipt (HU-09). */
export function needsReceipt(booking: BadgeSource): boolean {
  return booking.status === 'pending' && booking.paymentStatus !== 'pending';
}

/** Ionic color of each label. */
export const BADGE_COLOR: Readonly<Record<BookingBadge, string>> = {
  pending: 'warning',
  in_review: 'tertiary',
  rejected: 'danger',
  confirmed: 'success',
  cancelled: 'medium',
  completed: 'medium',
  no_show: 'danger',
};
