import type { Provider } from '@angular/core';

import { BookingsHttpRepository } from './data/bookings-http.repository';
import { LocalNotificationsAdapter } from './data/local-notifications.adapter';
import { BookingsRepository } from './domain/bookings.repository';
import { CancelBookingUseCase } from './domain/cancel-booking.usecase';
import { Clock, SystemClock } from './domain/clock';
import { CreateBookingUseCase } from './domain/create-booking.usecase';
import { GetAvailabilityUseCase } from './domain/get-availability.usecase';
import { ReminderPort } from './domain/reminder.port';
import { ScheduleReminderUseCase } from './domain/schedule-reminder.usecase';

/** Composition of the bookings feature: the only place that knows which adapter implements each port. */
export function provideBookings(): Provider[] {
  return [
    { provide: BookingsRepository, useClass: BookingsHttpRepository },
    { provide: Clock, useClass: SystemClock },
    { provide: ReminderPort, useClass: LocalNotificationsAdapter },
    {
      provide: ScheduleReminderUseCase,
      useFactory: (r: ReminderPort, c: Clock) => new ScheduleReminderUseCase(r, c),
      deps: [ReminderPort, Clock],
    },
    {
      provide: GetAvailabilityUseCase,
      useFactory: (r: BookingsRepository) => new GetAvailabilityUseCase(r),
      deps: [BookingsRepository],
    },
    {
      provide: CreateBookingUseCase,
      useFactory: (r: BookingsRepository, c: Clock) => new CreateBookingUseCase(r, c),
      deps: [BookingsRepository, Clock],
    },
    {
      provide: CancelBookingUseCase,
      useFactory: (r: BookingsRepository) => new CancelBookingUseCase(r),
      deps: [BookingsRepository],
    },
  ];
}
