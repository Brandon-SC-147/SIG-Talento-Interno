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
      <div class="col-grow"></div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Nuevo" @click="openCreate" />
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      binary-state-sort
      @request="onRequest"
    >
      <template #body-cell-actions="{ row }">
        <q-td align="right">
          <q-btn size="sm" flat round icon="edit" @click="openEdit(row)" />
          <q-btn size="sm" flat round color="negative" icon="delete" @click="confirmDelete(row)" />
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width row flex-center q-gutter-sm q-pa-lg text-grey">
          <q-icon name="info" />
          <span>No hay datos</span>
        </div>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ dialogMode === 'edit' ? 'Editar' : 'Nuevo' }} colaborador</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <CollaboratorForm
            v-model="form"
            :mode="dialogMode"
            :loading="saving"
            :skill-options="skillOptions"
            @submit="handleSubmit"
            @cancel="closeDialog"
          />
        </q-card-section>
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

const $q = useQuasar()
const { notifyError, notifySuccess } = useApiError()

const store = useCollaboratorsStore()
const loading = computed(() => store.loading)
const rows = computed(() => store.items)
const pagination = computed(() => store.pagination)

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', sortable: true },
  { name: 'email', label: 'Email', field: 'email', sortable: true },
  { name: 'role', label: 'Rol', field: 'role', sortable: true },
  {
    name: 'skills',
    label: 'Competencias',
    field: (row) => (row.skills || []).map((s) => s.name || s).join(', '),
    sortable: false,
  },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const search = ref('')

async function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  try {
    await store.fetchList({ page, rowsPerPage, sortBy, descending, search: search.value })
  } catch (err) {
    notifyError(err, 'No se pudo cargar la lista de colaboradores')
  }
}

function onRefresh() {
  onRequest({ pagination: store.pagination })
}

onMounted(() => {
  onRefresh()
})

// Dialog y formulario
const dialog = ref(false)
const dialogMode = ref('create') // 'create' | 'edit'
const form = ref({ name: '', email: '', role: '', skills: [] })
const saving = ref(false)

const skillOptions = ref([
  // TODO: reemplazar por options desde store/skills
  { label: 'Liderazgo', value: 'leadership' },
  { label: 'Comunicación', value: 'communication' },
  { label: 'JavaScript', value: 'javascript' },
])

function openCreate() {
  dialogMode.value = 'create'
  form.value = { name: '', email: '', role: '', skills: [] }
  dialog.value = true
}

function openEdit(row) {
  dialogMode.value = 'edit'
  form.value = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    skills: (row.skills || []).map((s) => s.value || s.id || s),
  }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
}

async function handleSubmit(payload) {
  saving.value = true
  try {
    if (dialogMode.value === 'create') {
      await store.create(payload)
      notifySuccess('Colaborador creado')
    } else {
      await store.update(payload.id, payload)
      notifySuccess('Colaborador actualizado')
    }
    closeDialog()
    onRefresh()
  } catch (err) {
    notifyError(err, 'No se pudo guardar')
  } finally {
    saving.value = false
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: 'Eliminar',
    message: `¿Eliminar a ${row.name}?`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Eliminar' },
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
</script>
