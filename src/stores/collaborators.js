import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { useAuthStore } from './auth'

export const useCollaboratorsStore = defineStore('collaborators', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    // Paginación servidor
    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
      sortBy: 'name',
      descending: false,
    },
    // Filtros básicos
    filters: {
      search: '',
      skillId: null,
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

    async fetchList({ page, rowsPerPage, sortBy, descending, search } = {}) {
      this.loading = true
      this.error = null
      this._ensureAuthHeader()
      try {
        const params = {
          page: page ?? this.pagination.page,
          limit: rowsPerPage ?? this.pagination.rowsPerPage,
          sortBy: sortBy ?? this.pagination.sortBy,
          order: (descending ?? this.pagination.descending) ? 'desc' : 'asc',
          search: search ?? this.filters.search ?? undefined,
        }
        const { data } = await api.get('/collaborators', { params })
        // Se asume respuesta { items: [], total: number }
        this.items = data?.items || []
        this.pagination = {
          ...this.pagination,
          page: params.page,
          rowsPerPage: params.limit,
          sortBy: params.sortBy,
          descending: (params.order || 'asc') === 'desc',
          rowsNumber: data?.total ?? this.pagination.rowsNumber,
        }
      } catch (err) {
        this.error = err
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
        const { data } = await api.post('/collaborators', payload)
        // Optimista: insertar al inicio
        this.items.unshift(data)
        this.pagination.rowsNumber += 1
        return data
      } catch (err) {
        this.error = err
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
        const { data } = await api.put(`/collaborators/${id}`, payload)
        const idx = this.items.findIndex((it) => it.id === id)
        if (idx !== -1) this.items[idx] = data
        return data
      } catch (err) {
        this.error = err
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
        await api.delete(`/collaborators/${id}`)
        this.items = this.items.filter((it) => it.id !== id)
        this.pagination.rowsNumber = Math.max(0, this.pagination.rowsNumber - 1)
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
