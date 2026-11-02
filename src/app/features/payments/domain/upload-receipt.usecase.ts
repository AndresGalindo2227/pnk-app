import type { ReceiptQueue, ReceiptsRemote } from './payments.ports';
import type { ReceiptPhoto, UploadResult } from './receipt';
import { MAX_RECEIPT_BYTES } from './receipt';

/**
 * HU-09: send the transfer receipt. Without signal it is queued and sent later.
 * Uploading later cannot create conflicts, so queuing is safe (ADR-004).
 */
export class UploadReceiptUseCase {
  constructor(
    private readonly remote: ReceiptsRemote,
    private readonly queue: ReceiptQueue,
    private readonly newId: () => string = () => crypto.randomUUID(),
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(bookingId: number, amount: number, photo: ReceiptPhoto): Promise<UploadResult> {
    if (!Number.isInteger(amount) || amount <= 0) throw { kind: 'validation', fields: ['amount'] };
    if (approximateBytes(photo.dataUrl) > MAX_RECEIPT_BYTES) throw { kind: 'conflict', code: 'FILE_TOO_LARGE' };

    try {
      await this.remote.upload(bookingId, amount, photo);
      return 'uploaded';
    } catch (error) {
      if ((error as { kind?: string })?.kind !== 'network') throw error;
      await this.queue.add({
        id: this.newId(),
        bookingId,
        amount,
        dataUrl: photo.dataUrl,
        createdAt: this.now().toISOString(),
        attempts: 0,
      });
      return 'queued';
    }
  }
}

/** Size of the decoded image of a base64 data URL. */
export function approximateBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Math.floor((base64.length * 3) / 4);
}
