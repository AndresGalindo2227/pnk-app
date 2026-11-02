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
      code: 'Código de reserva',
      cancel: 'Cancelar reserva',
      seeMine: 'Ver mis reservas',
    },
    status: {
      pending: 'Pendiente de pago',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Jugada',
      no_show: 'No asistió',
    },
  },
} as const;
