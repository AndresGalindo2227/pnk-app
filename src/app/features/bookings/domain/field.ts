/** A bookable field (Cancha 5A, 5B, 5C or 9) with its hourly price in COP. */
export interface Field {
  readonly id: number;
  readonly name: string;
  readonly fieldType: string;
  readonly hourlyPrice: number;
  readonly sectors: readonly string[];
}
