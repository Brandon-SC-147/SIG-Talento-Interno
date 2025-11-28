<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Vacantes / Proyectos</div>
      <q-btn color="primary" icon="add" label="Nueva Vacante" @click="openCreateDialog" />
    </div>

    <!-- Filtros -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filters.search"
          label="Buscar por nombre o cuenta"
          dense
          outlined
          clearable
          debounce="300"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.estado"
          :options="estadoOptions"
          label="Estado"
          dense
          outlined
          emit-value
          map-options
          clearable
        />
      </div>
      <div class="col-12 col-md-3">
        <q-toggle v-model="filters.urgentes" label="Solo urgentes" color="warning" />
      </div>
    </div>

    <!-- Lista de Vacantes -->
    <q-table
      :rows="filteredVacantes"
      :columns="columns"
      row-key="id"
      :loading="store.loading"
      flat
      bordered
    >
      <template #body-cell-nombre="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-icon
              v-if="props.row.urgencia"
              name="priority_high"
              color="warning"
              class="q-mr-sm"
            />
            <span class="text-weight-medium">{{ props.row.nombrePerfil }}</span>
          </div>
        </q-td>
      </template>

      <template #body-cell-skills="props">
        <q-td :props="props">
          <q-chip
            v-for="skill in props.row.skillsRequeridos?.slice(0, 3)"
            :key="skill.skillId"
            size="sm"
            color="primary"
            text-color="white"
            dense
          >
            {{ skill.nombre }} ({{ getNivelLabel(skill.nivelId) }})
          </q-chip>
          <q-chip v-if="props.row.skillsRequeridos?.length > 3" size="sm" dense>
            +{{ props.row.skillsRequeridos.length - 3 }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="getEstadoColor(props.row.estado)">
            {{ props.row.estado }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-matches="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            color="primary"
            icon="people"
            :label="props.row.matchCount || 0"
            @click="openMatchesDialog(props.row)"
          />
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" color="primary" @click="openEditDialog(props.row)" />
          <q-btn
            flat
            round
            dense
            icon="delete"
            color="negative"
            @click="confirmDelete(props.row)"
          />
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-py-xl">
          <q-icon size="2em" name="work_off" />
          <span>No hay vacantes registradas</span>
        </div>
      </template>
    </q-table>

    <!-- Dialog Crear/Editar Vacante -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 600px; max-width: 90vw">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon :name="editMode ? 'edit' : 'add'" class="q-mr-sm" />
          <div class="text-h6">{{ editMode ? 'Editar Vacante' : 'Nueva Vacante' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="onSubmit" ref="formRef" class="q-gutter-md">
            <!-- Info básica -->
            <div class="text-subtitle2 text-grey-7 text-center">Información del Perfil</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nombrePerfil"
                  label="Nombre del Perfil"
                  :rules="[(v) => !!v || 'Requerido']"
                  dense
                  outlined
                  placeholder="Ej: Desarrollador Full Stack Sr"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.cuenta"
                  label="Cuenta / Proyecto"
                  :rules="[(v) => !!v || 'Requerido']"
                  dense
                  outlined
                  placeholder="Ej: Proyecto Alpha"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.fechaInicio"
                  label="Fecha de Inicio"
                  type="date"
                  dense
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.estado"
                  :options="estadoOptions"
                  label="Estado"
                  dense
                  outlined
                  emit-value
                  map-options
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-toggle v-model="form.urgencia" label="Urgente" color="warning" />
              </div>
            </div>

            <!-- Skills Requeridos -->
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 text-grey-7 text-center">
              Skills Requeridos y Nivel Deseado
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="selectedSkill"
                  :options="availableSkillOptions"
                  label="Agregar skill requerido"
                  dense
                  outlined
                  option-value="value"
                  option-label="label"
                  @update:model-value="addSkillRequired"
                  clearable
                >
                  <template #option="{ itemProps, opt }">
                    <q-item v-bind="itemProps">
                      <q-item-section>
                        <q-item-label>{{ opt.label }}</q-item-label>
                        <q-item-label caption>{{ opt.category || 'General' }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12" v-if="form.skillsRequeridos?.length">
                <q-list bordered separator class="rounded-borders">
                  <q-item v-for="(skill, idx) in form.skillsRequeridos" :key="skill.skillId">
                    <q-item-section>
                      <q-item-label>{{ getSkillLabel(skill.skillId) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-select
                        v-model="skill.nivelId"
                        :options="nivelOptions"
                        label="Nivel mínimo"
                        dense
                        outlined
                        emit-value
                        map-options
                        style="min-width: 140px"
                      />
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="negative"
                        @click="removeSkillRequired(idx)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <!-- Descripción -->
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="form.descripcion"
                  label="Descripción / Notas"
                  type="textarea"
                  rows="2"
                  dense
                  outlined
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat color="primary" label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            :label="editMode ? 'Guardar' : 'Crear'"
            @click="onSubmit"
            :loading="store.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de Matches/Candidatos -->
    <q-dialog v-model="matchesDialogOpen">
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="people" class="q-mr-sm" />
          <div class="text-h6">Candidatos para: {{ selectedVacante?.nombrePerfil }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-linear-progress v-if="store.matchesLoading" indeterminate />

          <q-list v-else-if="store.matches?.length" bordered separator>
            <q-item v-for="match in store.matches" :key="match.usuarioId">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ match.nombre?.charAt(0) }}{{ match.apellido?.charAt(0) }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ match.nombre }} {{ match.apellido }}</q-item-label>
                <q-item-label caption>{{ match.puestoActual }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="positive"> {{ match.porcentajeMatch || 0 }}% Match </q-badge>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-center text-grey q-py-lg">
            <q-icon name="person_off" size="3em" />
            <div class="q-mt-sm">No hay candidatos internos que cumplan los requisitos</div>
            <div class="text-caption q-mt-xs">Considera buscar en el mercado externo</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useVacantesStore } from 'stores/vacantes'
import { api } from 'boot/axios'
import { Endpoints } from 'src/services/endpoints'

const $q = useQuasar()
const store = useVacantesStore()

// Filtros
const filters = ref({
  search: '',
  estado: null,
  urgentes: false,
})

// Skills disponibles
const skillOptions = ref([])

// Dialog
const dialogOpen = ref(false)
const editMode = ref(false)
const formRef = ref(null)
const selectedSkill = ref(null)

// Dialog de matches
const matchesDialogOpen = ref(false)
const selectedVacante = ref(null)

// Form
const getDefaultForm = () => ({
  nombrePerfil: '',
  cuenta: '',
  fechaInicio: '',
  estado: 'Abierta',
  urgencia: false,
  skillsRequeridos: [],
  descripcion: '',
})
const form = ref(getDefaultForm())

const estadoOptions = [
  { label: 'Abierta', value: 'Abierta' },
  { label: 'En proceso', value: 'EnProceso' },
  { label: 'Cerrada', value: 'Cerrada' },
  { label: 'Cancelada', value: 'Cancelada' },
]

const nivelOptions = [
  { label: 'Básico', value: 1 },
  { label: 'Intermedio', value: 2 },
  { label: 'Avanzado', value: 3 },
  { label: 'Experto', value: 4 },
]

const columns = [
  { name: 'nombre', label: 'Perfil', field: 'nombrePerfil', align: 'left', sortable: true },
  { name: 'cuenta', label: 'Cuenta/Proyecto', field: 'cuenta', align: 'left', sortable: true },
  { name: 'skills', label: 'Skills Requeridos', field: 'skillsRequeridos', align: 'left' },
  {
    name: 'fechaInicio',
    label: 'Fecha Inicio',
    field: 'fechaInicio',
    align: 'center',
    sortable: true,
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'matches', label: 'Candidatos', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const filteredVacantes = computed(() => {
  let result = [...store.items]

  if (filters.value.search) {
    const s = filters.value.search.toLowerCase()
    result = result.filter(
      (v) => v.nombrePerfil?.toLowerCase().includes(s) || v.cuenta?.toLowerCase().includes(s),
    )
  }

  if (filters.value.estado) {
    result = result.filter((v) => v.estado === filters.value.estado)
  }

  if (filters.value.urgentes) {
    result = result.filter((v) => v.urgencia)
  }

  return result
})

const availableSkillOptions = computed(() => {
  const selectedIds = (form.value.skillsRequeridos || []).map((s) => s.skillId)
  return skillOptions.value.filter((s) => !selectedIds.includes(s.value))
})

function getNivelLabel(nivelId) {
  const nivel = nivelOptions.find((n) => n.value === nivelId)
  return nivel?.label || `Nivel ${nivelId}`
}

function getSkillLabel(skillId) {
  const skill = skillOptions.value.find((s) => s.value === skillId)
  return skill?.label || `Skill ${skillId}`
}

function getEstadoColor(estado) {
  const colors = {
    Abierta: 'positive',
    EnProceso: 'warning',
    Cerrada: 'grey',
    Cancelada: 'negative',
  }
  return colors[estado] || 'grey'
}

function addSkillRequired() {
  if (selectedSkill.value) {
    if (!form.value.skillsRequeridos) form.value.skillsRequeridos = []
    form.value.skillsRequeridos.push({
      skillId: selectedSkill.value.value,
      nombre: selectedSkill.value.label,
      nivelId: 2,
    })
    selectedSkill.value = null
  }
}

function removeSkillRequired(idx) {
  form.value.skillsRequeridos.splice(idx, 1)
}

function openCreateDialog() {
  editMode.value = false
  form.value = getDefaultForm()
  dialogOpen.value = true
}

function openEditDialog(vacante) {
  editMode.value = true
  form.value = { ...getDefaultForm(), ...vacante }
  dialogOpen.value = true
}

async function openMatchesDialog(vacante) {
  selectedVacante.value = vacante
  matchesDialogOpen.value = true
  try {
    await store.fetchMatches(vacante.id)
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar candidatos' })
  }
}

function confirmDelete(vacante) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Eliminar la vacante "${vacante.nombrePerfil}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await store.remove(vacante.id)
      $q.notify({ type: 'positive', message: 'Vacante eliminada' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    if (editMode.value) {
      await store.update(form.value.id, form.value)
      $q.notify({ type: 'positive', message: 'Vacante actualizada' })
    } else {
      await store.create(form.value)
      $q.notify({ type: 'positive', message: 'Vacante creada' })
    }
    dialogOpen.value = false
  } catch (err) {
    $q.notify({ type: 'negative', message: err?.response?.data || 'Error al guardar' })
  }
}

async function loadSkills() {
  try {
    const { data } = await api.get(Endpoints.skills.base)
    skillOptions.value = (data || []).map((s) => ({
      value: s.id,
      label: s.nombre,
      category: s.categoria || s.tipo || 'General',
    }))
  } catch (err) {
    console.error('Error loading skills:', err)
  }
}

onMounted(async () => {
  await Promise.all([store.fetchList(), loadSkills()])
})
</script>
