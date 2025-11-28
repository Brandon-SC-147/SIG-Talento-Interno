<template>
  <q-page padding>
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="search"
          dense
          outlined
          clearable
          placeholder="Buscar por nombre o email"
          @keyup.enter="onRefresh"
        >
          <template #append>
            <q-btn flat icon="search" @click="onRefresh" :disable="loading" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="statusFilter"
          :options="statusOptions"
          dense
          outlined
          emit-value
          map-options
          label="Estado"
          @update:model-value="onRefresh"
        />
      </div>
      <div class="col-grow"></div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Nuevo" @click="openCreate" />
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="filteredRows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      binary-state-sort
      @request="onRequest"
    >
      <template #body-cell-nombre="{ row }">
        <q-td>
          <div class="row items-center q-gutter-xs no-wrap">
            <q-avatar size="32px" color="primary" text-color="white">
              {{ getInitials(row) }}
            </q-avatar>
            <div class="q-ml-sm">
              <div :class="rowIsInactive(row) ? 'text-grey-6' : ''">
                {{ row.nombre }} {{ row.apellido }}
              </div>
              <div class="text-caption text-grey">{{ row.puestoActual || 'Sin puesto' }}</div>
            </div>
            <q-chip
              v-if="rowIsInactive(row)"
              dense
              color="grey-7"
              text-color="white"
              size="sm"
              class="q-ml-sm"
            >
              Inactivo
            </q-chip>
          </div>
        </q-td>
      </template>

      <template #body-cell-disponibilidad="{ row }">
        <q-td class="text-center">
          <q-icon
            :name="row.disponibilidad ? 'check_circle' : 'cancel'"
            :color="row.disponibilidad ? 'positive' : 'grey'"
            size="sm"
          />
        </q-td>
      </template>

      <template #body-cell-skills="{ row }">
        <q-td>
          <div class="row q-gutter-xs" v-if="row.skills?.length">
            <q-chip
              v-for="skill in row.skills.slice(0, 3)"
              :key="skill.id || skill"
              dense
              size="sm"
              color="primary"
              text-color="white"
            >
              {{ skill.nombre || skill.name || skill }}
            </q-chip>
            <q-chip v-if="row.skills.length > 3" dense size="sm" color="grey" text-color="white">
              +{{ row.skills.length - 3 }}
            </q-chip>
          </div>
          <span v-else class="text-grey text-caption">Sin competencias</span>
        </q-td>
      </template>

      <template #body-cell-actions="{ row }">
        <q-td align="right">
          <q-btn size="sm" flat round icon="visibility" @click="openView(row)" color="info">
            <q-tooltip>Ver detalles</q-tooltip>
          </q-btn>
          <q-btn
            size="sm"
            flat
            round
            icon="edit"
            @click="openEdit(row)"
            :disable="rowIsInactive(row)"
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn
            size="sm"
            flat
            round
            color="negative"
            icon="delete"
            @click="confirmDelete(row)"
            :disable="rowIsInactive(row)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width row flex-center q-gutter-sm q-pa-lg text-grey">
          <q-icon name="info" size="md" />
          <span>No hay colaboradores registrados</span>
        </div>
      </template>
    </q-table>

    <!-- Dialog Crear/Editar -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 650px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <q-icon :name="dialogMode === 'edit' ? 'edit' : 'person_add'" size="sm" class="q-mr-sm" />
          <div class="text-h6">{{ dialogMode === 'edit' ? 'Editar' : 'Nuevo' }} colaborador</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pt-md" style="max-height: 70vh; overflow-y: auto">
          <CollaboratorForm
            v-model="form"
            :mode="dialogMode"
            :loading="saving"
            :skill-options="skillOptions"
            :role-options="roleOptions"
            @submit="handleSubmit"
            @cancel="closeDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Ver Detalles -->
    <q-dialog v-model="viewDialog">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <q-icon name="person" size="sm" class="q-mr-sm" />
          <div class="text-h6">Detalles del colaborador</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedRow">
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="56px">
                  {{ getInitials(selectedRow) }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-h6">
                  {{ selectedRow.nombre }} {{ selectedRow.apellido }}
                </q-item-label>
                <q-item-label caption>{{ selectedRow.puestoActual || 'Sin puesto' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip
                  :color="selectedRow.estado === 'Activo' ? 'positive' : 'grey'"
                  text-color="white"
                >
                  {{ selectedRow.estado }}
                </q-chip>
              </q-item-section>
            </q-item>

            <q-separator spaced />

            <q-item>
              <q-item-section avatar><q-icon name="email" color="grey" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Email</q-item-label>
                <q-item-label>{{ selectedRow.correo }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar><q-icon name="badge" color="grey" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Rol</q-item-label>
                <q-item-label>{{ getRoleName(selectedRow.rolId) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="selectedRow.cuenta">
              <q-item-section avatar><q-icon name="business" color="grey" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Cuenta / Proyecto</q-item-label>
                <q-item-label>{{ selectedRow.cuenta }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar><q-icon name="swap_horiz" color="grey" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Disponibilidad para movilidad</q-item-label>
                <q-item-label>
                  <q-icon
                    :name="selectedRow.disponibilidad ? 'check_circle' : 'cancel'"
                    :color="selectedRow.disponibilidad ? 'positive' : 'negative'"
                    size="xs"
                  />
                  {{ selectedRow.disponibilidad ? 'Disponible' : 'No disponible' }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator spaced />

            <q-item>
              <q-item-section>
                <q-item-label caption class="q-mb-sm">Competencias</q-item-label>
                <div class="row q-gutter-xs" v-if="selectedRow.skills?.length">
                  <q-chip
                    v-for="skill in selectedRow.skills"
                    :key="skill.id || skill"
                    color="primary"
                    text-color="white"
                    size="sm"
                  >
                    {{ skill.nombre || skill.name || skill }}
                  </q-chip>
                </div>
                <span v-else class="text-grey">Sin competencias asignadas</span>
              </q-item-section>
            </q-item>

            <q-item v-if="selectedRow.observaciones">
              <q-item-section>
                <q-item-label caption>Observaciones</q-item-label>
                <q-item-label>{{ selectedRow.observaciones }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" label="Editar" @click="openEditFromView" icon="edit" />
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCollaboratorsStore } from 'src/stores/collaborators'
import CollaboratorForm from 'src/components/collaborators/CollaboratorForm.vue'
import { useApiError } from 'src/composables/useApiError'
import { api } from 'boot/axios'
import { Endpoints } from 'src/services/endpoints'

const $q = useQuasar()
const { notifyError, notifySuccess } = useApiError()

const store = useCollaboratorsStore()
const loading = computed(() => store.loading)
const rows = computed(() => store.items)
const pagination = computed(() => store.pagination)

// Filtro local
const filteredRows = computed(() => {
  let result = rows.value

  // Filtro por búsqueda
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.nombre?.toLowerCase().includes(s) ||
        r.apellido?.toLowerCase().includes(s) ||
        r.correo?.toLowerCase().includes(s),
    )
  }

  // Filtro por estado
  if (statusFilter.value === 'Activo') {
    result = result.filter((r) => r.estado === 'Activo')
  } else if (statusFilter.value === 'Inactivo') {
    result = result.filter((r) => r.estado === 'Inactivo')
  }

  return result
})

const columns = [
  { name: 'nombre', label: 'Colaborador', field: 'nombre', sortable: true, align: 'left' },
  { name: 'correo', label: 'Email', field: 'correo', sortable: true, align: 'left' },
  {
    name: 'rolId',
    label: 'Rol',
    field: 'rolId',
    sortable: true,
    align: 'left',
    format: (val) => getRoleName(val),
  },
  {
    name: 'disponibilidad',
    label: 'Disponible',
    field: 'disponibilidad',
    sortable: true,
    align: 'center',
  },
  { name: 'skills', label: 'Competencias', field: 'skills', sortable: false, align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const search = ref('')
const statusOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Inactivo', value: 'Inactivo' },
  { label: 'Todos', value: null },
]
const statusFilter = ref('Activo')

// Roles
const roleOptions = ref([
  { label: 'Colaborador', value: 3 },
  { label: 'Líder', value: 2 },
  { label: 'RRHH / Admin', value: 1 },
])

function getRoleName(rolId) {
  const role = roleOptions.value.find((r) => r.value === rolId)
  return role?.label || `Rol ${rolId}`
}

function getInitials(row) {
  const n = row.nombre?.charAt(0) || ''
  const a = row.apellido?.charAt(0) || ''
  return (n + a).toUpperCase() || '?'
}

async function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  try {
    await store.fetchList({
      page,
      rowsPerPage,
      sortBy,
      descending,
      search: search.value,
      status: statusFilter.value,
    })
  } catch (err) {
    notifyError(err, 'No se pudo cargar la lista de colaboradores')
  }
}

function onRefresh() {
  onRequest({ pagination: store.pagination })
}

onMounted(async () => {
  onRefresh()
  await loadSkills()
})

// Skills desde backend
const skillOptions = ref([])

async function loadSkills() {
  try {
    const { data } = await api.get(Endpoints.skills.base)
    skillOptions.value = (data || []).map((s) => ({
      label: s.nombre || s.name,
      value: s.id,
      category: s.tipo || s.category || 'General',
    }))
  } catch {
    // Fallback si no hay endpoint de skills
    skillOptions.value = [
      { label: 'Liderazgo', value: 1, category: 'Blanda' },
      { label: 'Comunicación', value: 2, category: 'Blanda' },
      { label: 'JavaScript', value: 3, category: 'Técnica' },
      { label: 'Python', value: 4, category: 'Técnica' },
      { label: 'SQL', value: 5, category: 'Técnica' },
      { label: 'Trabajo en equipo', value: 6, category: 'Blanda' },
    ]
  }
}

// Dialog y formulario
const dialog = ref(false)
const dialogMode = ref('create')
const form = ref(getDefaultForm())
const saving = ref(false)

// Dialog ver detalles
const viewDialog = ref(false)
const selectedRow = ref(null)

function getDefaultForm() {
  return {
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    puestoActual: '',
    rolId: 3,
    cuenta: '',
    estado: 'Activo',
    skills: [],
    disponibilidad: true,
    fechaDisponibilidad: '',
    observaciones: '',
  }
}

function openCreate() {
  dialogMode.value = 'create'
  form.value = getDefaultForm()
  dialog.value = true
}

function openEdit(row) {
  dialogMode.value = 'edit'
  form.value = {
    id: row.id,
    nombre: row.nombre || '',
    apellido: row.apellido || '',
    correo: row.correo || '',
    puestoActual: row.puestoActual || '',
    rolId: row.rolId || 3,
    cuenta: row.cuenta || '',
    estado: row.estado || 'Activo',
    skills: (row.skills || []).map((s) => s.id || s.value || s),
    disponibilidad: row.disponibilidad ?? true,
    fechaDisponibilidad: row.fechaDisponibilidad || '',
    observaciones: row.observaciones || '',
  }
  dialog.value = true
}

function openView(row) {
  selectedRow.value = row
  viewDialog.value = true
}

function openEditFromView() {
  viewDialog.value = false
  if (selectedRow.value) {
    openEdit(selectedRow.value)
  }
}

function closeDialog() {
  dialog.value = false
}

async function handleSubmit(payload) {
  saving.value = true
  try {
    if (dialogMode.value === 'create') {
      await store.create(payload)
      notifySuccess('Colaborador creado exitosamente')
    } else {
      await store.update(payload.id, payload)
      notifySuccess('Colaborador actualizado exitosamente')
    }
    closeDialog()
    onRefresh()
  } catch (err) {
    notifyError(err, 'No se pudo guardar el colaborador')
  } finally {
    saving.value = false
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar a ${row.nombre} ${row.apellido}?`,
    cancel: { flat: true, label: 'Cancelar' },
    persistent: true,
    ok: { color: 'negative', label: 'Eliminar', icon: 'delete' },
  }).onOk(async () => {
    try {
      await store.remove(row.id)
      notifySuccess('Colaborador eliminado')
      onRefresh()
    } catch (err) {
      notifyError(err, 'No se pudo eliminar')
    }
  })
}

function rowIsInactive(row) {
  return row?.estado === 'Inactivo'
}
</script>
