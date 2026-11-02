import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { TextPipe } from '../../../core/i18n/text.pipe';
import { SessionService } from '../../../core/session/session.service';

/** Profile: player data and sign-out. */
@Component({
  selector: 'pnk-profile-page',
  imports: [TextPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton],
  template: `
    <ion-header>
      <ion-toolbar color="secondary"
        ><ion-title>{{ 'tabs.profile' | text }}</ion-title></ion-toolbar
      >
    </ion-header>
    <ion-content class="ion-padding">
      @if (session.player(); as player) {
        <ion-list>
          <ion-item
            ><ion-label
              ><h2>{{ player.fullName }}</h2>
              <p>{{ player.email }}</p>
              <p>{{ player.phone }}</p></ion-label
            ></ion-item
          >
        </ion-list>
      }
      <ion-button expand="block" color="danger" fill="outline" (click)="logout()">{{
        'auth.logout' | text
      }}</ion-button>
    </ion-content>
  `,
})
export default class ProfilePage {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await firstValueFrom(this.session.logout(), { defaultValue: undefined });
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
