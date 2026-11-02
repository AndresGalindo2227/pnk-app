/** Mirrors of the OpenAPI schemas (Field, DayAvailability, Booking). They never leave data/. */
export interface FieldDto {
  id: number;
  name: string;
  fieldType: string;
  hourlyPrice: number;
  sectors: string[];
}

export interface DayAvailabilityDto {
  date: string;
  fields: { fieldId: number; name: string; hourlyPrice: number; slots: { startsAt: string; available: boolean }[] }[];
}

export interface BookingDto {
  id: number;
  code: string;
  field: { id: number; name: string };
  startsAt: string;
  endsAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  totalAmount: number;
  depositAmount: number;
  paymentStatus?: 'pending' | 'approved' | 'rejected' | null;
  canCancel: boolean;
  createdAt: string;
}
