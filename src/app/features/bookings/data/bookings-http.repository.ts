import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { LocalCache } from '../../../core/storage/local-cache';
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
  private readonly cache = inject(LocalCache);

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
    return this.remember(
      toBooking(
        await firstValueFrom(
          this.http.post<BookingDto>(`${this.baseUrl}/bookings`, request, {
            headers: { 'Idempotency-Key': idempotencyKey },
          }),
        ),
      ),
    );
  }

  async getById(id: number): Promise<Booking> {
    return this.remember(toBooking(await firstValueFrom(this.http.get<BookingDto>(`${this.baseUrl}/bookings/${id}`))));
  }

  async cancel(id: number): Promise<Booking> {
    return this.remember(
      toBooking(await firstValueFrom(this.http.post<BookingDto>(`${this.baseUrl}/bookings/${id}/cancel`, {}))),
    );
  }

  /**
   * Offline fallback: the copy saved the last time this booking was loaded and, if it was never opened,
   * the row of the "Mis reservas" list saved by the my-bookings feature (same LocalCache, read-only here).
   * Cancelling needs the server, so a booking rebuilt from the list never offers it.
   */
  async getCached(id: number): Promise<Booking | null> {
    const saved = await this.cache.read<Booking>(detailKey(id));
    if (saved) return { ...saved.value, canCancel: false };

    for (const scope of ['upcoming', 'past']) {
      const list = await this.cache.read<ListRow[]>(`myBookings.${scope}.v1`);
      const row = list?.value.find((item) => item.id === id);
      if (row) {
        return {
          id: row.id,
          code: row.code,
          fieldId: 0,
          fieldName: row.fieldName,
          startsAt: row.startsAt,
          endsAt: row.endsAt,
          status: row.status,
          totalAmount: row.totalAmount,
          depositAmount: row.depositAmount,
          paymentStatus: row.paymentStatus ?? null,
          canCancel: false,
        };
      }
    }
    return null;
  }

  /** Read-through cache: every booking received from the API is saved for offline use. */
  private async remember(booking: Booking): Promise<Booking> {
    await this.cache.write(detailKey(booking.id), booking).catch(() => undefined); // best effort
    return booking;
  }
}

function detailKey(id: number): string {
  return `booking.${id}.v1`;
}

/** Shape of a row saved by the my-bookings cache (MyBooking). */
type ListRow = Omit<Booking, 'fieldId' | 'canCancel'>;
