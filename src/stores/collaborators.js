import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { useAuthStore } from './auth'
import { Endpoints } from 'src/services/endpoints'

export const useCollaboratorsStore = defineStore('collaborators', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    // Paginación cliente (el backend actual no pagina)
    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
      sortBy: 'nombre',
      descending: false,
    },
    // Filtros básicos
    filters: {
      search: '',
      skillId: null,
      status: 'Activo', // 'Activo' | 'Inactivo' | null
    },
    // item seleccionado para edición
    current: null,
  }),
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
        // GET /api/Usuarios - devuelve array de usuarios
        const { data } = await api.get(Endpoints.usuarios.base)
        this.items = data || []
        this.pagination.rowsNumber = this.items.length
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
        const { data } = await api.get(Endpoints.usuarios.byId(id))
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
        const { data } = await api.post(Endpoints.usuarios.base, payload)
        this.items.unshift(data)
        this.pagination.rowsNumber += 1
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
        // PUT espera el objeto completo con id incluido
        await api.put(Endpoints.usuarios.byId(id), { ...payload, id })
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
        await api.delete(Endpoints.usuarios.byId(id))
        this.items = this.items.filter((it) => it.id !== id)
        this.pagination.rowsNumber = Math.max(0, this.pagination.rowsNumber - 1)
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // Asignar skill a un usuario
    async assignSkill(usuarioId, { skillId, nivelId, evaluadorId }) {
      this.loading = true
      this.error = null
      this._ensureAuthHeader()
      try {
        const { data } = await api.post(Endpoints.usuarios.assignSkill(usuarioId), {
          skillId,
          nivelId,
          evaluadorId,
        })
        return data
      } catch (err) {
        this.error = err?.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
