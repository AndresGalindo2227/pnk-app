import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

import { CheckoutBrowser } from '../domain/payments.ports';

/**
 * Adapter: opens the Wompi checkout in the in-app browser of the phone (Custom Tabs / SFSafariViewController)
 * or in a new tab on the web. The player "returns" when that browser closes or the app/tab is shown again.
 */
@Injectable({ providedIn: 'root' })
export class CapacitorCheckoutBrowser extends CheckoutBrowser {
  async open(url: string): Promise<void> {
    await Browser.open({ url });
  }

  onReturn(listener: () => void): () => void {
    const handles: Promise<{ remove: () => Promise<void> }>[] = [];
    if (Capacitor.isNativePlatform()) {
      handles.push(Browser.addListener('browserFinished', listener));
      handles.push(App.addListener('resume', listener));
      return () => handles.forEach((h) => void h.then((x) => x.remove()));
    }
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') listener();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }
}
