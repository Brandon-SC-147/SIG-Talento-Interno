<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5">Panel del Líder</div>
        <div class="text-caption text-grey">Gestiona tu equipo y encuentra talento interno</div>
      </div>
      <q-btn color="primary" icon="add" label="Nueva Vacante" @click="openCreateVacante" />
    </div>

    <!-- Tarjetas de Resumen -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h3">{{ stats.miEquipo }}</div>
            <div class="text-subtitle1">Mi Equipo</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="groups" size="2em" class="float-right" style="opacity: 0.3" />
            <div class="text-caption">Colaboradores a cargo</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-warning text-white">
          <q-card-section>
            <div class="text-h3">{{ stats.misVacantes }}</div>
            <div class="text-subtitle1">Mis Vacantes</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="work" size="2em" class="float-right" style="opacity: 0.3" />
            <div class="text-caption">{{ stats.vacantesUrgentes }} urgentes</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-positive text-white">
          <q-card-section>
            <div class="text-h3">{{ stats.candidatosEncontrados }}</div>
            <div class="text-subtitle1">Candidatos</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="person_search" size="2em" class="float-right" style="opacity: 0.3" />
            <div class="text-caption">Matches internos</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-info text-white">
          <q-card-section>
            <div class="text-h3">{{ stats.evaluacionesPendientes }}</div>
            <div class="text-subtitle1">Evaluaciones</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="rate_review" size="2em" class="float-right" style="opacity: 0.3" />
            <div class="text-caption">Pendientes de mi equipo</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Mis Vacantes Activas -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="row items-center">
            <q-icon name="work" size="md" color="warning" class="q-mr-sm" />
            <div class="text-h6">Mis Vacantes Activas</div>
            <q-space />
            <q-btn flat dense icon="add" color="primary" @click="openCreateVacante" />
          </q-card-section>
          <q-separator />
          <q-card-section v-if="misVacantes.length" class="q-pa-none">
            <q-list separator>
              <q-item
                v-for="vacante in misVacantes"
                :key="vacante.id"
                clickable
                @click="verCandidatos(vacante)"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="vacante.urgencia ? 'priority_high' : 'work_outline'"
                    :color="vacante.urgencia ? 'warning' : 'primary'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ vacante.nombrePerfil }}</q-item-label>
                  <q-item-label caption
                    >{{ vacante.cuenta }} •
                    {{ vacante.skillsRequeridos?.length || 0 }} skills</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center q-gutter-xs">
                    <q-badge :color="vacante.matchCount > 0 ? 'positive' : 'grey'">
                      {{ vacante.matchCount || 0 }} candidatos
                    </q-badge>
                    <q-btn
                      flat
                      round
                      dense
                      icon="visibility"
                      size="sm"
                      @click.stop="verCandidatos(vacante)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else class="text-center text-grey q-py-xl">
            <q-icon name="work_off" size="3em" />
            <div class="q-mt-sm">No tienes vacantes activas</div>
            <q-btn
              flat
              color="primary"
              label="Crear primera vacante"
              @click="openCreateVacante"
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Mi Equipo -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="row items-center">
            <q-icon name="groups" size="md" color="primary" class="q-mr-sm" />
            <div class="text-h6">Mi Equipo</div>
            <q-space />
            <q-btn
              flat
              dense
              label="Evaluar skills"
              color="primary"
              icon="rate_review"
              @click="openEvaluacion"
            />
          </q-card-section>
          <q-separator />
          <q-card-section v-if="miEquipo.length" class="q-pa-none">
            <q-list separator>
              <q-item v-for="colaborador in miEquipo" :key="colaborador.id">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ colaborador.nombre?.charAt(0) }}{{ colaborador.apellido?.charAt(0) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ colaborador.nombre }} {{ colaborador.apellido }}</q-item-label>
                  <q-item-label caption>{{ colaborador.puestoActual }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center q-gutter-xs">
                    <q-icon
                      :name="colaborador.disponibilidad ? 'check_circle' : 'cancel'"
                      :color="colaborador.disponibilidad ? 'positive' : 'grey'"
                      size="xs"
                    />
                    <span class="text-caption">{{
                      colaborador.disponibilidad ? 'Disponible' : 'No disponible'
                    }}</span>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else class="text-center text-grey q-py-xl">
            <q-icon name="group_off" size="3em" />
            <div class="q-mt-sm">No hay colaboradores en tu equipo</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Búsqueda de Talento Interno -->
      <div class="col-12">
        <q-card>
          <q-card-section class="row items-center">
            <q-icon name="person_search" size="md" color="positive" class="q-mr-sm" />
            <div class="text-h6">Buscar Talento Interno</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="busqueda.skills"
                  :options="skillOptions"
                  label="Skills requeridos"
                  multiple
                  use-chips
                  dense
                  outlined
                  emit-value
                  map-options
                  option-value="value"
                  option-label="label"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="busqueda.nivelMinimo"
                  :options="nivelOptions"
                  label="Nivel mínimo"
                  dense
                  outlined
                  emit-value
                  map-options
                  clearable
                />
              </div>
              <div class="col-12 col-md-3">
                <q-toggle
                  v-model="busqueda.soloDisponibles"
                  label="Solo disponibles para movilidad"
                />
              </div>
              <div class="col-12 col-md-2">
                <q-btn
                  color="primary"
                  label="Buscar"
                  icon="search"
                  @click="buscarTalento"
                  class="full-width"
                />
              </div>
            </div>
          </q-card-section>

          <!-- Resultados de búsqueda -->
          <q-card-section v-if="resultadosBusqueda.length">
            <q-table :rows="resultadosBusqueda" :columns="columnasBusqueda" row-key="id" flat dense>
              <template #body-cell-match="props">
                <q-td :props="props">
                  <q-circular-progress
                    :value="props.row.porcentajeMatch"
                    size="40px"
                    :thickness="0.2"
                    :color="
                      props.row.porcentajeMatch >= 80
                        ? 'positive'
                        : props.row.porcentajeMatch >= 50
                          ? 'warning'
                          : 'negative'
                    "
                    track-color="grey-3"
                    show-value
                  />
                </q-td>
              </template>
              <template #body-cell-skills="props">
                <q-td :props="props">
                  <q-chip
                    v-for="skill in props.row.skills?.slice(0, 3)"
                    :key="skill.skillId"
                    size="sm"
                    dense
                    color="primary"
                    text-color="white"
                  >
                    {{ skill.nombre }}
                  </q-chip>
                  <span v-if="props.row.skills?.length > 3" class="text-caption text-grey">
                    +{{ props.row.skills.length - 3 }}
                  </span>
                </q-td>
              </template>
              <template #body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn flat dense icon="visibility" color="primary" @click="verPerfil(props.row)">
                    <q-tooltip>Ver perfil</q-tooltip>
                  </q-btn>
                  <q-btn flat dense icon="mail" color="secondary" @click="contactar(props.row)">
                    <q-tooltip>Contactar</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Evaluaciones Pendientes -->
      <div class="col-12">
        <q-card>
          <q-card-section class="row items-center">
            <q-icon name="rate_review" size="md" color="info" class="q-mr-sm" />
            <div class="text-h6">Evaluaciones de Skills Pendientes</div>
            <q-space />
            <q-badge color="info">{{ evaluacionesPendientes.length }} pendientes</q-badge>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="evaluacionesPendientes.length" class="q-pa-none">
            <q-list separator>
              <q-item
                v-for="evaluacion in evaluacionesPendientes"
                :key="evaluacion.id"
                clickable
                @click="realizarEvaluacion(evaluacion)"
              >
                <q-item-section avatar>
                  <q-avatar color="info" text-color="white">
                    {{ evaluacion.colaborador?.nombre?.charAt(0) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    >{{ evaluacion.colaborador?.nombre }}
                    {{ evaluacion.colaborador?.apellido }}</q-item-label
                  >
                  <q-item-label caption>Evaluar: {{ evaluacion.skill?.nombre }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    color="info"
                    label="Evaluar"
                    dense
                    @click.stop="realizarEvaluacion(evaluacion)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else class="text-center text-grey q-py-lg">
            <q-icon name="check_circle" size="2em" color="positive" />
            <div class="q-mt-sm">No hay evaluaciones pendientes</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog Ver Candidatos -->
    <q-dialog v-model="candidatosDialogOpen">
      <q-card style="min-width: 600px; max-width: 90vw">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="people" class="q-mr-sm" />
          <div class="text-h6">Candidatos para: {{ selectedVacante?.nombrePerfil }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">Skills requeridos:</div>
          <div class="q-mb-md">
            <q-chip
              v-for="skill in selectedVacante?.skillsRequeridos"
              :key="skill.skillId"
              color="primary"
              text-color="white"
              size="sm"
            >
              {{ skill.nombre }} ({{ getNivelLabel(skill.nivelId) }})
            </q-chip>
          </div>
          <q-separator class="q-my-md" />

          <q-list v-if="candidatosVacante.length" bordered separator>
            <q-item v-for="candidato in candidatosVacante" :key="candidato.usuarioId">
              <q-item-section avatar>
                <q-avatar color="positive" text-color="white">
                  {{ candidato.nombre?.charAt(0) }}{{ candidato.apellido?.charAt(0) }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ candidato.nombre }} {{ candidato.apellido }}</q-item-label>
                <q-item-label caption
                  >{{ candidato.puestoActual }} • {{ candidato.cuenta }}</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-circular-progress
                  :value="candidato.porcentajeMatch || 0"
                  size="50px"
                  :thickness="0.2"
                  color="positive"
                  track-color="grey-3"
                  show-value
                  class="text-positive"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-center text-grey q-py-lg">
            <q-icon name="person_off" size="3em" />
            <div class="q-mt-sm">No hay candidatos internos disponibles</div>
            <div class="text-caption">Considera solicitar reclutamiento externo a RRHH</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Evaluación -->
    <q-dialog v-model="evaluacionDialogOpen" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center bg-info text-white">
          <q-icon name="rate_review" class="q-mr-sm" />
          <div class="text-h6">Evaluar Skill</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            {{ selectedEvaluacion?.colaborador?.nombre }}
            {{ selectedEvaluacion?.colaborador?.apellido }}
          </div>
          <div class="text-body2 q-mb-md">
            Skill: <strong>{{ selectedEvaluacion?.skill?.nombre }}</strong>
          </div>
          <q-select
            v-model="evaluacionNivel"
            :options="nivelOptions"
            label="Nivel de dominio"
            dense
            outlined
            emit-value
            map-options
          />
          <q-input
            v-model="evaluacionNotas"
            label="Notas / Observaciones"
            type="textarea"
            rows="2"
            dense
            outlined
            class="q-mt-md"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="info" label="Guardar evaluación" @click="guardarEvaluacion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useVacantesStore } from 'stores/vacantes'
import { useCollaboratorsStore } from 'stores/collaborators'
import { api } from 'boot/axios'
import { Endpoints } from 'src/services/endpoints'

const $q = useQuasar()
const router = useRouter()
const vacantesStore = useVacantesStore()
const collaboratorsStore = useCollaboratorsStore()

// Stats
const stats = ref({
  miEquipo: 0,
  misVacantes: 0,
  vacantesUrgentes: 0,
  candidatosEncontrados: 0,
  evaluacionesPendientes: 0,
})

// Datos
const misVacantes = ref([])
const miEquipo = ref([])
const evaluacionesPendientes = ref([])
const skillOptions = ref([])

// Búsqueda de talento
const busqueda = ref({
  skills: [],
  nivelMinimo: null,
  soloDisponibles: true,
})
const resultadosBusqueda = ref([])

// Dialogs
const candidatosDialogOpen = ref(false)
const selectedVacante = ref(null)
const candidatosVacante = ref([])

const evaluacionDialogOpen = ref(false)
const selectedEvaluacion = ref(null)
const evaluacionNivel = ref(2)
const evaluacionNotas = ref('')

const nivelOptions = [
  { label: 'Básico', value: 1 },
  { label: 'Intermedio', value: 2 },
  { label: 'Avanzado', value: 3 },
  { label: 'Experto', value: 4 },
]

const columnasBusqueda = [
  {
    name: 'nombre',
    label: 'Colaborador',
    field: (row) => `${row.nombre} ${row.apellido}`,
    align: 'left',
  },
  { name: 'puesto', label: 'Puesto', field: 'puestoActual', align: 'left' },
  { name: 'skills', label: 'Skills', align: 'left' },
  { name: 'match', label: 'Match', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

function getNivelLabel(nivelId) {
  return nivelOptions.find((n) => n.value === nivelId)?.label || `Nivel ${nivelId}`
}

function openCreateVacante() {
  router.push('/vacantes')
}

async function verCandidatos(vacante) {
  selectedVacante.value = vacante
  candidatosDialogOpen.value = true
  try {
    await vacantesStore.fetchMatches(vacante.id)
    candidatosVacante.value = vacantesStore.matches || []
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar candidatos' })
  }
}

function openEvaluacion() {
  $q.notify({ type: 'info', message: 'Función de evaluación masiva próximamente' })
}

function realizarEvaluacion(evaluacion) {
  selectedEvaluacion.value = evaluacion
  evaluacionNivel.value = 2
  evaluacionNotas.value = ''
  evaluacionDialogOpen.value = true
}

async function guardarEvaluacion() {
  try {
    // Aquí iría la llamada a la API para guardar la evaluación
    await collaboratorsStore.assignSkill(selectedEvaluacion.value.colaborador.id, {
      skillId: selectedEvaluacion.value.skill.id,
      nivelId: evaluacionNivel.value,
      evaluadorId: 1, // ID del líder actual
    })
    $q.notify({ type: 'positive', message: 'Evaluación guardada correctamente' })
    evaluacionDialogOpen.value = false
    // Remover de pendientes
    evaluacionesPendientes.value = evaluacionesPendientes.value.filter(
      (e) => e.id !== selectedEvaluacion.value.id,
    )
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar evaluación' })
  }
}

async function buscarTalento() {
  if (!busqueda.value.skills.length) {
    $q.notify({ type: 'warning', message: 'Selecciona al menos un skill' })
    return
  }

  try {
    // Simular búsqueda - En producción esto sería una llamada a la API
    const colaboradores = collaboratorsStore.items.filter((c) => {
      if (busqueda.value.soloDisponibles && !c.disponibilidad) return false
      // Aquí iría la lógica de matching real
      return true
    })

    resultadosBusqueda.value = colaboradores.map((c) => ({
      ...c,
      porcentajeMatch: Math.floor(Math.random() * 40) + 60, // Simulado
      skills: c.skillsTecnicos || [],
    }))

    if (!resultadosBusqueda.value.length) {
      $q.notify({ type: 'info', message: 'No se encontraron candidatos con esos criterios' })
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error en la búsqueda' })
  }
}

function verPerfil(colaborador) {
  $q.notify({ type: 'info', message: `Ver perfil de ${colaborador.nombre}` })
}

function contactar(colaborador) {
  $q.notify({ type: 'info', message: `Contactar a ${colaborador.nombre}` })
}

async function loadData() {
  try {
    // Cargar vacantes
    await vacantesStore.fetchList()
    misVacantes.value = vacantesStore.items.filter((v) => v.estado === 'Abierta')
    stats.value.misVacantes = misVacantes.value.length
    stats.value.vacantesUrgentes = misVacantes.value.filter((v) => v.urgencia).length

    // Cargar colaboradores (equipo)
    await collaboratorsStore.fetchList()
    miEquipo.value = collaboratorsStore.items.slice(0, 10) // Simulado - en producción filtrar por líder
    stats.value.miEquipo = miEquipo.value.length

    // Cargar skills
    const { data: skills } = await api.get(Endpoints.skills.base)
    skillOptions.value = (skills || []).map((s) => ({
      value: s.id,
      label: s.nombre,
      category: s.categoria,
    }))

    // Simular evaluaciones pendientes
    evaluacionesPendientes.value = []
    stats.value.evaluacionesPendientes = 0

    // Contar candidatos encontrados
    stats.value.candidatosEncontrados = misVacantes.value.reduce(
      (sum, v) => sum + (v.matchCount || 0),
      0,
    )
  } catch (err) {
    console.error('Error loading data:', err)
  }
}

onMounted(() => {
  loadData()
})
</script>
