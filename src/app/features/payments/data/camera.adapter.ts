import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { ReceiptCapturePort } from '../domain/payments.ports';
import type { CaptureSource, ReceiptPhoto } from '../domain/receipt';

/**
 * Adapter of ReceiptCapturePort with @capacitor/camera.
 * The camera permission is requested only when the player taps "Tomar foto" (just-in-time).
 * The photo is resized and compressed here (max 1280 px, quality 60) to stay under 2 MB.
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

    try {
      const photo = await Camera.getPhoto({
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        resultType: CameraResultType.DataUrl,
        quality: 60,
        width: 1280,
        correctOrientation: true,
      });
      return photo.dataUrl ? { dataUrl: photo.dataUrl } : null;
    } catch {
      return null; // the player closed the camera or the gallery
    }
  }
}
