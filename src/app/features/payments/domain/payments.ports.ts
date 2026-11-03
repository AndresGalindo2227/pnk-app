import type { CaptureSource, QueuedReceipt, ReceiptPhoto } from './receipt';

/**
 * Port for the camera / gallery. The adapter asks for the camera permission only when the player
 * taps "Tomar foto" (just-in-time). Returns null when the player cancels.
 * Throws { kind: 'permission-denied' } when the camera permission is denied.
 */
export abstract class ReceiptCapturePort {
  abstract capture(source: CaptureSource): Promise<ReceiptPhoto | null>;
}

/** Port for POST /bookings/{id}/payments/receipt. */
export abstract class ReceiptsRemote {
  abstract upload(bookingId: number, amount: number, photo: ReceiptPhoto): Promise<void>;
}

/**
 * Port that tells the screens when the offline queue was flushed (plain callbacks, no framework),
 * so "en cola" can turn into "enviado" without the player leaving the screen.
 */
export abstract class ReceiptSync {
  /** Registers a listener called after every flush attempt; returns a function that unregisters it. */
  abstract onFlushed(listener: () => void): () => void;
}

/** Port for the offline queue of receipts (offline-sync.md). */
export abstract class ReceiptQueue {
  abstract add(item: QueuedReceipt): Promise<void>;
  abstract all(): Promise<readonly QueuedReceipt[]>;
  abstract remove(id: string): Promise<void>;
  abstract replace(item: QueuedReceipt): Promise<void>;
}
