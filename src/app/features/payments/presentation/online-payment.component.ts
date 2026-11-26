import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { IonButton, IonIcon, IonSpinner, IonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cardOutline, checkmarkCircle, refreshOutline } from 'ionicons/icons';

import { errorMessage } from '../../../core/i18n/error-messages.es';
import { TextPipe } from '../../../core/i18n/text.pipe';
import { errorCodeOf } from '../../../core/network/app-error';
import type { OnlinePaymentChoice, OnlinePaymentOption } from '../domain/online-payment';
import { onlinePaymentChoices } from '../domain/online-payment';
import { CheckoutBrowser, OnlinePaymentsRemote, PaymentSettingsSource } from '../domain/payments.ports';

type OnlineView =
  | { readonly status: 'idle'; readonly message?: string }
  | { readonly status: 'opening' }
  | { readonly status: 'waiting'; readonly checking: boolean; readonly amount: number }
  | { readonly status: 'paid' };

/** How often and for how long the screen asks the API whether Wompi already approved the payment. */
const POLL_EVERY_MS = 5000;
const POLL_FOR_MS = 3 * 60 * 1000;

/**
 * "Pagar en línea" (Wompi): the player picks the deposit or the total, pays in the Wompi checkout
 * and comes back; the booking is confirmed by the Wompi event, this screen only waits for it.
 */
@Component({
  selector: 'pnk-online-payment',
  imports: [CurrencyPipe, TextPipe, IonButton, IonIcon, IonSpinner, IonText],
  templateUrl: './online-payment.component.html',
  styleUrl: './online-payment.component.scss',
})
export class OnlinePaymentComponent {
  readonly bookingId = input.required<number>();
  readonly totalAmount = input.required<number>();
  readonly depositAmount = input.required<number>();
  readonly paidAmount = input.required<number>();
  /** Emitted when the API reports a new payment: the parent reloads the booking. */
  readonly paid = output<void>();

  private readonly settings = inject(PaymentSettingsSource);
  private readonly remote = inject(OnlinePaymentsRemote);
  private readonly browser = inject(CheckoutBrowser);

  protected readonly enabled = signal(false);
  protected readonly choices = computed<OnlinePaymentChoice[]>(() =>
    onlinePaymentChoices(this.totalAmount(), this.depositAmount(), this.paidAmount()),
  );
  protected readonly selected = signal<OnlinePaymentOption>('deposit');
  protected readonly view = signal<OnlineView>({ status: 'idle' });

  private timer: ReturnType<typeof setInterval> | undefined;
  private waitingSince = 0;
  private stopReturn: (() => void) | null = null;

  constructor() {
    addIcons({ cardOutline, checkmarkCircle, refreshOutline });
    void this.settings.load().then((s) => this.enabled.set(s.onlinePayments));
    inject(DestroyRef).onDestroy(() => this.stopWaiting());
  }

  /** The option on screen: the one chosen, or the only one left (e.g. only the balance). */
  protected chosen(): OnlinePaymentChoice | undefined {
    const list = this.choices();
    return list.find((c) => c.option === this.selected()) ?? list[list.length - 1];
  }

  async pay(): Promise<void> {
    const choice = this.chosen();
    if (!choice) return;
    this.view.set({ status: 'opening' });
    try {
      const checkout = await this.remote.start(this.bookingId(), choice.option);
      this.startWaiting(checkout.amount);
      await this.browser.open(checkout.checkoutUrl);
    } catch (error) {
      this.stopWaiting();
      this.view.set({ status: 'idle', message: errorMessage(errorCodeOf(error)) });
    }
  }

  /** "Ya pagué": asks right away instead of waiting for the next round. */
  async check(): Promise<void> {
    const current = this.view();
    if (current.status !== 'waiting' || current.checking) return;
    this.view.set({ ...current, checking: true });
    try {
      const result = await this.remote.check(this.bookingId());
      if (result.paidAmount > this.paidAmount()) {
        this.stopWaiting();
        this.view.set({ status: 'paid' });
        this.paid.emit();
        return;
      }
    } catch {
      // no signal for a moment: the next round asks again
    }
    const still = this.view();
    if (still.status === 'waiting') this.view.set({ ...still, checking: false });
    if (Date.now() - this.waitingSince > POLL_FOR_MS) this.stopPolling();
  }

  /** Back to choosing (the player closed Wompi without paying). */
  cancelWaiting(): void {
    this.stopWaiting();
    this.view.set({ status: 'idle' });
  }

  private startWaiting(amount: number): void {
    this.stopWaiting();
    this.waitingSince = Date.now();
    this.view.set({ status: 'waiting', checking: false, amount });
    this.timer = setInterval(() => void this.check(), POLL_EVERY_MS);
    this.stopReturn = this.browser.onReturn(() => void this.check());
  }

  private stopPolling(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private stopWaiting(): void {
    this.stopPolling();
    this.stopReturn?.();
    this.stopReturn = null;
  }
}
