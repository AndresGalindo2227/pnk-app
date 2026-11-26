import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { LocalCache } from '../../../core/storage/local-cache';
import type { PaymentAccount } from '../domain/payment-account';
import type { PaymentSettings } from '../domain/payment-settings';
import { PaymentSettingsSource } from '../domain/payments.ports';

/** Only the part of GET /config this feature reads. */
interface ConfigDto {
  paymentAccounts?: PaymentAccount[];
  onlinePayments?: boolean;
}

const CACHE_KEY = 'payment-settings';

/**
 * Adapter: reads how bookings are paid from GET /config and keeps a copy on the phone,
 * so the player still sees where to transfer when the signal is weak.
 * Online payments need the internet anyway, so the offline copy never offers them.
 */
@Injectable({ providedIn: 'root' })
export class PaymentSettingsHttpSource extends PaymentSettingsSource {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(LocalCache);
  private pending: Promise<PaymentSettings> | null = null;

  /** Both components of the detail screen ask at the same time: one request serves them. */
  load(): Promise<PaymentSettings> {
    this.pending ??= this.fetch().finally(() => setTimeout(() => (this.pending = null), 1000));
    return this.pending;
  }

  private async fetch(): Promise<PaymentSettings> {
    try {
      const config = await firstValueFrom(this.http.get<ConfigDto>(`${environment.apiBaseUrl}/config`));
      const settings: PaymentSettings = {
        accounts: config.paymentAccounts ?? [],
        onlinePayments: config.onlinePayments === true,
      };
      await this.cache.write(CACHE_KEY, settings.accounts);
      return settings;
    } catch {
      const accounts = (await this.cache.read<PaymentAccount[]>(CACHE_KEY))?.value ?? [];
      return { accounts, onlinePayments: false };
    }
  }
}
