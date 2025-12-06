/**
 * Manejo estandarizado de errores de API.
 * Devuelve un parser y una función para notificar.
 */
export function useApiError() {
  function parseError(err, fallback = 'Ocurrió un error') {
    // Axios error shape: err.response?.data?.message || err.message
    const msg =
      err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback
    return msg
  }

  function notifyError(err, fallback) {
    const message = parseError(err, fallback)
    // Notificaciones deshabilitadas temporalmente
    console.error('[API Error]', message)
    return message
  }

  function notifySuccess(message) {
    // Notificaciones deshabilitadas temporalmente
    console.log('[Success]', message)
  }

  return { parseError, notifyError, notifySuccess }
}
