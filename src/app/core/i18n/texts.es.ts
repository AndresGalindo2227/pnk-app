/**
 * Catalog of every user-facing text of the app (Spanish, es-CO).
 * Keys are English and namespaced by feature; values are what the player reads.
 * See pnk-docs/02-code-and-ui/i18n.md
 */
export const TEXTS_ES = {
  common: {
    appName: 'PANENKA Booking',
    retry: 'Reintentar',
    loading: 'Cargando…',
    offline: 'Sin conexión. Mostrando datos guardados.',
    noConnection: 'Sin conexión a internet.',
    back: 'Volver',
  },
  tabs: {
    book: 'Reservar',
    myBookings: 'Mis reservas',
    profile: 'Perfil',
  },
  auth: {
    login: {
      title: 'Iniciar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      submit: 'Ingresar',
      noAccount: '¿No tienes cuenta? Regístrate',
    },
    signUp: {
      title: 'Crear cuenta',
      fullName: 'Nombre completo',
      phone: 'Celular',
      passwordHint: 'Mínimo 8 caracteres',
      submit: 'Crear cuenta',
      hasAccount: '¿Ya tienes cuenta? Inicia sesión',
    },
    validation: {
      required: 'Este campo es obligatorio.',
      email: 'Escribe un correo válido.',
      phone: 'Escribe un celular de 10 dígitos que empiece por 3.',
      passwordLength: 'La contraseña debe tener mínimo 8 caracteres.',
      nameLength: 'Escribe tu nombre completo.',
    },
    sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo.',
    logout: 'Cerrar sesión',
  },
  myBookings: {
    title: 'Mis reservas',
    upcoming: 'Próximas',
    past: 'Pasadas',
    empty: 'Todavía no tienes reservas.',
    stale: 'Sin conexión. Mostrando datos guardados, actualizado hace',
    offlineNoCopy: 'Sin conexión y sin datos guardados. Conéctate para ver tus reservas.',
  },
  payments: {
    receipt: {
      title: 'Subir comprobante',
      upload: 'Subir comprobante de pago',
      amount: 'Abono a pagar:',
      hint: 'Toma una foto clara de la transferencia de Nequi, Daviplata o Bancolombia.',
      takePhoto: 'Tomar foto',
      gallery: 'Galería',
      previewAlt: 'Foto del comprobante',
      send: 'Enviar comprobante',
      uploaded: 'Comprobante enviado. Lo revisaremos pronto.',
      queued: 'Sin señal: guardamos el comprobante y lo enviaremos automáticamente cuando vuelva la conexión.',
      offlineNote: 'Si no tienes señal, lo enviaremos automáticamente cuando vuelva la conexión.',
      cameraDenied: 'No diste permiso para la cámara. Puedes elegir la foto desde la galería.',
      backToBooking: 'Volver a la reserva',
      inReview: 'Recibimos tu comprobante. PANENKA lo revisará y confirmará tu reserva.',
      queuedHere: 'Tu comprobante está guardado y se enviará automáticamente cuando vuelva la conexión.',
      rejectedHint: 'Tu comprobante fue rechazado. Envía una foto nueva y clara de la transferencia.',
    },
  },
  bookings: {
    availability: {
      title: 'Disponibilidad',
      pickDate: 'Elige el día',
      sectorRule: 'La Cancha 9 usa el espacio de la 5A, 5B y 5C: si una de ellas está reservada, la 9 queda ocupada.',
      hour: 'Hora',
      offline: 'Sin conexión. La disponibilidad cambia cada minuto, así que necesitas internet para verla.',
      empty: 'No hay horarios libres este día. Prueba con el día siguiente.',
    },
    slot: { free: 'Libre', taken: 'Ocupado' },
    confirm: {
      title: 'Confirmar reserva',
      hours: '¿Cuántas horas?',
      total: 'Total de la reserva',
      deposit: 'Abono requerido (50 %)',
      cancelRule: 'Puedes cancelar hasta 3 horas antes del partido.',
      pickAnother: 'Elegir otra hora',
      submit: 'Reservar',
    },
    detail: {
      title: 'Detalle de reserva',
      created: '¡Reserva creada!',
      reminder: 'Te recordaremos 1 hora antes del partido.',
      reminderDenied:
        'La reserva quedó guardada. Para recibir el recordatorio, activa las notificaciones de PANENKA en los ajustes del celular.',
      code: 'Código de reserva',
      cancel: 'Cancelar reserva',
      seeMine: 'Ver mis reservas',
      offline: 'Sin conexión. Mostrando los últimos datos de esta reserva.',
    },
    status: {
      pending: 'Pendiente de pago',
      in_review: 'Pago en revisión',
      rejected: 'Comprobante rechazado',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Jugada',
      no_show: 'No asistió',
    },
  },
} as const;
