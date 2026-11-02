import { CurrencyPipe, DatePipe } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { TextPipe } from '../../../core/i18n/text.pipe';

import { BookingConfirmStore } from './booking-confirm.store';

/** HU-04: summary, number of hours, deposit and the "Reservar" action. */
@Component({
  selector: 'pnk-booking-confirm-page',
  imports: [
    DatePipe,
    CurrencyPipe,
    TextPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner,
    IonText,
    IonNote,
  ],
  providers: [BookingConfirmStore],
  templateUrl: './booking-confirm.page.html',
  styleUrl: './booking-confirm.page.scss',
})
export default class BookingConfirmPage implements OnInit {
  protected readonly store = inject(BookingConfirmStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly start = this.route.snapshot.queryParamMap.get('start') ?? '';
  private readonly fieldId = Number(this.route.snapshot.queryParamMap.get('fieldId'));

  constructor() {
    // When the booking is created, go to its detail and drop this screen from the history.
    effect(() => {
      const view = this.store.view();
      if (view.status === 'done') {
        void this.router.navigate(['/bookings', view.booking.id], { replaceUrl: true, queryParams: { created: 1 } });
      }
    });
  }

  ngOnInit(): void {
    void this.store.init(this.fieldId);
  }

  endOf(start: string, hours: number): string {
    return new Date(new Date(start).getTime() + hours * 3_600_000).toISOString();
  }

  backToAvailability(): void {
    void this.router.navigate(['/availability'], { replaceUrl: true });
  }
}
