import { DestroyRef, Injectable, inject, signal } from '@angular/core';

import { errorMessage } from '../../../core/i18n/error-messages.es';
import { errorCodeOf } from '../../../core/network/app-error';
import { ReceiptCapturePort, ReceiptQueue, ReceiptSync } from '../domain/payments.ports';
import type { CaptureSource, ReceiptPhoto } from '../domain/receipt';
import { UploadReceiptUseCase } from '../domain/upload-receipt.usecase';

/** Shown when the camera or the gallery returns an error (not a cancellation). */
const CAPTURE_FAILED = 'No pudimos obtener la foto. Inténtalo de nuevo o elige una de la galería.';

/** States of the receipt screen (HU-09). */
export type ReceiptView =
  | { readonly status: 'idle' }
  | { readonly status: 'preview'; readonly photo: ReceiptPhoto }
  | { readonly status: 'sending'; readonly photo: ReceiptPhoto }
  | { readonly status: 'uploaded' }
  | { readonly status: 'queued' }
  | { readonly status: 'permission-denied' }
  | { readonly status: 'error'; readonly photo: ReceiptPhoto | null; readonly message: string };

@Injectable()
export class ReceiptUploadStore {
  private readonly capturePort = inject(ReceiptCapturePort);
  private readonly uploadReceipt = inject(UploadReceiptUseCase);

  private readonly queue = inject(ReceiptQueue, { optional: true });
  private readonly state = signal<ReceiptView>({ status: 'idle' });
  readonly view = this.state.asReadonly();
  private queuedBookingId: number | null = null;

  constructor() {
    // "Guardado sin señal" turns into "Enviado" by itself when the queue is flushed.
    const stop = inject(ReceiptSync, { optional: true })?.onFlushed(() => void this.checkQueued());
    if (stop) inject(DestroyRef).onDestroy(stop);
  }

  async capture(source: CaptureSource): Promise<void> {
    try {
      const photo = await this.capturePort.capture(source);
      if (photo) this.state.set({ status: 'preview', photo });
    } catch (error) {
      if ((error as { kind?: string })?.kind === 'permission-denied') {
        this.state.set({ status: 'permission-denied' }); // the gallery is still available
      } else if ((error as { kind?: string })?.kind === 'capture-failed') {
        const detail = (error as { detail?: string }).detail;
        this.state.set({ status: 'error', photo: null, message: `${CAPTURE_FAILED}${detail ? ` (${detail})` : ''}` });
      } else {
        this.state.set({ status: 'error', photo: null, message: errorMessage(errorCodeOf(error)) });
      }
    }
  }

  async send(bookingId: number, amount: number): Promise<void> {
    const current = this.state();
    const photo = 'photo' in current ? current.photo : null;
    if (!photo || current.status === 'sending') return;

    this.state.set({ status: 'sending', photo });
    try {
      const result = await this.uploadReceipt.execute(bookingId, amount, photo);
      this.queuedBookingId = result === 'queued' ? bookingId : null;
      this.state.set({ status: result });
    } catch (error) {
      this.state.set({ status: 'error', photo, message: errorMessage(errorCodeOf(error)) });
    }
  }

  private async checkQueued(): Promise<void> {
    if (this.state().status !== 'queued' || this.queuedBookingId === null || !this.queue) return;
    const stillWaiting = (await this.queue.all()).some((item) => item.bookingId === this.queuedBookingId);
    if (!stillWaiting) this.state.set({ status: 'uploaded' });
  }
}
