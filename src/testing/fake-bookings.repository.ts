import type { DayAvailability } from '../app/features/bookings/domain/availability';
import type { Booking, BookingRequest } from '../app/features/bookings/domain/booking';
import { BookingsRepository } from '../app/features/bookings/domain/bookings.repository';
import { Clock } from '../app/features/bookings/domain/clock';
import type { Field } from '../app/features/bookings/domain/field';
import type { MatchReminder } from '../app/features/bookings/domain/reminder.port';
import { ReminderPort } from '../app/features/bookings/domain/reminder.port';

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

  /** What getAvailability answers; set `failWith` to simulate an error such as { kind: 'network' }. */
  availability: DayAvailability | null = null;
  failWith: unknown = null;

  async getAvailability(date: string): Promise<DayAvailability> {
    if (this.failWith) throw this.failWith;
    return this.availability ?? { date, fields: [] };
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

  async getCached(): Promise<Booking | null> {
    return null;
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

/** Notifications double: records reminders; set `permission` to simulate a denied permission. */
export class FakeReminderPort extends ReminderPort {
  permission: 'granted' | 'denied' = 'granted';
  readonly scheduled: MatchReminder[] = [];

  async schedule(reminder: MatchReminder): Promise<'scheduled' | 'permission-denied'> {
    if (this.permission === 'denied') return 'permission-denied';
    this.scheduled.push(reminder);
    return 'scheduled';
  }

  async cancel(): Promise<void> {
    return;
  }
}
