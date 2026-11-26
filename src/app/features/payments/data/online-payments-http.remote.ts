import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { OnlineCheckout, OnlinePaymentCheck, OnlinePaymentOption } from '../domain/online-payment';
import { OnlinePaymentsRemote } from '../domain/payments.ports';

/** Adapter: online payments of pnk-api (Wompi checkout signed by the server). */
@Injectable({ providedIn: 'root' })
export class OnlinePaymentsHttpRemote extends OnlinePaymentsRemote {
  private readonly http = inject(HttpClient);

  start(bookingId: number, option: OnlinePaymentOption): Promise<OnlineCheckout> {
    return firstValueFrom(
      this.http.post<OnlineCheckout>(`${environment.apiBaseUrl}/bookings/${bookingId}/payments/online`, { option }),
    );
  }

  check(bookingId: number): Promise<OnlinePaymentCheck> {
    return firstValueFrom(
      this.http.post<OnlinePaymentCheck>(`${environment.apiBaseUrl}/bookings/${bookingId}/payments/online/check`, {}),
    );
  }
}
