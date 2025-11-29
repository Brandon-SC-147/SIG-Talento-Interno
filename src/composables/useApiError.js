/**
 * Manejo estandarizado de errores de API.
 * Devuelve un parser y una función para notificar.
 */
import { Notify } from 'quasar'

export function useApiError() {
  function parseError(err, fallback = 'Ocurrió un error') {
    const msg =
      err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback
    return msg
  }

  function notifyError(err, fallback) {
    const message = parseError(err, fallback)
    // Mostrar notificación amigable al usuario
    Notify.create({ type: 'negative', message, timeout: 5000 })
    console.error('[API Error]', message, err?.response || err)
    return message
  }

  function notifySuccess(message) {
    Notify.create({ type: 'positive', message, timeout: 3000 })
    console.debug('[Success]', message)
  }

  return { parseError, notifyError, notifySuccess }
}
