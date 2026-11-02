import { Injectable, inject, signal } from '@angular/core';

import { errorMessage } from '../../../core/i18n/error-messages.es';
import { errorCodeOf, isAppError } from '../../../core/network/app-error';
import { LoadMyBookingsUseCase } from '../domain/load-my-bookings.usecase';
import type { BookingScope, MyBooking } from '../domain/my-booking';

/** Screen states of HU-05. `stale` means the list comes from the device copy. */
export type MyBookingsView =
  | { readonly status: 'loading' }
  | {
      readonly status: 'loaded';
      readonly items: readonly MyBooking[];
      readonly savedAt: string;
      readonly stale: boolean;
    }
  | { readonly status: 'empty'; readonly stale: boolean }
  | { readonly status: 'offline' }
  | { readonly status: 'error'; readonly message: string };

@Injectable()
export class MyBookingsStore {
  private readonly loadBookings = inject(LoadMyBookingsUseCase);

  private readonly state = signal<MyBookingsView>({ status: 'loading' });
  private readonly currentScope = signal<BookingScope>('upcoming');

  readonly view = this.state.asReadonly();
  readonly scope = this.currentScope.asReadonly();

  async setScope(scope: BookingScope): Promise<void> {
    this.currentScope.set(scope);
    await this.load();
  }

  /** Shows the saved copy at once (if any), then replaces it with the API answer. */
  async load(): Promise<void> {
    const scope = this.currentScope();
    const cached = await this.loadBookings.cached(scope);
    this.state.set(cached ? toView(cached.items, cached.savedAt, true) : { status: 'loading' });

    try {
      const result = await this.loadBookings.execute(scope);
      this.state.set(toView(result.items, result.savedAt, result.isStale));
    } catch (error) {
      if (cached) return; // keep showing the saved copy with its "stale" banner
      this.state.set(
        isAppError(error) && error.kind === 'network'
          ? { status: 'offline' }
          : { status: 'error', message: errorMessage(errorCodeOf(error)) },
      );
    }
  }
}

function toView(items: readonly MyBooking[], savedAt: string, stale: boolean): MyBookingsView {
  return items.length === 0 ? { status: 'empty', stale } : { status: 'loaded', items, savedAt, stale };
}
