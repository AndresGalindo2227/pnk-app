import { beforeEach, describe, expect, it } from 'vitest';

import { FakeReceiptsRemote, InMemoryReceiptQueue, PHOTO } from '../../../../testing/fake-payments';

import { FlushReceiptQueueUseCase, MAX_UPLOAD_ATTEMPTS } from './flush-receipt-queue.usecase';
import { UploadReceiptUseCase } from './upload-receipt.usecase';

// HU-09 — Transfer receipt photo, queued when there is no signal.
describe('UploadReceiptUseCase and FlushReceiptQueueUseCase', () => {
  let remote: FakeReceiptsRemote;
  let queue: InMemoryReceiptQueue;
  let upload: UploadReceiptUseCase;

  beforeEach(() => {
    remote = new FakeReceiptsRemote();
    queue = new InMemoryReceiptQueue();
    upload = new UploadReceiptUseCase(
      remote,
      queue,
      () => 'q-1',
      () => new Date('2026-11-02T15:00:00Z'),
    );
  });

  it('upload_online_sendsItNow', async () => {
    expect(await upload.execute(87, 35000, PHOTO)).toBe('uploaded');
    expect(remote.uploads).toEqual([{ bookingId: 87, amount: 35000 }]);
  });

  it('upload_offline_queuesItInsteadOfFailing', async () => {
    remote.failWith = { kind: 'network' };

    expect(await upload.execute(87, 35000, PHOTO)).toBe('queued');
    expect(queue.items).toHaveLength(1);
  });

  it('upload_zeroAmount_rejectsWithValidationError', async () => {
    await expect(upload.execute(87, 0, PHOTO)).rejects.toEqual({ kind: 'validation', fields: ['amount'] });
  });

  it('flush_connectionBack_uploadsAndEmptiesTheQueue', async () => {
    remote.failWith = { kind: 'network' };
    await upload.execute(87, 35000, PHOTO);
    remote.failWith = null;

    expect(await new FlushReceiptQueueUseCase(remote, queue).execute()).toBe(1);
    expect(queue.items).toHaveLength(0);
  });

  it('flush_bookingAlreadyReviewed_discardsTheItem_serverWins', async () => {
    remote.failWith = { kind: 'network' };
    await upload.execute(87, 35000, PHOTO);
    remote.failWith = { kind: 'conflict', code: 'PAYMENT_ALREADY_REVIEWED' };

    expect(await new FlushReceiptQueueUseCase(remote, queue).execute()).toBe(0);
    expect(queue.items).toHaveLength(0);
  });

  it('flush_stillOffline_keepsTheItemForever', async () => {
    remote.failWith = { kind: 'network' };
    await upload.execute(87, 35000, PHOTO);
    const flush = new FlushReceiptQueueUseCase(remote, queue);

    for (let i = 0; i < MAX_UPLOAD_ATTEMPTS + 2; i++) await flush.execute();

    expect(queue.items).toHaveLength(1);
    expect(queue.items[0].attempts).toBe(0);
  });

  it('flush_serverKeepsFailing_givesUpAfterMaxAttempts', async () => {
    remote.failWith = { kind: 'network' };
    await upload.execute(87, 35000, PHOTO);
    remote.failWith = { kind: 'unknown' };
    const flush = new FlushReceiptQueueUseCase(remote, queue);

    for (let i = 0; i < MAX_UPLOAD_ATTEMPTS; i++) await flush.execute();

    expect(queue.items).toHaveLength(0);
  });
});
