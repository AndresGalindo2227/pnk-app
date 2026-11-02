import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonNote,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { TextPipe } from '../../../core/i18n/text.pipe';

import { AuthStore } from './auth.store';

/** Login screen. Renders AuthStore state and delegates the action to it. */
@Component({
  selector: 'pnk-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TextPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonSpinner,
    IonText,
    IonNote,
  ],
  providers: [AuthStore],
  templateUrl: './login.page.html',
  styleUrl: './auth.page.scss',
})
export default class LoginPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(AuthStore);
  protected readonly sessionExpired = this.route.snapshot.queryParamMap.has('expired');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (await this.store.submitLogin(this.form.getRawValue())) {
      await this.router.navigateByUrl('/availability', { replaceUrl: true });
    }
  }
}
