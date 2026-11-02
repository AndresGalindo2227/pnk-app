import { beforeEach, describe, expect, it } from 'vitest';

import { FakeBookingsRepository, FakeReminderPort, FixedClock } from '../../../../testing/fake-bookings.repository';

import { ScheduleReminderUseCase } from './schedule-reminder.usecase';

// HU-07 — Match reminder. The booking (fake) starts 2026-11-05 19:00 in Neiva.
describe('ScheduleReminderUseCase', () => {
  let reminders: FakeReminderPort;
  const booking = new FakeBookingsRepository().booking;

  beforeEach(() => {
    reminders = new FakeReminderPort();
  });

  it('scheduleReminder_matchInTheFuture_schedulesItSixtyMinutesBefore', async () => {
    const useCase = new ScheduleReminderUseCase(reminders, new FixedClock('2026-11-05T10:00:00-05:00'));

    expect(await useCase.execute(booking)).toBe('scheduled');
    expect(reminders.scheduled[0].at.toISOString()).toBe(new Date('2026-11-05T18:00:00-05:00').toISOString());
  });

  it('scheduleReminder_permissionDenied_returnsDeniedWithoutThrowing', async () => {
    reminders.permission = 'denied';
    const useCase = new ScheduleReminderUseCase(reminders, new FixedClock('2026-11-05T10:00:00-05:00'));

    expect(await useCase.execute(booking)).toBe('permission-denied');
  });

  it('scheduleReminder_lessThanOneHourLeft_returnsTooLate', async () => {
    const useCase = new ScheduleReminderUseCase(reminders, new FixedClock('2026-11-05T18:30:00-05:00'));

    expect(await useCase.execute(booking)).toBe('too-late');
    expect(reminders.scheduled).toHaveLength(0);
  });
});
