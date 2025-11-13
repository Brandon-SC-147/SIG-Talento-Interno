import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { useAuthStore } from './auth'

const DEMO_API = import.meta?.env?.VITE_USE_FAKE_API === 'true' && !import.meta.env.PROD
const STORAGE_KEY = 'demo_collaborators'

function demoSeed() {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return JSON.parse(existing)
  const roles = ['Desarrollador', 'Analista', 'Líder Técnico', 'RRHH']
  const skills = [
    { id: 'leadership', name: 'Liderazgo' },
    { id: 'communication', name: 'Comunicación' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'sql', name: 'SQL' },
  ]
  const items = Array.from({ length: 24 }).map((_, i) => {
    const id = i + 1
    return {
      id,
      name: `Colaborador ${id}`,
      email: `col${id}@demo.com`,
      role: roles[id % roles.length],
      skills: [skills[id % skills.length]],
    }
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  return items
}

function demoSave(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function sleep(ms = 250) {
  return new Promise((r) => setTimeout(r, ms))
}

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
        if (DEMO_API) {
          await sleep()
          const all = demoSeed()
          const q = (search ?? this.filters.search ?? '').toString().toLowerCase().trim()
          let filtered = !q
            ? all
            : all.filter((it) =>
                [it.name, it.email, it.role].some((v) => v?.toLowerCase().includes(q)),
              )
          const sBy = sortBy ?? this.pagination.sortBy
          const desc = (descending ?? this.pagination.descending) ? -1 : 1
          filtered = filtered.sort((a, b) => (a[sBy] > b[sBy] ? 1 : -1) * desc)

          const p = page ?? this.pagination.page
          const limit = rowsPerPage ?? this.pagination.rowsPerPage
          const start = (p - 1) * limit
          const end = start + limit
          const pageItems = filtered.slice(start, end)

          this.items = pageItems
          this.pagination = {
            ...this.pagination,
            page: p,
            rowsPerPage: limit,
            sortBy: sBy,
            descending: desc === -1,
            rowsNumber: filtered.length,
          }
          this.filters.search = q
          return
        }
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
        if (DEMO_API) {
          await sleep()
          const all = demoSeed()
          const id = Math.max(0, ...all.map((i) => Number(i.id) || 0)) + 1
          const item = { id, ...payload }
          const updated = [item, ...all]
          demoSave(updated)
          // actualizar lista visible
          this.items.unshift(item)
          this.pagination.rowsNumber += 1
          return item
        }
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
        if (DEMO_API) {
          await sleep()
          const all = demoSeed()
          const idx = all.findIndex((it) => it.id === id)
          if (idx !== -1) {
            all[idx] = { ...all[idx], ...payload, id }
            demoSave(all)
          }
          const localIdx = this.items.findIndex((it) => it.id === id)
          if (localIdx !== -1) this.items[localIdx] = all[idx]
          return all[idx]
        }
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
        if (DEMO_API) {
          await sleep()
          const all = demoSeed()
          const updated = all.filter((it) => it.id !== id)
          demoSave(updated)
          this.items = this.items.filter((it) => it.id !== id)
          this.pagination.rowsNumber = Math.max(0, this.pagination.rowsNumber - 1)
          return
        }
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
