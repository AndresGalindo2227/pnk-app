import type { DayAvailability } from './availability';
import type { Booking, BookingRequest } from './booking';
import type { Field } from './field';

/** Port implemented by the data layer (BookingsHttpRepository). */
export abstract class BookingsRepository {
  abstract getFields(): Promise<readonly Field[]>;
  abstract getAvailability(date: string): Promise<DayAvailability>;
  /** `idempotencyKey` is reused when the player retries the same attempt, so the API never books twice. */
  abstract create(request: BookingRequest, idempotencyKey: string): Promise<Booking>;
  abstract getById(id: number): Promise<Booking>;
  abstract cancel(id: number): Promise<Booking>;
}
