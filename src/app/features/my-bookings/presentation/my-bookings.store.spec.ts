import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { FakeMyBookingsRemote, InMemoryMyBookingsCache, SAMPLE_BOOKING } from '../../../../testing/fake-my-bookings';
import { LoadMyBookingsUseCase } from '../domain/load-my-bookings.usecase';

import { MyBookingsStore } from './my-bookings.store';

// State holder of HU-05.
describe('MyBookingsStore', () => {
  let remote: FakeMyBookingsRemote;
  let cache: InMemoryMyBookingsCache;
  let store: MyBookingsStore;

  beforeEach(() => {
    remote = new FakeMyBookingsRemote();
    cache = new InMemoryMyBookingsCache();
    TestBed.configureTestingModule({
      providers: [
        MyBookingsStore,
        { provide: LoadMyBookingsUseCase, useValue: new LoadMyBookingsUseCase(remote, cache) },
      ],
    });
    store = TestBed.inject(MyBookingsStore);
  });

  it('load_online_isLoadedAndNotStale', async () => {
    await store.load();

    const view = store.view();
    expect(view.status === 'loaded' && view.stale).toBe(false);
    expect(view.status === 'loaded' && view.items).toEqual([SAMPLE_BOOKING]);
  });

  it('load_offlineAfterAPreviousVisit_keepsTheCopyMarkedAsStale', async () => {
    await store.load();
    remote.failWith = { kind: 'network' };

    await store.load();

    const view = store.view();
    expect(view.status).toBe('loaded');
    expect(view.status === 'loaded' && view.stale).toBe(true);
  });

  it('load_offlineFirstTime_isOffline', async () => {
    remote.failWith = { kind: 'network' };

    await store.load();

    expect(store.view().status).toBe('offline');
  });
});
