/** Data the player types to log in. Plain domain types: no Angular, no HTTP. */
export interface Credentials {
  readonly email: string;
  readonly password: string;
}

/** Data the player types to create an account (HU-01). */
export interface SignUpData extends Credentials {
  readonly fullName: string;
  readonly phone: string;
}
