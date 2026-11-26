/** What the player chooses to pay online: the deposit or everything that is left. */
export type OnlinePaymentOption = 'deposit' | 'total';

export interface OnlinePaymentChoice {
  readonly option: OnlinePaymentOption;
  readonly amount: number;
}

/** Signed Wompi checkout returned by the API for one attempt. */
export interface OnlineCheckout {
  readonly reference: string;
  readonly amount: number;
  readonly checkoutUrl: string;
}

/** What the API knows after asking Wompi again. */
export interface OnlinePaymentCheck {
  readonly bookingStatus: string;
  readonly paidAmount: number;
}

/**
 * Same rule as pnk-api (OnlinePayment::options): the deposit is offered while it is not covered,
 * and the rest of the booking always. Amounts are integers of COP.
 */
export function onlinePaymentChoices(total: number, deposit: number, paid: number): OnlinePaymentChoice[] {
  const balance = Math.max(0, total - paid);
  if (balance === 0) return [];
  const choices: OnlinePaymentChoice[] = [];
  if (paid < deposit) choices.push({ option: 'deposit', amount: deposit - paid });
  choices.push({ option: 'total', amount: balance });
  return choices;
}
