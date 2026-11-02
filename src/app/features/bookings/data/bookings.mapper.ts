import type { DayAvailability } from '../domain/availability';
import type { Booking } from '../domain/booking';
import type { Field } from '../domain/field';

import type { BookingDto, DayAvailabilityDto, FieldDto } from './bookings.dto';

export function toField(dto: FieldDto): Field {
  return {
    id: dto.id,
    name: dto.name,
    fieldType: dto.fieldType,
    hourlyPrice: dto.hourlyPrice,
    sectors: [...dto.sectors],
  };
}

export function toDayAvailability(dto: DayAvailabilityDto): DayAvailability {
  return {
    date: dto.date,
    fields: dto.fields.map((f) => ({
      fieldId: f.fieldId,
      name: f.name,
      hourlyPrice: f.hourlyPrice,
      slots: f.slots.map((s) => ({ startsAt: s.startsAt, available: s.available })),
    })),
  };
}

export function toBooking(dto: BookingDto): Booking {
  return {
    id: dto.id,
    code: dto.code,
    fieldId: dto.field.id,
    fieldName: dto.field.name,
    startsAt: dto.startsAt,
    endsAt: dto.endsAt,
    status: dto.status,
    totalAmount: dto.totalAmount,
    depositAmount: dto.depositAmount,
    paymentStatus: dto.paymentStatus ?? null,
    canCancel: dto.canCancel,
  };
}
