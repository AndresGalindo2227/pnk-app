import { beforeEach, describe, expect, it } from 'vitest';

import { FakeMyBookingsRemote, InMemoryMyBookingsCache, SAMPLE_BOOKING } from '../../../../testing/fake-my-bookings';

import { LoadMyBookingsUseCase } from './load-my-bookings.usecase';

// HU-05 — My bookings available offline (read-through cache, ADR-004).
describe('LoadMyBookingsUseCase', () => {
  let remote: FakeMyBookingsRemote;
  let cache: InMemoryMyBookingsCache;
  let useCase: LoadMyBookingsUseCase;

  beforeEach(() => {
    remote = new FakeMyBookingsRemote();
    cache = new InMemoryMyBookingsCache();
    useCase = new LoadMyBookingsUseCase(remote, cache, () => new Date('2026-11-02T15:00:00Z'));
  });

  it('load_online_returnsFreshListAndSavesCopy', async () => {
    const result = await useCase.execute('upcoming');

    expect(result).toEqual({ items: [SAMPLE_BOOKING], savedAt: '2026-11-02T15:00:00.000Z', isStale: false });
    expect(cache.saved.get('upcoming')?.items).toEqual([SAMPLE_BOOKING]);
  });

  it('load_offlineWithSavedCopy_returnsCopyMarkedAsStale', async () => {
    await useCase.execute('upcoming');
    remote.failWith = { kind: 'network' };

    const result = await useCase.execute('upcoming');

    expect(result.isStale).toBe(true);
    expect(result.items).toEqual([SAMPLE_BOOKING]);
    expect(result.savedAt).toBe('2026-11-02T10:00:00-05:00');
  });

  it('load_offlineWithoutCopy_throwsNetworkError', async () => {
    remote.failWith = { kind: 'network' };

    await expect(useCase.execute('upcoming')).rejects.toEqual({ kind: 'network' });
  });

  it('load_sessionExpired_doesNotHideTheErrorBehindOldData', async () => {
    await useCase.execute('upcoming');
    remote.failWith = { kind: 'unauthorized', code: 'SESSION_EXPIRED' };

    await expect(useCase.execute('upcoming')).rejects.toEqual({ kind: 'unauthorized', code: 'SESSION_EXPIRED' });
  });
});
