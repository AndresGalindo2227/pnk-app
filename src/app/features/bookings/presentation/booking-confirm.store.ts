import { Injectable, computed, inject, signal } from '@angular/core';

import { errorMessage } from '../../../core/i18n/error-messages.es';
import { errorCodeOf, isAppError } from '../../../core/network/app-error';
import type { Booking } from '../domain/booking';
import { BOOKING_RULES, estimateAmounts } from '../domain/booking-rules';
import { BookingsRepository } from '../domain/bookings.repository';
import { CreateBookingUseCase } from '../domain/create-booking.usecase';
import type { Field } from '../domain/field';
import type { ReminderResult } from '../domain/reminder.port';
import { ScheduleReminderUseCase } from '../domain/schedule-reminder.usecase';

/** States of the confirmation screen (HU-04). `taken` is the 409 SLOT_ALREADY_TAKEN case. */
export type ConfirmView =
  | { readonly status: 'loading' }
  | { readonly status: 'ready' }
  | { readonly status: 'submitting' }
  | { readonly status: 'taken'; readonly message: string }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'done'; readonly booking: Booking; readonly reminder: ReminderResult };

@Injectable()
export class BookingConfirmStore {
  private readonly repository = inject(BookingsRepository);
  private readonly createBooking = inject(CreateBookingUseCase);
  private readonly scheduleReminder = inject(ScheduleReminderUseCase);

  private readonly state = signal<ConfirmView>({ status: 'loading' });
  private readonly selectedField = signal<Field | null>(null);
  private readonly selectedHours = signal<number>(BOOKING_RULES.minHours);
  /** One key per booking attempt: a retry after a network error reuses it, so the API never books twice. */
  private idempotencyKey = crypto.randomUUID();

  readonly view = this.state.asReadonly();
  readonly field = this.selectedField.asReadonly();
  readonly hours = this.selectedHours.asReadonly();
  readonly hourOptions = Array.from({ length: BOOKING_RULES.maxHours }, (_, i) => i + 1);
  readonly amounts = computed(() => estimateAmounts(this.selectedField()?.hourlyPrice ?? 0, this.selectedHours()));

  /** Starts a NEW booking attempt: clean state, 1 hour and a fresh idempotency key. */
  async init(fieldId: number): Promise<void> {
    this.state.set({ status: 'loading' });
    this.selectedField.set(null);
    this.selectedHours.set(BOOKING_RULES.minHours);
    this.idempotencyKey = crypto.randomUUID();
    try {
      const fields = await this.repository.getFields();
      const field = fields.find((f) => f.id === fieldId) ?? null;
      this.selectedField.set(field);
      this.state.set(field ? { status: 'ready' } : { status: 'error', message: errorMessage('NOT_FOUND') });
    } catch (error) {
      this.state.set({ status: 'error', message: errorMessage(errorCodeOf(error)) });
    }
  }

  setHours(hours: number): void {
    this.selectedHours.set(hours);
    this.idempotencyKey = crypto.randomUUID(); // a different request is a different attempt
  }

  async confirm(startsAt: string): Promise<void> {
    const field = this.selectedField();
    if (!field || this.state().status === 'submitting') return;
    this.state.set({ status: 'submitting' });
    try {
      const booking = await this.createBooking.execute(
        { fieldId: field.id, startsAt, hours: this.selectedHours() },
        this.idempotencyKey,
      );
      // HU-07: the notification permission is asked now, right after the first booking (just-in-time).
      // A failure here never undoes the booking.
      const reminder = await this.scheduleReminder.execute(booking).catch((): ReminderResult => 'permission-denied');
      this.state.set({ status: 'done', booking, reminder });
    } catch (error) {
      const code = errorCodeOf(error);
      if (isAppError(error) && error.kind === 'conflict' && code === 'SLOT_ALREADY_TAKEN') {
        this.state.set({ status: 'taken', message: errorMessage(code) });
      } else if (isAppError(error) && error.kind === 'validation' && error.fields.includes('slot-in-the-past')) {
        this.state.set({ status: 'error', message: errorMessage('SLOT_IN_THE_PAST') });
      } else {
        this.state.set({ status: 'error', message: errorMessage(code) });
      }
    }
  }
}
