import type { Booking } from './booking';
import type { BookingsRepository } from './bookings.repository';

/**
 * HU-06: cancel a booking. The server decides with the cancellation window (3 hours) and answers
 * 409 CANCELLATION_WINDOW_CLOSED when it is too late; the app only offers the button when `canCancel`.
 */
export class CancelBookingUseCase {
  constructor(private readonly repository: BookingsRepository) {}

  async execute(booking: Booking): Promise<Booking> {
    if (!booking.canCancel) {
      throw { kind: 'conflict', code: 'CANCELLATION_WINDOW_CLOSED' };
    }
    return this.repository.cancel(booking.id);
  }
}
