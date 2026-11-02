import type { ReceiptQueue, ReceiptsRemote } from './payments.ports';

export const MAX_UPLOAD_ATTEMPTS = 5;

/**
 * Sends the queued receipts when the connection returns.
 * Conflict policy: server-wins. A 404/409 (booking cancelled, payment already reviewed) discards
 * the item; a network error keeps it for the next attempt (offline-sync.md).
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
        if (kind === 'network' && item.attempts + 1 < MAX_UPLOAD_ATTEMPTS) {
          await this.queue.replace({ ...item, attempts: item.attempts + 1 });
        } else {
          await this.queue.remove(item.id); // server-wins, or too many attempts
        }
      }
    }
    return uploaded;
  }
}
