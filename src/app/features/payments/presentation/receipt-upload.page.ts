import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonNote,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, checkmarkCircle, cloudUploadOutline, images, timeOutline } from 'ionicons/icons';

import { TextPipe } from '../../../core/i18n/text.pipe';

import { ReceiptUploadStore } from './receipt-upload.store';

/** HU-09: take or pick the photo of the transfer receipt and send it (queued when offline). */
@Component({
  selector: 'pnk-receipt-upload-page',
  imports: [
    CurrencyPipe,
    RouterLink,
    TextPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonButton,
    IonIcon,
    IonNote,
    IonSpinner,
    IonText,
  ],
  providers: [ReceiptUploadStore],
  templateUrl: './receipt-upload.page.html',
  styleUrl: './receipt-upload.page.scss',
})
export default class ReceiptUploadPage {
  protected readonly store = inject(ReceiptUploadStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly bookingId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly amount = Number(this.route.snapshot.queryParamMap.get('amount') ?? 0);

  constructor() {
    addIcons({ camera, images, checkmarkCircle, timeOutline, cloudUploadOutline });
  }
}
