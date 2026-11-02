import { Injectable, inject, signal } from '@angular/core';

import { errorMessage } from '../../../core/i18n/error-messages.es';
import { errorCodeOf, isAppError } from '../../../core/network/app-error';
import type { DayAvailability } from '../domain/availability';
import { hasNoFreeSlots } from '../domain/availability';
import { Clock } from '../domain/clock';
import { GetAvailabilityUseCase, upcomingDates } from '../domain/get-availability.usecase';

/** One hour of the grid: one cell per field. */
export interface AvailabilityRow {
  readonly startsAt: string;
  readonly cells: readonly { readonly fieldId: number; readonly startsAt: string; readonly available: boolean }[];
}

/** The five screen states of HU-03 (ADR-001). */
export type AvailabilityView =
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly day: DayAvailability; readonly rows: readonly AvailabilityRow[] }
  | { readonly status: 'empty' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'offline' };

const DAYS_IN_SELECTOR = 7;

@Injectable()
export class AvailabilityStore {
  private readonly getAvailability = inject(GetAvailabilityUseCase);
  private readonly clock = inject(Clock);

  private readonly state = signal<AvailabilityView>({ status: 'loading' });
  private readonly date = signal<string>(upcomingDates(this.clock.now(), 1)[0]);

  readonly view = this.state.asReadonly();
  readonly selectedDate = this.date.asReadonly();
  readonly dates = upcomingDates(this.clock.now(), DAYS_IN_SELECTOR);

  async select(date: string): Promise<void> {
    this.date.set(date);
    await this.load();
  }

  async load(): Promise<void> {
    this.state.set({ status: 'loading' });
    try {
      const day = await this.getAvailability.execute(this.date());
      this.state.set(hasNoFreeSlots(day) ? { status: 'empty' } : { status: 'loaded', day, rows: toRows(day) });
    } catch (error) {
      this.state.set(
        isAppError(error) && error.kind === 'network'
          ? { status: 'offline' }
          : { status: 'error', message: errorMessage(errorCodeOf(error)) },
      );
    }
  }
}

/** Turns "fields with slots" into "hours with one cell per field" for the grid. */
function toRows(day: DayAvailability): AvailabilityRow[] {
  const hours = [...new Set(day.fields.flatMap((f) => f.slots.map((s) => s.startsAt)))].sort();
  return hours.map((startsAt) => ({
    startsAt,
    cells: day.fields.map((field) => ({
      fieldId: field.fieldId,
      startsAt,
      available: field.slots.find((s) => s.startsAt === startsAt)?.available ?? false,
    })),
  }));
}
