/** Result of trying to schedule the match reminder (HU-07). */
export type ReminderResult = 'scheduled' | 'permission-denied' | 'too-late';

/** A local notification to show before the match. */
export interface MatchReminder {
  readonly id: number;
  readonly at: Date;
  readonly title: string;
  readonly body: string;
}

/**
 * Port for the device notifications. The adapter asks for the permission only when the first
 * reminder is scheduled (just-in-time), never at app start.
 */
export abstract class ReminderPort {
  abstract schedule(reminder: MatchReminder): Promise<'scheduled' | 'permission-denied'>;
  abstract cancel(id: number): Promise<void>;
}
