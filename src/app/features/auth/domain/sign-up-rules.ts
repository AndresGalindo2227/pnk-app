import type { SignUpData } from './credentials';

/** Business rules of the sign-up form (mirror of the OpenAPI RegisterRequest schema). */
export const SIGN_UP_RULES = {
  minNameLength: 3,
  minPasswordLength: 8,
  maxPasswordLength: 72,
  phonePattern: /^3\d{9}$/,
} as const;

export type SignUpField = keyof SignUpData;

/** Returns the fields that break a rule; an empty list means the data is valid. */
export function invalidSignUpFields(data: SignUpData): SignUpField[] {
  const invalid: SignUpField[] = [];
  if (data.fullName.trim().length < SIGN_UP_RULES.minNameLength) invalid.push('fullName');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) invalid.push('email');
  if (!SIGN_UP_RULES.phonePattern.test(data.phone)) invalid.push('phone');
  if (
    data.password.length < SIGN_UP_RULES.minPasswordLength ||
    data.password.length > SIGN_UP_RULES.maxPasswordLength
  ) {
    invalid.push('password');
  }
  return invalid;
}
