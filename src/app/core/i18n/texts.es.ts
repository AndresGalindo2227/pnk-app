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
} as const;
