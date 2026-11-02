import { Injectable, inject, signal } from '@angular/core';

import { errorMessage } from '../../../core/i18n/error-messages.es';
import { errorCodeOf } from '../../../core/network/app-error';
import { ReceiptCapturePort } from '../domain/payments.ports';
import type { CaptureSource, ReceiptPhoto } from '../domain/receipt';
import { UploadReceiptUseCase } from '../domain/upload-receipt.usecase';

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

  private readonly state = signal<ReceiptView>({ status: 'idle' });
  readonly view = this.state.asReadonly();

  async capture(source: CaptureSource): Promise<void> {
    try {
      const photo = await this.capturePort.capture(source);
      if (photo) this.state.set({ status: 'preview', photo });
    } catch (error) {
      if ((error as { kind?: string })?.kind === 'permission-denied') {
        this.state.set({ status: 'permission-denied' }); // the gallery is still available
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
      this.state.set({ status: result });
    } catch (error) {
      this.state.set({ status: 'error', photo, message: errorMessage(errorCodeOf(error)) });
    }
  }
}
