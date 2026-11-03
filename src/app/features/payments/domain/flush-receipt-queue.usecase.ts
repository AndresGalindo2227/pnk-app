import type { ReceiptQueue, ReceiptsRemote } from './payments.ports';

export const MAX_UPLOAD_ATTEMPTS = 5;

/**
 * Sends the queued receipts when the connection returns.
 * - Network error: the item stays, without limit. Being offline never makes a receipt get lost.
 * - 404/409 (booking cancelled, payment already reviewed): server-wins, the item is discarded.
 * - Any other error (5xx, unknown): retried, and discarded after MAX_UPLOAD_ATTEMPTS (offline-sync.md).
 */
export class FlushReceiptQueueUseCase {
  constructor(
    private readonly remote: ReceiptsRemote,
    private readonly queue: ReceiptQueue,
  ) {}

  /** Returns how many receipts were uploaded. */
  async execute(): Promise<number> {
    let uploaded = 0;
    for (const item of await this.queue.all()) {
      try {
        await this.remote.upload(item.bookingId, item.amount, { dataUrl: item.dataUrl });
        await this.queue.remove(item.id);
        uploaded++;
      } catch (error) {
        const kind = (error as { kind?: string })?.kind;
        if (kind === 'network') continue; // still offline: keep it as it is
        if (kind !== 'not-found' && kind !== 'conflict' && item.attempts + 1 < MAX_UPLOAD_ATTEMPTS) {
          await this.queue.replace({ ...item, attempts: item.attempts + 1 });
        } else {
          await this.queue.remove(item.id); // server-wins, or too many server errors
        }
      }
    }
    return uploaded;
  }
}
