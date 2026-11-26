import { describe, expect, it } from 'vitest';

import { onlinePaymentChoices } from './online-payment';

describe('onlinePaymentChoices', () => {
  it('offers the deposit and the total when nothing is paid', () => {
    expect(onlinePaymentChoices(70000, 35000, 0)).toEqual([
      { option: 'deposit', amount: 35000 },
      { option: 'total', amount: 70000 },
    ]);
  });

  it('offers only the balance once the deposit is paid', () => {
    expect(onlinePaymentChoices(70000, 35000, 35000)).toEqual([{ option: 'total', amount: 35000 }]);
  });

  it('offers nothing when the booking is fully paid', () => {
    expect(onlinePaymentChoices(70000, 35000, 70000)).toEqual([]);
  });
});
