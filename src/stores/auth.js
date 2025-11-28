import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Endpoints } from 'src/services/endpoints'

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    // user: { id, name, email, role }
    user: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    // Redirección por rol: admin | leader | collaborator
    homeByRole(role) {
      const r = (role || this.user?.role || '').toString().toLowerCase()
      if (r === 'admin' || r === 'rrhh' || r === 'hr' || r === 'administrator')
        return '/dashboard/rrhh'
      if (r === 'leader' || r === 'líder' || r === 'lider') return '/dashboard/lider'
      return '/colaboradores'
    },

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
        // Backend .NET devuelve { token, userId, nombre, email, rolId }
        const { data } = await api.post(Endpoints.auth.login, {
          email,
          password,
        })
        // Soportar ambos formatos: objeto con token o token directo (string)
        const token = typeof data === 'string' ? data : data.token
        this.setToken(token)
        // Si el backend devuelve datos del usuario, usarlos; sino decodificar JWT
        if (typeof data === 'object' && data.userId) {
          this.user = {
            id: data.userId,
            name: data.nombre,
            email: data.email,
            role: data.rolId,
          }
        } else {
          this.user = this.decodeToken(token)
        }
        return { token, user: this.user }
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async register({ nombre, apellido, email, password, puesto, rolId }) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post(Endpoints.auth.register, {
          nombre,
          apellido,
          email,
          password,
          puesto,
          rolId: rolId || 1,
        })
        return data
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // Decodificar JWT para obtener info del usuario
    decodeToken(token) {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(window.atob(base64))
        return {
          id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        }
      } catch {
        return null
      }
    },

    // Login demo sin API (temporal)
    async demoLogin() {
      this.loading = true
      this.error = null
      try {
        // Simular delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        const fakeToken = 'demo-token-' + Date.now()
        const fakeUser = { id: 1, name: 'Usuario Demo', email: 'demo@example.com', role: 'admin' }
        this.setToken(fakeToken)
        this.user = fakeUser
        return { token: fakeToken, user: fakeUser }
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
        this.user = this.decodeToken(token)
      }
    },
  },
})
