import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { useAuthStore } from './auth'
import { Endpoints } from 'src/services/endpoints'

export const useVacantesStore = defineStore('vacantes', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    current: null,
    // Matches para una vacante específica
    matches: [],
    matchesLoading: false,
  }),

  getters: {
    // Vacantes activas (urgentes primero)
    vacantesActivas: (state) => {
      return state.items
        .filter((v) => v.estado === 'Abierta')
        .sort((a, b) => {
          // Urgentes primero
          if (a.urgencia && !b.urgencia) return -1
          if (!a.urgencia && b.urgencia) return 1
          // Luego por fecha de inicio
          return new Date(a.fechaInicio) - new Date(b.fechaInicio)
        })
    },
  },

  actions: {
    _ensureAuthHeader() {
      const auth = useAuthStore()
      if (auth.token) {
        api.defaults.headers.common.Authorization = `Bearer ${auth.token}`
      }
    },

    async fetchList() {
      this.loading = true
      this.error = null
      this._ensureAuthHeader()
      try {
        const { data } = await api.get(Endpoints.vacantes.base)
        this.items = data || []
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchById(id) {
      this.loading = true
      this.error = null
      this._ensureAuthHeader()
      try {
        const { data } = await api.get(Endpoints.vacantes.byId(id))
        this.current = data
        return data
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async create(payload) {
      this.loading = true
      this.error = null
      this._ensureAuthHeader()
      try {
        const { data } = await api.post(Endpoints.vacantes.base, payload)
        this.items.unshift(data)
        return data
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async update(id, payload) {
      this.loading = true
      this.error = null
      this._ensureAuthHeader()
      try {
        await api.put(Endpoints.vacantes.byId(id), { ...payload, id })
        const idx = this.items.findIndex((it) => it.id === id)
        if (idx !== -1) this.items[idx] = { ...this.items[idx], ...payload }
        return this.items[idx]
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async remove(id) {
      this.loading = true
      this.error = null
      this._ensureAuthHeader()
      try {
        await api.delete(Endpoints.vacantes.byId(id))
        this.items = this.items.filter((it) => it.id !== id)
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // Asignar skill requerido a una vacante
    async assignSkill(vacanteId, { skillId, nivelId }) {
      this.loading = true
      this.error = null
      this._ensureAuthHeader()
      try {
        const { data } = await api.post(Endpoints.vacantes.assignSkill(vacanteId), {
          skillId,
          nivelId,
        })
        return data
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // Obtener matches/candidatos para una vacante
    async fetchMatches(vacanteId) {
      this.matchesLoading = true
      this._ensureAuthHeader()
      try {
        const { data } = await api.get(Endpoints.matches.byVacante(vacanteId))
        this.matches = data || []
        return this.matches
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.matchesLoading = false
      }
    },
  },
})
