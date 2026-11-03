import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline } from 'ionicons/icons';

import { BADGE_COLOR, badgeOf } from '../../../core/booking/booking-badge';
import { TextPipe } from '../../../core/i18n/text.pipe';
import type { BookingScope } from '../domain/my-booking';

import { MyBookingsStore } from './my-bookings.store';

/** HU-05: the player's bookings, readable without connection. */
@Component({
  selector: 'pnk-my-bookings-page',
  imports: [
    DatePipe,
    CurrencyPipe,
    RouterLink,
    TextPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonBadge,
    IonSpinner,
    IonText,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
  ],
  providers: [MyBookingsStore],
  templateUrl: './my-bookings.page.html',
  styleUrl: './my-bookings.page.scss',
})
export default class MyBookingsPage implements ViewWillEnter {
  protected readonly store = inject(MyBookingsStore);
  protected readonly badgeColor = BADGE_COLOR;
  protected readonly badge = badgeOf;

  constructor() {
    addIcons({ cloudOfflineOutline });
  }

  /** Ionic keeps tab pages alive: refresh every time the tab is shown. */
  ionViewWillEnter(): void {
    void this.store.load();
  }

  changeScope(value: unknown): void {
    const scope: BookingScope = value === 'past' ? 'past' : 'upcoming';
    void this.store.setScope(scope);
  }

  async refresh(event: CustomEvent): Promise<void> {
    await this.store.load();
    await (event.target as unknown as { complete: () => Promise<void> }).complete();
  }

  minutesAgo(savedAt: string): number {
    return Math.max(0, Math.round((Date.now() - new Date(savedAt).getTime()) / 60_000));
  }
}
