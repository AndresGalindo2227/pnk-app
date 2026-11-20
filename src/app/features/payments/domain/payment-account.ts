/** Account where the player pays the deposit, registered by the business in InvFox. */
export interface PaymentAccount {
  /** Nequi, Daviplata, Bancolombia, Llave Bre-B… */
  readonly entity: string;
  /** Celular, Ahorros, Corriente, Llave */
  readonly accountType: string;
  /** Phone, account number or key, exactly as the player must type it. */
  readonly number: string;
  readonly holder: string;
  readonly holderDocument: string | null;
}
