import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const baseURL = import.meta?.env?.VITE_API_BASE_URL || 'https://api.example.com'
const api = axios.create({ baseURL })

export default defineBoot(({ app, router }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  // Interceptor para agregar token si existe
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Interceptor de respuesta: manejar 401
  api.interceptors.response.use(
    (resp) => resp,
    (error) => {
      const status = error?.response?.status
      if (status === 401) {
        // Borrar token y redirigir a login
        localStorage.removeItem('auth_token')
        if (router) {
          const path = router.currentRoute?.value?.fullPath || '/'
          router.push({ name: 'login', query: { redirect: path } })
        }
      }
      return Promise.reject(error)
    },
  )
})

export { api }
