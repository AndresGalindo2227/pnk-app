import { Component, DestroyRef, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmark, copyOutline } from 'ionicons/icons';

import { TextPipe } from '../../../core/i18n/text.pipe';
import type { PaymentAccount } from '../domain/payment-account';
import { PaymentAccountsSource } from '../domain/payments.ports';

/** Where to pay the deposit: the business accounts, each with a button that copies the number. */
@Component({
  selector: 'pnk-payment-accounts',
  imports: [TextPipe, IonButton, IonIcon, IonSpinner],
  templateUrl: './payment-accounts.component.html',
  styleUrl: './payment-accounts.component.scss',
})
export class PaymentAccountsComponent {
  private readonly source = inject(PaymentAccountsSource);

  protected readonly accounts = signal<readonly PaymentAccount[] | null>(null);
  /** Number just copied: its button says "Copiado" for a moment. */
  protected readonly copied = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    addIcons({ copyOutline, checkmark });
    void this.source.load().then((list) => this.accounts.set(list));
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  async copy(account: PaymentAccount): Promise<void> {
    await copyText(account.number);
    this.copied.set(account.number);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(null), 2500);
  }
}

/** Clipboard API (secure WebView of Capacitor and https) with the old fallback for http in development. */
async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}
