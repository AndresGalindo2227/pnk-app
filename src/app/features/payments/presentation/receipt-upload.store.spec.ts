import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { FakeCapturePort, FakeReceiptsRemote, InMemoryReceiptQueue, PHOTO } from '../../../../testing/fake-payments';
import { FlushReceiptQueueUseCase } from '../domain/flush-receipt-queue.usecase';
import { ReceiptCapturePort, ReceiptQueue, ReceiptSync } from '../domain/payments.ports';
import { UploadReceiptUseCase } from '../domain/upload-receipt.usecase';

import { ReceiptUploadStore } from './receipt-upload.store';

// State holder of HU-09.
describe('ReceiptUploadStore', () => {
  let camera: FakeCapturePort;
  let remote: FakeReceiptsRemote;
  let store: ReceiptUploadStore;
  let queue: InMemoryReceiptQueue;
  let sync: FakeReceiptSync;

  beforeEach(() => {
    camera = new FakeCapturePort();
    remote = new FakeReceiptsRemote();
    queue = new InMemoryReceiptQueue();
    sync = new FakeReceiptSync();
    TestBed.configureTestingModule({
      providers: [
        ReceiptUploadStore,
        { provide: ReceiptCapturePort, useValue: camera },
        { provide: ReceiptQueue, useValue: queue },
        { provide: ReceiptSync, useValue: sync },
        { provide: UploadReceiptUseCase, useValue: new UploadReceiptUseCase(remote, queue) },
      ],
    });
    store = TestBed.inject(ReceiptUploadStore);
  });

  it('capture_photoTaken_showsPreview', async () => {
    await store.capture('camera');

    expect(store.view()).toEqual({ status: 'preview', photo: PHOTO });
  });

  it('capture_cameraPermissionDenied_offersTheGallery', async () => {
    camera.behaviour = 'denied';

    await store.capture('camera');

    expect(store.view().status).toBe('permission-denied');
  });

  it('send_withoutSignal_isQueued', async () => {
    await store.capture('gallery');
    remote.failWith = { kind: 'network' };

    await store.send(87, 35000);

    expect(store.view().status).toBe('queued');
  });

  it('send_queuedThenConnectionBack_turnsIntoUploadedByItself', async () => {
    await store.capture('camera');
    remote.failWith = { kind: 'network' };
    await store.send(87, 35000);
    expect(store.view().status).toBe('queued');

    remote.failWith = null;
    await new FlushReceiptQueueUseCase(remote, queue).execute();
    sync.notify();
    await Promise.resolve();
    await Promise.resolve();

    expect(store.view().status).toBe('uploaded');
  });
});

/** ReceiptSync double: the test decides when a flush "happened". */
class FakeReceiptSync extends ReceiptSync {
  private readonly listeners = new Set<() => void>();

  onFlushed(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}
