import { Injectable, inject } from '@angular/core';
import { Network } from '@capacitor/network';

import { FlushReceiptQueueUseCase } from '../domain/flush-receipt-queue.usecase';
import { ReceiptQueue, ReceiptsRemote } from '../domain/payments.ports';

/**
 * Listens to the connectivity stream (@capacitor/network) and flushes the receipt queue when the
 * device goes back online, and once at app start. Started from app.config.ts.
 */
@Injectable({ providedIn: 'root' })
export class ReceiptQueueFlusher {
  private readonly flush = new FlushReceiptQueueUseCase(inject(ReceiptsRemote), inject(ReceiptQueue));
  private running = false;

  async start(): Promise<void> {
    await Network.addListener('networkStatusChange', (status) => {
      if (status.connected) void this.run();
    });
    void this.run();
  }

  private async run(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.flush.execute();
    } finally {
      this.running = false;
    }
  }
}
