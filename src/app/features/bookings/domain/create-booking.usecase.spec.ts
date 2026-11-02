import { beforeEach, describe, expect, it } from 'vitest';

import { FakeBookingsRepository, FixedClock } from '../../../../testing/fake-bookings.repository';

import { CreateBookingUseCase } from './create-booking.usecase';

// HU-04 — Book a field slot. "Now" is 2026-11-05 18:30 in Neiva.
describe('CreateBookingUseCase', () => {
  let repository: FakeBookingsRepository;
  let useCase: CreateBookingUseCase;

  beforeEach(() => {
    repository = new FakeBookingsRepository();
    useCase = new CreateBookingUseCase(repository, new FixedClock('2026-11-05T18:30:00-05:00'));
  });

  it('createBooking_futureSlot_callsRepositoryWithTheIdempotencyKey', async () => {
    await useCase.execute({ fieldId: 2, startsAt: '2026-11-05T19:00:00-05:00', hours: 1 }, 'key-1');

    expect(repository.createCalls).toEqual([
      { request: { fieldId: 2, startsAt: '2026-11-05T19:00:00-05:00', hours: 1 }, key: 'key-1' },
    ]);
  });

  it('createBooking_slotInThePast_rejectsWithoutCallingRepository', async () => {
    await expect(
      useCase.execute({ fieldId: 2, startsAt: '2026-11-05T18:00:00-05:00', hours: 1 }, 'key-2'),
    ).rejects.toEqual({
      kind: 'validation',
      fields: ['slot-in-the-past'],
    });
    expect(repository.createCalls).toHaveLength(0);
  });

  it('createBooking_startNotOnTheHour_rejects', async () => {
    await expect(
      useCase.execute({ fieldId: 2, startsAt: '2026-11-05T19:30:00-05:00', hours: 1 }, 'key-3'),
    ).rejects.toEqual({
      kind: 'validation',
      fields: ['not-on-the-hour'],
    });
  });

  it('createBooking_moreThanThreeHours_rejects', async () => {
    await expect(
      useCase.execute({ fieldId: 2, startsAt: '2026-11-05T19:00:00-05:00', hours: 4 }, 'key-4'),
    ).rejects.toEqual({
      kind: 'validation',
      fields: ['invalid-hours'],
    });
  });
});
