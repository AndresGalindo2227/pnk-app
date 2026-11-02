import type { DayAvailability } from '../app/features/bookings/domain/availability';
import type { Booking, BookingRequest } from '../app/features/bookings/domain/booking';
import { BookingsRepository } from '../app/features/bookings/domain/bookings.repository';
import { Clock } from '../app/features/bookings/domain/clock';
import type { Field } from '../app/features/bookings/domain/field';

/** Hand-written test double of the bookings port: records calls, no HTTP, no Angular. */
export class FakeBookingsRepository extends BookingsRepository {
  readonly createCalls: { request: BookingRequest; key: string }[] = [];
  readonly cancelCalls: number[] = [];

  readonly booking: Booking = {
    id: 87,
    code: 'PNK-2611-0087',
    fieldId: 2,
    fieldName: 'Cancha 5B',
    startsAt: '2026-11-05T19:00:00-05:00',
    endsAt: '2026-11-05T20:00:00-05:00',
    status: 'pending',
    totalAmount: 70000,
    depositAmount: 35000,
    paymentStatus: null,
    canCancel: true,
  };

  async getFields(): Promise<readonly Field[]> {
    return [];
  }

  async getAvailability(date: string): Promise<DayAvailability> {
    return { date, fields: [] };
  }

  async create(request: BookingRequest, key: string): Promise<Booking> {
    this.createCalls.push({ request, key });
    return this.booking;
  }

  async getById(): Promise<Booking> {
    return this.booking;
  }

  async cancel(id: number): Promise<Booking> {
    this.cancelCalls.push(id);
    return { ...this.booking, status: 'cancelled', canCancel: false };
  }
}

/** Clock frozen at a given instant, so "slot in the past" is deterministic. */
export class FixedClock extends Clock {
  constructor(private readonly instant: string) {
    super();
  }

  now(): Date {
    return new Date(this.instant);
  }
}
