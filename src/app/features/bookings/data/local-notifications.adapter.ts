import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

import type { MatchReminder } from '../domain/reminder.port';
import { ReminderPort } from '../domain/reminder.port';

/**
 * Adapter of ReminderPort with @capacitor/local-notifications.
 * The permission is requested here, the first time a reminder is scheduled (just-in-time).
 */
@Injectable()
export class LocalNotificationsAdapter extends ReminderPort {
  async schedule(reminder: MatchReminder): Promise<'scheduled' | 'permission-denied'> {
    let { display } = await LocalNotifications.checkPermissions();
    if (display === 'prompt' || display === 'prompt-with-rationale') {
      display = (await LocalNotifications.requestPermissions()).display;
    }
    if (display !== 'granted') return 'permission-denied';

    await LocalNotifications.schedule({
      notifications: [
        {
          id: reminder.id,
          title: reminder.title,
          body: reminder.body,
          schedule: { at: reminder.at, allowWhileIdle: true },
        },
      ],
    });
    return 'scheduled';
  }

  async cancel(id: number): Promise<void> {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  }
}
