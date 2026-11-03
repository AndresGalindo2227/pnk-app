import { describe, expect, it } from 'vitest';

import { badgeOf, needsReceipt } from './booking-badge';

describe('badgeOf / needsReceipt', () => {
  it('asks for the receipt while no receipt was sent', () => {
    const booking = { status: 'pending', paymentStatus: null } as const;
    expect(badgeOf(booking)).toBe('pending');
    expect(needsReceipt(booking)).toBe(true);
  });

  it('shows "in review" and hides the upload button after the receipt is sent', () => {
    const booking = { status: 'pending', paymentStatus: 'pending' } as const;
    expect(badgeOf(booking)).toBe('in_review');
    expect(needsReceipt(booking)).toBe(false);
  });

  it('asks for a new receipt when the admin rejected it', () => {
    const booking = { status: 'pending', paymentStatus: 'rejected' } as const;
    expect(badgeOf(booking)).toBe('rejected');
    expect(needsReceipt(booking)).toBe(true);
  });

  it('uses the booking status once the booking is not pending', () => {
    expect(badgeOf({ status: 'confirmed', paymentStatus: 'approved' })).toBe('confirmed');
    expect(needsReceipt({ status: 'cancelled', paymentStatus: null })).toBe(false);
  });
});
