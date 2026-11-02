import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { BookingScope, MyBooking } from '../domain/my-booking';
import { MyBookingsRemote } from '../domain/my-bookings.ports';

/** Mirror of the OpenAPI Booking schema, only the fields this feature uses. */
interface BookingDto {
  id: number;
  code: string;
  field: { id: number; name: string };
  startsAt: string;
  endsAt: string;
  status: MyBooking['status'];
  totalAmount: number;
  depositAmount: number;
}

/** Adapter: GET /bookings?scope= of pnk-api. */
@Injectable()
export class MyBookingsHttpRemote extends MyBookingsRemote {
  private readonly http = inject(HttpClient);

  async list(scope: BookingScope): Promise<readonly MyBooking[]> {
    const dtos = await firstValueFrom(
      this.http.get<BookingDto[]>(`${environment.apiBaseUrl}/bookings`, { params: { scope } }),
    );
    return dtos.map((d) => ({
      id: d.id,
      code: d.code,
      fieldName: d.field.name,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      status: d.status,
      depositAmount: d.depositAmount,
      totalAmount: d.totalAmount,
    }));
  }
}
