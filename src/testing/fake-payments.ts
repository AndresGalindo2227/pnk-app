import { ReceiptCapturePort, ReceiptQueue, ReceiptsRemote } from '../app/features/payments/domain/payments.ports';
import type { CaptureSource, QueuedReceipt, ReceiptPhoto } from '../app/features/payments/domain/receipt';

/** Small valid JPEG data URL used as a photo in tests. */
export const PHOTO: ReceiptPhoto = { dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' };

export class FakeReceiptsRemote extends ReceiptsRemote {
  failWith: unknown = null;
  readonly uploads: { bookingId: number; amount: number }[] = [];

  async upload(bookingId: number, amount: number): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.uploads.push({ bookingId, amount });
  }
}

export class InMemoryReceiptQueue extends ReceiptQueue {
  items: QueuedReceipt[] = [];

  async add(item: QueuedReceipt): Promise<void> {
    this.items = [...this.items, item];
  }

  async all(): Promise<readonly QueuedReceipt[]> {
    return this.items;
  }

  async remove(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id);
  }

  async replace(item: QueuedReceipt): Promise<void> {
    this.items = this.items.map((i) => (i.id === item.id ? item : i));
  }
}

/** Camera double: returns a photo, null (cancelled) or throws a denied permission. */
export class FakeCapturePort extends ReceiptCapturePort {
  behaviour: 'photo' | 'cancel' | 'denied' = 'photo';
  readonly sources: CaptureSource[] = [];

  async capture(source: CaptureSource): Promise<ReceiptPhoto | null> {
    this.sources.push(source);
    if (this.behaviour === 'denied') throw { kind: 'permission-denied' };
    return this.behaviour === 'photo' ? PHOTO : null;
  }
}
