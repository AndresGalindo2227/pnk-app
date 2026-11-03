import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
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
import type { ViewWillEnter } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircle, cloudOfflineOutline, hourglassOutline, timeOutline } from 'ionicons/icons';

import { BADGE_COLOR, badgeOf, needsReceipt } from '../../../core/booking/booking-badge';
import { errorMessage } from '../../../core/i18n/error-messages.es';
import { TextPipe } from '../../../core/i18n/text.pipe';
import { errorCodeOf, isAppError } from '../../../core/network/app-error';
import { ReceiptQueue, ReceiptSync } from '../../payments/domain/payments.ports';
import type { Booking } from '../domain/booking';
import { BookingsRepository } from '../domain/bookings.repository';
import { CancelBookingUseCase } from '../domain/cancel-booking.usecase';

type DetailView =
  | { readonly status: 'loading' }
  | {
      readonly status: 'loaded';
      readonly booking: Booking;
      readonly busy: boolean;
      readonly message?: string;
      /** The refresh failed without connection: the booking shown is the last one loaded. */
      readonly offline?: boolean;
    }
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
export default class BookingDetailPage implements ViewWillEnter {
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(BookingsRepository);
  private readonly cancelBooking = inject(CancelBookingUseCase);
  private readonly receiptQueue = inject(ReceiptQueue);

  protected readonly justCreated = signal(false);
  /** Result of scheduling the HU-07 reminder, sent by the confirmation screen. */
  protected readonly reminder = signal<string | null>(null);
  /** A receipt of this booking is waiting in the offline queue (HU-09). */
  protected readonly receiptQueued = signal(false);
  protected readonly view = signal<DetailView>({ status: 'loading' });
  protected readonly badgeColor = BADGE_COLOR;
  protected readonly badge = badgeOf;
  protected readonly needsReceipt = needsReceipt;

  constructor() {
    addIcons({ checkmarkCircle, cloudOfflineOutline, hourglassOutline, timeOutline });
    // When the queued receipt of this booking is finally sent, show "Pago en revisión" without leaving the screen.
    const stop = inject(ReceiptSync).onFlushed(() => void this.afterFlush());
    inject(DestroyRef).onDestroy(stop);
  }

  private async afterFlush(): Promise<void> {
    const shown = this.view();
    if (!this.receiptQueued() || shown.status !== 'loaded') return;
    const id = shown.booking.id;
    if ((await this.receiptQueue.all()).some((item) => item.bookingId === id)) return;
    this.receiptQueued.set(false);
    try {
      this.view.set({ status: 'loaded', booking: await this.repository.getById(id), busy: false });
    } catch {
      // still offline for GET: the next visit refreshes it
    }
  }

  /**
   * Ionic keeps this page alive and reuses it (e.g. "Volver a la reserva" after sending the receipt),
   * so the booking is read again every time the page is shown.
   */
  async ionViewWillEnter(): Promise<void> {
    const query = this.route.snapshot.queryParamMap;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.justCreated.set(query.has('created'));
    this.reminder.set(query.get('reminder'));
    this.receiptQueued.set((await this.receiptQueue.all()).some((item) => item.bookingId === id));
    const shown = this.view();
    if (shown.status !== 'loaded' || shown.booking.id !== id) {
      // Show the saved copy right away (if any) while the fresh one arrives: no blank screen.
      const cached = await this.repository.getCached(id);
      this.view.set(cached ? { status: 'loaded', booking: cached, busy: false } : { status: 'loading' });
    }
    try {
      const booking = await this.repository.getById(id);
      this.view.set({ status: 'loaded', booking, busy: false });
    } catch (error) {
      const offline = isAppError(error) && error.kind === 'network';
      const current = this.view();
      if (offline && current.status === 'loaded' && current.booking.id === id) {
        // Offline refresh: keep showing the booking already on screen instead of an empty error page.
        this.view.set({ ...current, busy: false, offline: true });
        return;
      }
      const cached = offline ? await this.repository.getCached(id) : null;
      if (cached) {
        this.view.set({ status: 'loaded', booking: cached, busy: false, offline: true });
      } else {
        this.view.set({ status: 'error', message: errorMessage(errorCodeOf(error)) });
      }
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
