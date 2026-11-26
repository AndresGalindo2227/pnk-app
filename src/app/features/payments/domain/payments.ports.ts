import type { OnlineCheckout, OnlinePaymentCheck, OnlinePaymentOption } from './online-payment';
import type { PaymentSettings } from './payment-settings';
import type { CaptureSource, QueuedReceipt, ReceiptPhoto } from './receipt';

/**
 * Port for how the bookings are paid (GET /config): deposit accounts and whether online payments
 * are on. Falls back to the last copy saved on the phone when there is no connection.
 */
export abstract class PaymentSettingsSource {
  abstract load(): Promise<PaymentSettings>;
}

/** Port for the online payment with Wompi (POST /bookings/{id}/payments/online[/check]). */
export abstract class OnlinePaymentsRemote {
  abstract start(bookingId: number, option: OnlinePaymentOption): Promise<OnlineCheckout>;
  abstract check(bookingId: number): Promise<OnlinePaymentCheck>;
}

/**
 * Port for the browser where the player pays. `onReturn` is called when the player closes it
 * or comes back to the app; it returns a function that unregisters the listener.
 */
export abstract class CheckoutBrowser {
  abstract open(url: string): Promise<void>;
  abstract onReturn(listener: () => void): () => void;
}

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
