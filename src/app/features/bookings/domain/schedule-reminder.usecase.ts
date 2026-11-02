import type { Booking } from './booking';
import type { Clock } from './clock';
import type { ReminderPort, ReminderResult } from './reminder.port';

/** HU-07: the reminder fires 60 minutes before the match. */
export const REMINDER_MINUTES_BEFORE = 60;

/**
 * Schedules the local reminder of a booking. A denied permission never blocks the booking:
 * the booking is already saved and the screen only explains how to enable reminders later.
 */
export class ScheduleReminderUseCase {
  constructor(
    private readonly reminders: ReminderPort,
    private readonly clock: Clock,
  ) {}

  async execute(booking: Booking): Promise<ReminderResult> {
    const at = new Date(new Date(booking.startsAt).getTime() - REMINDER_MINUTES_BEFORE * 60_000);
    if (at.getTime() <= this.clock.now().getTime()) return 'too-late';

    return this.reminders.schedule({
      id: booking.id,
      at,
      title: `Tu partido en ${booking.fieldName} es en 1 hora`,
      body: `Reserva ${booking.code}. ¡Nos vemos en PANENKA!`,
    });
  }
}
