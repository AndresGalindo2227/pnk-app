import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { FakeCapturePort, FakeReceiptsRemote, InMemoryReceiptQueue, PHOTO } from '../../../../testing/fake-payments';
import { ReceiptCapturePort } from '../domain/payments.ports';
import { UploadReceiptUseCase } from '../domain/upload-receipt.usecase';

import { ReceiptUploadStore } from './receipt-upload.store';

// State holder of HU-09.
describe('ReceiptUploadStore', () => {
  let camera: FakeCapturePort;
  let remote: FakeReceiptsRemote;
  let store: ReceiptUploadStore;

  beforeEach(() => {
    camera = new FakeCapturePort();
    remote = new FakeReceiptsRemote();
    TestBed.configureTestingModule({
      providers: [
        ReceiptUploadStore,
        { provide: ReceiptCapturePort, useValue: camera },
        { provide: UploadReceiptUseCase, useValue: new UploadReceiptUseCase(remote, new InMemoryReceiptQueue()) },
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
});
