/** One hour of one field. `startsAt` is ISO 8601 with the venue offset, as sent by the API. */
export interface Slot {
  readonly startsAt: string;
  readonly available: boolean;
}

export interface FieldAvailability {
  readonly fieldId: number;
  readonly name: string;
  readonly hourlyPrice: number;
  readonly slots: readonly Slot[];
}

/** Availability of every field for one day (HU-03). */
export interface DayAvailability {
  readonly date: string;
  readonly fields: readonly FieldAvailability[];
}

/** True when no field has a free slot that day (empty state of HU-03). */
export function hasNoFreeSlots(day: DayAvailability): boolean {
  return day.fields.every((field) => field.slots.every((slot) => !slot.available));
}
