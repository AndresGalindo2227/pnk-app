import { Injectable, inject } from '@angular/core';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';

import { FlushReceiptQueueUseCase } from '../domain/flush-receipt-queue.usecase';
import { ReceiptQueue, ReceiptSync, ReceiptsRemote } from '../domain/payments.ports';

/** While receipts are waiting, try again every RETRY_MS (the first try after coming back online often fails). */
const RETRY_MS = 15_000;

/**
 * Flushes the receipt queue (offline-sync.md):
 * - once at app start,
 * - when the device goes back online (@capacitor/network),
 * - when the app comes back to the foreground (@capacitor/app),
 * - and every 15 s while something is still waiting.
 * Started from app.config.ts. Notifies the screens after each attempt (ReceiptSync).
 */
@Injectable({ providedIn: 'root' })
export class ReceiptQueueFlusher extends ReceiptSync {
  private readonly queue = inject(ReceiptQueue);
  private readonly flush = new FlushReceiptQueueUseCase(inject(ReceiptsRemote), this.queue);
  private readonly listeners = new Set<() => void>();
  private running = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  async start(): Promise<void> {
    await Network.addListener('networkStatusChange', (status) => {
      if (status.connected) void this.run();
    });
    await App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void this.run();
    }).catch(() => undefined); // not available on every platform
    void this.run();
  }

  onFlushed(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async run(): Promise<void> {
    if (this.running) return;
    this.running = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
    try {
      await this.flush.execute();
    } catch {
      // the queue storage failed: try again later
    } finally {
      this.running = false;
      this.listeners.forEach((listener) => listener());
      if ((await this.queue.all()).length > 0) this.retryTimer = setTimeout(() => void this.run(), RETRY_MS);
    }
  }
}
