/** Photo of a transfer receipt, already compressed by the camera adapter. */
export interface ReceiptPhoto {
  /** data URL (image/jpeg) so it can be shown, queued and uploaded. */
  readonly dataUrl: string;
}

export type CaptureSource = 'camera' | 'gallery';

/** Result of sending a receipt (HU-09). */
export type UploadResult = 'uploaded' | 'queued';

/** Receipt waiting to be uploaded because there was no connection. */
export interface QueuedReceipt {
  readonly id: string;
  readonly bookingId: number;
  readonly amount: number;
  readonly dataUrl: string;
  readonly createdAt: string;
  readonly attempts: number;
}

/** Same limit as the API (413 FILE_TOO_LARGE). */
export const MAX_RECEIPT_BYTES = 2 * 1024 * 1024;
