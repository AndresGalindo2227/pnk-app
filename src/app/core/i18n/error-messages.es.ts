/**
 * User message for each stable error code returned by pnk-api.
 * The code decides the message, never the technical `message` of the API.
 * See the error catalog in pnk-docs/03-api-and-data/README.md
 */
export const ERROR_MESSAGES_ES: Readonly<Record<string, string>> = {
  SLOT_IN_THE_PAST: 'Esa hora ya pasó. Elige otra.',
  SLOT_ALREADY_TAKEN: 'Alguien reservó esa hora hace un momento. Elige otra.',
  CANCELLATION_WINDOW_CLOSED: 'Solo puedes cancelar hasta 3 horas antes del partido.',
  BOOKING_NOT_CANCELLABLE: 'Esta reserva ya no se puede cancelar.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  EMAIL_ALREADY_REGISTERED: 'Ese correo ya está registrado.',
  PHONE_ALREADY_REGISTERED: 'Ese celular ya está registrado.',
  SESSION_EXPIRED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  TOO_MANY_REQUESTS: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  NOT_FOUND: 'No encontramos lo que buscas.',
  FILE_TOO_LARGE: 'La foto pesa más de 2 MB.',
  VALIDATION_ERROR: 'Revisa los datos marcados.',
  NETWORK: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.',
  UNKNOWN: 'Algo salió mal. Inténtalo de nuevo.',
};

/** Returns the user message for an error code, falling back to the generic one. */
export function errorMessage(code: string): string {
  return ERROR_MESSAGES_ES[code] ?? ERROR_MESSAGES_ES['UNKNOWN'];
}
