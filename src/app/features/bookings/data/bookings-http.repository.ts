import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { DayAvailability } from '../domain/availability';
import type { Booking, BookingRequest } from '../domain/booking';
import { BookingsRepository } from '../domain/bookings.repository';
import type { Field } from '../domain/field';

import type { BookingDto, DayAvailabilityDto, FieldDto } from './bookings.dto';
import { toBooking, toDayAvailability, toField } from './bookings.mapper';

/** Adapter: implements the BookingsRepository port with pnk-api (see openapi.yaml). */
@Injectable()
export class BookingsHttpRepository extends BookingsRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  async getFields(): Promise<readonly Field[]> {
    const dtos = await firstValueFrom(this.http.get<FieldDto[]>(`${this.baseUrl}/fields`));
    return dtos.map(toField);
  }

  async getAvailability(date: string): Promise<DayAvailability> {
    return toDayAvailability(
      await firstValueFrom(this.http.get<DayAvailabilityDto>(`${this.baseUrl}/availability`, { params: { date } })),
    );
  }

  async create(request: BookingRequest, idempotencyKey: string): Promise<Booking> {
    return toBooking(
      await firstValueFrom(
        this.http.post<BookingDto>(`${this.baseUrl}/bookings`, request, {
          headers: { 'Idempotency-Key': idempotencyKey },
        }),
      ),
    );
  }

  async getById(id: number): Promise<Booking> {
    return toBooking(await firstValueFrom(this.http.get<BookingDto>(`${this.baseUrl}/bookings/${id}`)));
  }

  async cancel(id: number): Promise<Booking> {
    return toBooking(await firstValueFrom(this.http.post<BookingDto>(`${this.baseUrl}/bookings/${id}/cancel`, {})));
  }
}
