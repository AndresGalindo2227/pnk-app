import { Injectable, inject } from '@angular/core';

import { LocalCache } from '../../../core/storage/local-cache';
import { ReceiptQueue } from '../domain/payments.ports';
import type { QueuedReceipt } from '../domain/receipt';

const KEY = 'receipts.queue.v1';

/** Adapter: the receipt queue lives in Preferences (key pnk.cache.receipts.queue.v1), wiped on sign-out. */
@Injectable({ providedIn: 'root' })
export class PreferencesReceiptQueue extends ReceiptQueue {
  private readonly cache = inject(LocalCache);

  async all(): Promise<readonly QueuedReceipt[]> {
    return (await this.cache.read<QueuedReceipt[]>(KEY))?.value ?? [];
  }

  async add(item: QueuedReceipt): Promise<void> {
    await this.save([...(await this.all()), item]);
  }

  async remove(id: string): Promise<void> {
    await this.save((await this.all()).filter((i) => i.id !== id));
  }

  async replace(item: QueuedReceipt): Promise<void> {
    await this.save((await this.all()).map((i) => (i.id === item.id ? item : i)));
  }

  private async save(items: readonly QueuedReceipt[]): Promise<void> {
    await this.cache.write(KEY, items);
  }
}
