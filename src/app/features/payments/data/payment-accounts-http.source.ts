import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { LocalCache } from '../../../core/storage/local-cache';
import type { PaymentAccount } from '../domain/payment-account';
import { PaymentAccountsSource } from '../domain/payments.ports';

/** Only the part of GET /config this feature reads. */
interface ConfigDto {
  paymentAccounts?: PaymentAccount[];
}

const CACHE_KEY = 'payment-accounts';

/**
 * Adapter: reads the deposit accounts from GET /config and keeps a copy on the phone,
 * so the player still sees where to transfer when the signal is weak.
 */
@Injectable({ providedIn: 'root' })
export class PaymentAccountsHttpSource extends PaymentAccountsSource {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(LocalCache);

  async load(): Promise<readonly PaymentAccount[]> {
    try {
      const config = await firstValueFrom(this.http.get<ConfigDto>(`${environment.apiBaseUrl}/config`));
      const accounts = config.paymentAccounts ?? [];
      await this.cache.write(CACHE_KEY, accounts);
      return accounts;
    } catch {
      return (await this.cache.read<PaymentAccount[]>(CACHE_KEY))?.value ?? [];
    }
  }
}
