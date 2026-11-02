import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, footballOutline, personCircleOutline } from 'ionicons/icons';

import { TextPipe } from '../i18n/text.pipe';

/** Bottom tab bar of the logged-in area: Reservar, Mis reservas, Perfil. */
@Component({
  selector: 'pnk-shell',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, TextPipe],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="availability" href="/availability">
          <ion-icon name="football-outline" aria-hidden="true"></ion-icon>
          <ion-label>{{ 'tabs.book' | text }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="my-bookings" href="/my-bookings">
          <ion-icon name="calendar-outline" aria-hidden="true"></ion-icon>
          <ion-label>{{ 'tabs.myBookings' | text }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/profile">
          <ion-icon name="person-circle-outline" aria-hidden="true"></ion-icon>
          <ion-label>{{ 'tabs.profile' | text }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export default class ShellPage {
  constructor() {
    addIcons({ footballOutline, calendarOutline, personCircleOutline });
  }
}
