import type { EnvironmentProviders, Provider } from '@angular/core';
import { inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';

import { CameraAdapter } from './data/camera.adapter';
import { ReceiptQueueFlusher } from './data/receipt-queue.flusher';
import { PreferencesReceiptQueue } from './data/receipt-queue.store';
import { ReceiptsHttpRemote } from './data/receipts-http.remote';
import { ReceiptCapturePort, ReceiptQueue, ReceiptSync, ReceiptsRemote } from './domain/payments.ports';
import { UploadReceiptUseCase } from './domain/upload-receipt.usecase';

/** App-wide pieces of payments: the queue and its flusher must live while the app runs. */
export function providePaymentsQueue(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ReceiptsRemote, useExisting: ReceiptsHttpRemote },
    { provide: ReceiptQueue, useExisting: PreferencesReceiptQueue },
    { provide: ReceiptSync, useExisting: ReceiptQueueFlusher },
    provideAppInitializer(() => {
      void inject(ReceiptQueueFlusher).start();
    }),
  ]);
}

/** Screen-level pieces of payments (route providers). */
export function providePayments(): Provider[] {
  return [
    { provide: ReceiptCapturePort, useClass: CameraAdapter },
    {
      provide: UploadReceiptUseCase,
      useFactory: (remote: ReceiptsRemote, queue: ReceiptQueue) => new UploadReceiptUseCase(remote, queue),
      deps: [ReceiptsRemote, ReceiptQueue],
    },
  ];
}
