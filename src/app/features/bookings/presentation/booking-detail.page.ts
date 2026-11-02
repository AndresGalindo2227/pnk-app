import { CurrencyPipe, DatePipe } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';

import { errorMessage } from '../../../core/i18n/error-messages.es';
import { TextPipe } from '../../../core/i18n/text.pipe';
import { errorCodeOf } from '../../../core/network/app-error';
import type { Booking } from '../domain/booking';
import { BookingsRepository } from '../domain/bookings.repository';
import { CancelBookingUseCase } from '../domain/cancel-booking.usecase';

type DetailView =
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly booking: Booking; readonly busy: boolean; readonly message?: string }
  | { readonly status: 'error'; readonly message: string };

/** Booking detail: success state after HU-04, status, amounts and cancellation (HU-06). */
@Component({
  selector: 'pnk-booking-detail-page',
  imports: [
    DatePipe,
    CurrencyPipe,
    RouterLink,
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
    IonBadge,
    IonButton,
    IonSpinner,
    IonText,
    IonNote,
    IonIcon,
  ],
  templateUrl: './booking-detail.page.html',
  styleUrl: './booking-confirm.page.scss',
})
export default class BookingDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(BookingsRepository);
  private readonly cancelBooking = inject(CancelBookingUseCase);

  protected readonly justCreated = this.route.snapshot.queryParamMap.has('created');
  protected readonly view = signal<DetailView>({ status: 'loading' });
  protected readonly statusColor: Record<string, string> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'medium',
    completed: 'medium',
    no_show: 'danger',
  };

  constructor() {
    addIcons({ checkmarkCircle });
  }

  async ngOnInit(): Promise<void> {
    try {
      const booking = await this.repository.getById(Number(this.route.snapshot.paramMap.get('id')));
      this.view.set({ status: 'loaded', booking, busy: false });
    } catch (error) {
      this.view.set({ status: 'error', message: errorMessage(errorCodeOf(error)) });
    }
  }

  async cancel(booking: Booking): Promise<void> {
    this.view.set({ status: 'loaded', booking, busy: true });
    try {
      this.view.set({ status: 'loaded', booking: await this.cancelBooking.execute(booking), busy: false });
    } catch (error) {
      this.view.set({ status: 'loaded', booking, busy: false, message: errorMessage(errorCodeOf(error)) });
    }
  }
}
