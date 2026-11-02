import type { BookingRequest } from './booking';

/** Business rules of a booking request (mirror of the OpenAPI CreateBookingRequest schema). */
export const BOOKING_RULES = {
  minHours: 1,
  maxHours: 3,
  /** Shown before confirming; the API returns the real amounts (business_settings.deposit_percent). */
  defaultDepositPercent: 50,
} as const;

export type BookingRuleViolation = 'slot-in-the-past' | 'not-on-the-hour' | 'invalid-hours';

/** Returns the first broken rule, or null when the request can be sent to the API. */
export function bookingRuleViolation(request: BookingRequest, now: Date): BookingRuleViolation | null {
  const start = new Date(request.startsAt);
  if (
    !Number.isInteger(request.hours) ||
    request.hours < BOOKING_RULES.minHours ||
    request.hours > BOOKING_RULES.maxHours
  ) {
    return 'invalid-hours';
  }
  if (start.getUTCMinutes() !== 0 || start.getUTCSeconds() !== 0) return 'not-on-the-hour';
  if (start.getTime() <= now.getTime()) return 'slot-in-the-past';
  return null;
}

/** Estimated total and deposit shown on the confirmation screen. */
/** Total and deposit of a booking, in COP. */
export interface BookingAmounts {
  readonly total: number;
  readonly deposit: number;
}

export function estimateAmounts(
  hourlyPrice: number,
  hours: number,
  depositPercent: number = BOOKING_RULES.defaultDepositPercent,
): BookingAmounts {
  const total = hourlyPrice * hours;
  return { total, deposit: Math.round((total * depositPercent) / 100) };
}
