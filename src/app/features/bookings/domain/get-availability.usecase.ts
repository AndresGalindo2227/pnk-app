import type { DayAvailability } from './availability';
import type { BookingsRepository } from './bookings.repository';

export const MAX_DAYS_AHEAD = 30;

/** HU-03: availability of every field for one day (YYYY-MM-DD, venue time zone). */
export class GetAvailabilityUseCase {
  constructor(private readonly repository: BookingsRepository) {}

  execute(date: string): Promise<DayAvailability> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw { kind: 'validation', fields: ['date'] };
    }
    return this.repository.getAvailability(date);
  }
}

/** Next `count` days starting today, as YYYY-MM-DD in the device time zone (Colombia). */
export function upcomingDates(today: Date, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}
