import type { Booking, BookingRequest } from './booking';
import { bookingRuleViolation } from './booking-rules';
import type { BookingsRepository } from './bookings.repository';
import type { Clock } from './clock';

/**
 * HU-04: book a slot. Local rules are checked first; the sector rule (5A blocks 9) is enforced by
 * the database and arrives as a 409 SLOT_ALREADY_TAKEN conflict (ADR-004).
 */
export class CreateBookingUseCase {
  constructor(
    private readonly repository: BookingsRepository,
    private readonly clock: Clock,
  ) {}

  async execute(request: BookingRequest, idempotencyKey: string): Promise<Booking> {
    const violation = bookingRuleViolation(request, this.clock.now());
    if (violation) {
      throw { kind: 'validation', fields: [violation] };
    }
    return this.repository.create(request, idempotencyKey);
  }
}
