import { Injectable } from '@angular/core';
import { Camera, MediaTypeSelection, type MediaResult } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

import { ReceiptCapturePort } from '../domain/payments.ports';
import type { CaptureSource, ReceiptPhoto } from '../domain/receipt';

/** Longest side of the uploaded photo, in pixels. */
const MAX_SIDE = 1280;
/** JPEG quality used when the photo is re-encoded (0..1). */
const JPEG_QUALITY = 0.6;

/**
 * Adapter of ReceiptCapturePort with @capacitor/camera 8 (takePhoto / chooseFromGallery).
 * The camera permission is requested only when the player taps "Tomar foto" (just-in-time).
 * Every photo (camera or gallery) is resized to 1280 px and re-encoded as JPEG here,
 * so it is always a small data URL that can be previewed, queued offline and uploaded.
 */
@Injectable()
export class CameraAdapter extends ReceiptCapturePort {
  async capture(source: CaptureSource): Promise<ReceiptPhoto | null> {
    if (source === 'camera') {
      let { camera } = await Camera.checkPermissions();
      if (camera === 'prompt' || camera === 'prompt-with-rationale') {
        camera = (await Camera.requestPermissions({ permissions: ['camera'] })).camera;
      }
      if (camera === 'denied') throw { kind: 'permission-denied' };
    }

    let media: MediaResult | undefined;
    try {
      media =
        source === 'camera'
          ? await Camera.takePhoto({ quality: 80, correctOrientation: true, editable: 'no' })
          : (await Camera.chooseFromGallery({ mediaType: MediaTypeSelection.Photo, editable: 'no' })).results[0];
    } catch (error) {
      if (isCancellation(error)) return null; // the player closed the camera or the gallery
      console.error('[CameraAdapter] capture failed', error);
      throw { kind: 'capture-failed', detail: describe(error) };
    }
    if (!media) return null;

    const src = media.webPath ?? (media.uri ? Capacitor.convertFileSrc(media.uri) : null);
    if (!src) throw { kind: 'capture-failed', detail: 'no webPath/uri' };
    try {
      return { dataUrl: await toCompressedDataUrl(src) };
    } catch (error) {
      console.error('[CameraAdapter] could not read the photo', src, error);
      throw { kind: 'capture-failed', detail: describe(error) };
    }
  }
}

function isCancellation(error: unknown): boolean {
  return /cancel/i.test(describe(error));
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) return String(error.message);
  return String(error);
}

/** Loads the image, scales it down to MAX_SIDE and returns it as a JPEG data URL. */
async function toCompressedDataUrl(src: string): Promise<string> {
  const blob = await (await fetch(src)).blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
