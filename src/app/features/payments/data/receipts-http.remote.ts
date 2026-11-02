import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ReceiptsRemote } from '../domain/payments.ports';
import type { ReceiptPhoto } from '../domain/receipt';

/** Adapter: POST /bookings/{id}/payments/receipt as multipart/form-data. */
@Injectable({ providedIn: 'root' })
export class ReceiptsHttpRemote extends ReceiptsRemote {
  private readonly http = inject(HttpClient);

  async upload(bookingId: number, amount: number, photo: ReceiptPhoto): Promise<void> {
    const body = new FormData();
    body.append('photo', await (await fetch(photo.dataUrl)).blob(), 'receipt.jpg');
    body.append('amount', String(amount));
    await firstValueFrom(this.http.post(`${environment.apiBaseUrl}/bookings/${bookingId}/payments/receipt`, body));
  }
}
