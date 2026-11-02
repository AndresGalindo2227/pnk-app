import { describe, expect, it } from 'vitest';

import type { DayAvailability } from './availability';
import { hasNoFreeSlots } from './availability';
import { estimateAmounts } from './booking-rules';

// HU-03 — Field availability. Cancha 5A booked at 18:00 makes Cancha 9 unavailable (sector rule).
const day: DayAvailability = {
  date: '2026-11-05',
  fields: [
    {
      fieldId: 1,
      name: 'Cancha 5A',
      hourlyPrice: 70000,
      slots: [{ startsAt: '2026-11-05T18:00:00-05:00', available: false }],
    },
    {
      fieldId: 4,
      name: 'Cancha 9',
      hourlyPrice: 210000,
      slots: [{ startsAt: '2026-11-05T18:00:00-05:00', available: false }],
    },
  ],
};

describe('availability rules', () => {
  it('hasNoFreeSlots_everySlotTaken_returnsTrue', () => {
    expect(hasNoFreeSlots(day)).toBe(true);
  });

  it('hasNoFreeSlots_oneSlotFree_returnsFalse', () => {
    const withFree: DayAvailability = {
      ...day,
      fields: [
        ...day.fields,
        {
          fieldId: 2,
          name: 'Cancha 5B',
          hourlyPrice: 70000,
          slots: [{ startsAt: '2026-11-05T18:00:00-05:00', available: true }],
        },
      ],
    };
    expect(hasNoFreeSlots(withFree)).toBe(false);
  });

  it('estimateAmounts_cancha9TwoHours_totalAndHalfDeposit', () => {
    expect(estimateAmounts(210000, 2)).toEqual({ total: 420000, deposit: 210000 });
  });
});
