import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { TextPipe } from '../../../core/i18n/text.pipe';

/** HU-03 - placeholder until the feature is implemented. */
@Component({
  imports: [TextPipe, IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header>
      <ion-toolbar color="secondary"
        ><ion-title>{{ 'tabs.book' | text }}</ion-title></ion-toolbar
      >
    </ion-header>
    <ion-content class="ion-padding"><p>HU-03</p></ion-content>
  `,
})
export default class AvailabilityPage {}
