import type { Provider } from '@angular/core';

import { BookingsHttpRepository } from './data/bookings-http.repository';
import { BookingsRepository } from './domain/bookings.repository';
import { CancelBookingUseCase } from './domain/cancel-booking.usecase';
import { Clock, SystemClock } from './domain/clock';
import { CreateBookingUseCase } from './domain/create-booking.usecase';
import { GetAvailabilityUseCase } from './domain/get-availability.usecase';

/** Composition of the bookings feature: the only place that knows which adapter implements each port. */
export function provideBookings(): Provider[] {
  return [
    { provide: BookingsRepository, useClass: BookingsHttpRepository },
    { provide: Clock, useClass: SystemClock },
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
