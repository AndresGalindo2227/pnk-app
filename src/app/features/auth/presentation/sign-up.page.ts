import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonNote,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { TextPipe } from '../../../core/i18n/text.pipe';
import { SIGN_UP_RULES } from '../domain/sign-up-rules';

import { AuthStore } from './auth.store';

/** HU-01 sign-up screen. Form validators mirror the domain rules (SIGN_UP_RULES). */
@Component({
  selector: 'pnk-sign-up-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TextPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonInput,
    IonButton,
    IonSpinner,
    IonNote,
  ],
  providers: [AuthStore],
  templateUrl: './sign-up.page.html',
  styleUrl: './auth.page.scss',
})
export default class SignUpPage {
  private readonly router = inject(Router);
  protected readonly store = inject(AuthStore);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(SIGN_UP_RULES.minNameLength)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(SIGN_UP_RULES.phonePattern)]],
    password: ['', [Validators.required, Validators.minLength(SIGN_UP_RULES.minPasswordLength)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (await this.store.submitSignUp(this.form.getRawValue())) {
      await this.router.navigateByUrl('/availability', { replaceUrl: true });
    }
  }
}
