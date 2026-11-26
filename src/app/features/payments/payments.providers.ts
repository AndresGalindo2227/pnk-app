import type { EnvironmentProviders, Provider } from '@angular/core';
import { inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';

import { CameraAdapter } from './data/camera.adapter';
import { CapacitorCheckoutBrowser } from './data/checkout-browser.adapter';
import { OnlinePaymentsHttpRemote } from './data/online-payments-http.remote';
import { PaymentSettingsHttpSource } from './data/payment-settings-http.source';
import { ReceiptQueueFlusher } from './data/receipt-queue.flusher';
import { PreferencesReceiptQueue } from './data/receipt-queue.store';
import { ReceiptsHttpRemote } from './data/receipts-http.remote';
import {
  CheckoutBrowser,
  OnlinePaymentsRemote,
  PaymentSettingsSource,
  ReceiptCapturePort,
  ReceiptQueue,
  ReceiptSync,
  ReceiptsRemote,
} from './domain/payments.ports';
import { UploadReceiptUseCase } from './domain/upload-receipt.usecase';

/** App-wide pieces of payments: the queue and its flusher must live while the app runs. */
export function providePaymentsQueue(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ReceiptsRemote, useExisting: ReceiptsHttpRemote },
    { provide: ReceiptQueue, useExisting: PreferencesReceiptQueue },
    { provide: ReceiptSync, useExisting: ReceiptQueueFlusher },
    { provide: PaymentSettingsSource, useExisting: PaymentSettingsHttpSource },
    { provide: OnlinePaymentsRemote, useExisting: OnlinePaymentsHttpRemote },
    { provide: CheckoutBrowser, useExisting: CapacitorCheckoutBrowser },
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
