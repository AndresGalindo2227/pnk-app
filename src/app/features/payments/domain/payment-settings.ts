import type { PaymentAccount } from './payment-account';

/** How the player can pay the bookings of this business (GET /config). */
export interface PaymentSettings {
  /** Accounts for a transfer + receipt photo. */
  readonly accounts: readonly PaymentAccount[];
  /** True when the business turned on online payments with Wompi in InvFox. */
  readonly onlinePayments: boolean;
}
