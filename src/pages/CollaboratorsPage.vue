<template>
  <q-page padding>
    <div class="row q-mb-md justify-between items-center">
      <div class="text-h5">Colaboradores</div>
      <div>
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Colaborador"
          @click="openCreateDialog"
          class="q-mr-sm"
        />
        <q-btn
          color="secondary"
          icon="cloud_upload"
          label="Carga Masiva"
          @click="showBulkUploadDialog = true"
        />
      </div>
    </div>

    <q-table
      :rows="store.collaborators"
      :columns="columns"
      row-key="id"
      :loading="store.loading"
      v-model:pagination="pagination"
      @request="onRequest"
      binary-state-sort
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            color="primary"
            icon="edit"
            size="sm"
            @click="editCollaborator(props.row)"
          />
          <q-btn
            flat
            round
            color="negative"
            icon="delete"
            size="sm"
            @click="deleteCollaborator(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo para crear/editar -->
    <q-dialog v-model="showDialog" persistent>
      <collaborator-form
        :initial-data="selectedCollaborator"
        :is-edit="!!selectedCollaborator"
        @save="handleSave"
        @cancel="showDialog = false"
      />
    </q-dialog>

    <!-- Diálogo para Carga Masiva -->
    <q-dialog v-model="showBulkUploadDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Carga Masiva de Colaboradores</div>
          <div class="text-caption text-grey">
            Sube un archivo Excel (.xlsx) con los datos de los colaboradores.
          </div>
        </q-card-section>

        <q-card-section>
          <q-file
            v-model="bulkFile"
            label="Seleccionar archivo Excel"
            accept=".xlsx, .xls"
            outlined
            counter
            max-files="1"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            label="Subir"
            color="primary"
            @click="handleBulkUpload"
            :loading="store.loading"
            :disable="!bulkFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCollaboratorsStore } from 'src/stores/collaborators'
import CollaboratorForm from 'components/collaborators/CollaboratorForm.vue'

const $q = useQuasar()
const store = useCollaboratorsStore()

const filter = ref('')
const showDialog = ref(false)
const showBulkUploadDialog = ref(false)
const bulkFile = ref(null)
const selectedCollaborator = ref(null)

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = [
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: (row) => row.nombre,
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'apellido', align: 'left', label: 'Apellido', field: 'apellido', sortable: true },
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'cargo', align: 'left', label: 'Cargo', field: 'cargo', sortable: true },
  {
    name: 'departamento',
    align: 'left',
    label: 'Departamento',
    field: 'departamento',
    sortable: true,
  },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
]

onMounted(() => {
  onRequest({
    pagination: pagination.value,
  })
})

function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  store
    .fetchCollaborators({ page, perPage: rowsPerPage, sortBy, descending, filter: filter.value })
    .then(() => {
      pagination.value.rowsNumber = store.totalCollaborators // Asumiendo que el store tiene totalCollaborators
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
    })
}

function openCreateDialog() {
  selectedCollaborator.value = null
  showDialog.value = true
}

function editCollaborator(row) {
  selectedCollaborator.value = { ...row }
  showDialog.value = true
}

async function handleSave(collaboratorData) {
  let res
  if (selectedCollaborator.value) {
    res = await store.updateCollaborator(selectedCollaborator.value.id, collaboratorData)
  } else {
    res = await store.createCollaborator(collaboratorData)
  }

  if (res.success) {
    $q.notify({
      color: 'positive',
      message: 'Colaborador guardado correctamente',
      icon: 'check',
    })
    showDialog.value = false
    onRequest({ pagination: pagination.value })
  } else {
    $q.notify({
      color: 'negative',
      message: res.error,
      icon: 'report_problem',
    })
  }
}

function deleteCollaborator(row) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de que quieres eliminar este colaborador?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const res = await store.deleteCollaborator(row.id)
    if (res.success) {
      $q.notify({
        color: 'positive',
        message: 'Colaborador eliminado',
        icon: 'delete',
      })
      onRequest({ pagination: pagination.value })
    } else {
      $q.notify({
        color: 'negative',
        message: res.error,
        icon: 'report_problem',
      })
    }
  })
}

async function handleBulkUpload() {
  if (!bulkFile.value) return

  const res = await store.uploadBulkCollaborators(bulkFile.value)

  if (res.success) {
    $q.notify({
      color: 'positive',
      message: 'Carga masiva completada con éxito',
      icon: 'check',
    })
    showBulkUploadDialog.value = false
    bulkFile.value = null
    // Refrescar la tabla
    onRequest({ pagination: pagination.value })
  } else {
    $q.notify({
      color: 'negative',
      message: res.error,
      icon: 'report_problem',
    })
  }
}
</script>
