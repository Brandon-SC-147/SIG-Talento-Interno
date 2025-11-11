import { defineStore } from 'pinia'
import { api } from 'boot/axios'

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token) {
      this.token = token || ''
      if (this.token) {
        localStorage.setItem(TOKEN_KEY, this.token)
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      } else {
        localStorage.removeItem(TOKEN_KEY)
        delete api.defaults.headers.common.Authorization
      }
    },

    async login({ email, password }) {
      this.loading = true
      this.error = null
      try {
        // Ajusta el endpoint de login según tu API
        const { data } = await api.post('/auth/login', { email, password })
        const token = data?.token
        this.setToken(token)
        // Opcional: cargar datos del usuario actual
        this.user = data?.user || null
        return data
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.setToken('')
    },

    // Llamar esto al boot si es necesario
    hydrateFromStorage() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        this.setToken(token)
      }
    },
  },
})
