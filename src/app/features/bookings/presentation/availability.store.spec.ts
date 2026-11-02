import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { FakeBookingsRepository, FixedClock } from '../../../../testing/fake-bookings.repository';
import { Clock } from '../domain/clock';
import { GetAvailabilityUseCase } from '../domain/get-availability.usecase';

import { AvailabilityStore } from './availability.store';

// State holder of HU-03: one test per screen state.
describe('AvailabilityStore', () => {
  let repository: FakeBookingsRepository;
  let store: AvailabilityStore;

  beforeEach(() => {
    repository = new FakeBookingsRepository();
    TestBed.configureTestingModule({
      providers: [
        AvailabilityStore,
        { provide: GetAvailabilityUseCase, useValue: new GetAvailabilityUseCase(repository) },
        { provide: Clock, useValue: new FixedClock('2026-11-05T08:00:00-05:00') },
      ],
    });
    store = TestBed.inject(AvailabilityStore);
  });

  it('load_freeSlots_isLoadedWithOneRowPerHour', async () => {
    repository.availability = {
      date: '2026-11-05',
      fields: [
        {
          fieldId: 1,
          name: 'Cancha 5A',
          hourlyPrice: 70000,
          slots: [
            { startsAt: '2026-11-05T18:00:00-05:00', available: false },
            { startsAt: '2026-11-05T19:00:00-05:00', available: true },
          ],
        },
      ],
    };

    await store.load();

    const view = store.view();
    expect(view.status).toBe('loaded');
    expect(view.status === 'loaded' && view.rows.map((r) => r.cells[0].available)).toEqual([false, true]);
  });

  it('load_noFreeSlots_isEmpty', async () => {
    await store.load();

    expect(store.view().status).toBe('empty');
  });

  it('load_withoutConnection_isOffline', async () => {
    repository.failWith = { kind: 'network' };

    await store.load();

    expect(store.view().status).toBe('offline');
  });

  it('load_serverError_isErrorWithSpanishMessage', async () => {
    repository.failWith = { kind: 'unknown' };

    await store.load();

    expect(store.view()).toEqual({ status: 'error', message: 'Algo salió mal. Inténtalo de nuevo.' });
  });

  it('dates_startToday_sevenDays', () => {
    expect(store.dates).toHaveLength(7);
    expect(store.dates[0]).toBe('2026-11-05');
  });
});
