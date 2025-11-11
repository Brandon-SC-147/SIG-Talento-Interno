import { useQuasar } from 'quasar'

/**
 * Manejo estandarizado de errores de API.
 * Devuelve un parser y una función para notificar.
 */
export function useApiError() {
  const $q = useQuasar()

  function parseError(err, fallback = 'Ocurrió un error') {
    // Axios error shape: err.response?.data?.message || err.message
    const msg =
      err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback
    return msg
  }

  function notifyError(err, fallback) {
    const message = parseError(err, fallback)
    $q.notify({ type: 'negative', message })
    return message
  }

  function notifySuccess(message) {
    $q.notify({ type: 'positive', message })
  }

  return { parseError, notifyError, notifySuccess }
}
