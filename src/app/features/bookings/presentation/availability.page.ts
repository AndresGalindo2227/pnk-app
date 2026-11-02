import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { ViewWillEnter } from '@ionic/angular';
import { IonButton, IonContent, IonHeader, IonIcon, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline, informationCircleOutline } from 'ionicons/icons';

import { TextPipe } from '../../../core/i18n/text.pipe';

import { AvailabilityStore } from './availability.store';

/** HU-03: free and taken hours of every field for the selected day. */
@Component({
  selector: 'pnk-availability-page',
  imports: [
    DatePipe,
    CurrencyPipe,
    TextPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonSpinner,
    IonText,
    IonIcon,
  ],
  providers: [AvailabilityStore],
  templateUrl: './availability.page.html',
  styleUrl: './availability.page.scss',
})
export default class AvailabilityPage implements ViewWillEnter {
  protected readonly store = inject(AvailabilityStore);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ cloudOfflineOutline, informationCircleOutline });
  }

  /**
   * Ionic keeps tab pages alive, so ngOnInit runs only once. Availability changes every minute and is
   * never shown from cache (offline-sync.md): reload it every time the tab is shown.
   */
  ionViewWillEnter(): void {
    void this.store.load();
  }

  book(fieldId: number, start: string): void {
    void this.router.navigate(['/bookings/new'], { queryParams: { fieldId, start } });
  }
}
