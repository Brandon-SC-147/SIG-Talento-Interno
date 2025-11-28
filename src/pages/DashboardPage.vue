<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5">Dashboard RRHH</div>
      <q-btn-dropdown color="primary" label="Exportar">
        <q-list>
          <q-item clickable v-close-popup @click="exportPDF">
            <q-item-section avatar><q-icon name="picture_as_pdf" /></q-item-section>
            <q-item-section>Exportar PDF</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="exportExcel">
            <q-item-section avatar><q-icon name="table_chart" /></q-item-section>
            <q-item-section>Exportar Excel</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

    <!-- Tarjetas de Resumen -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h3">{{ stats.totalColaboradores }}</div>
            <div class="text-subtitle1">Colaboradores</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="group" size="2em" class="float-right" style="opacity: 0.3" />
            <div class="text-caption">{{ stats.colaboradoresActivos }} activos</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-positive text-white">
          <q-card-section>
            <div class="text-h3">{{ stats.disponiblesMovilidad }}</div>
            <div class="text-subtitle1">Disponibles</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon
              name="transfer_within_a_station"
              size="2em"
              class="float-right"
              style="opacity: 0.3"
            />
            <div class="text-caption">Para movilidad interna</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-warning text-white">
          <q-card-section>
            <div class="text-h3">{{ stats.vacantesAbiertas }}</div>
            <div class="text-subtitle1">Vacantes Abiertas</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="work" size="2em" class="float-right" style="opacity: 0.3" />
            <div class="text-caption">{{ stats.vacantesUrgentes }} urgentes</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-info text-white">
          <q-card-section>
            <div class="text-h3">{{ stats.totalSkills }}</div>
            <div class="text-subtitle1">Skills Registrados</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="psychology" size="2em" class="float-right" style="opacity: 0.3" />
            <div class="text-caption">En el inventario</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos y Tablas -->
    <div class="row q-col-gutter-md">
      <!-- Skills por Área -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Inventario de Skills por Área</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-list>
              <q-item v-for="area in skillsByArea" :key="area.nombre">
                <q-item-section avatar>
                  <q-avatar :color="area.color" text-color="white" size="sm">
                    {{ area.count }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ area.nombre }}</q-item-label>
                  <q-linear-progress
                    :value="area.count / maxSkillCount"
                    :color="area.color"
                    class="q-mt-sm"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Skills más demandados -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Skills más Demandados</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-list>
              <q-item v-for="skill in topSkills" :key="skill.id">
                <q-item-section avatar>
                  <q-icon
                    :name="skill.tipo === 'tecnico' ? 'code' : 'emoji_people'"
                    :color="skill.tipo === 'tecnico' ? 'primary' : 'accent'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ skill.nombre }}</q-item-label>
                  <q-item-label caption>{{ skill.colaboradores }} colaboradores</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="skill.demanda > 5 ? 'negative' : 'positive'">
                    {{ skill.demanda }} vacantes
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Brechas de Skills -->
      <div class="col-12">
        <q-card>
          <q-card-section class="row items-center">
            <div class="text-h6">Brechas de Skills - Alertas para Reclutamiento Externo</div>
            <q-space />
            <q-badge color="negative" class="q-pa-sm">
              {{ brechas.length }} brechas identificadas
            </q-badge>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="brechas.length">
            <q-table :rows="brechas" :columns="brechasColumns" row-key="skillId" flat dense>
              <template #body-cell-gap="props">
                <q-td :props="props">
                  <q-badge :color="props.row.gap > 3 ? 'negative' : 'warning'">
                    -{{ props.row.gap }}
                  </q-badge>
                </q-td>
              </template>
              <template #body-cell-accion="props">
                <q-td :props="props">
                  <q-btn
                    size="sm"
                    color="primary"
                    label="Buscar externo"
                    icon="person_search"
                    dense
                    @click="alertarReclutamiento(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <q-card-section v-else class="text-center text-grey">
            <q-icon name="check_circle" size="3em" color="positive" />
            <div class="q-mt-sm">No hay brechas críticas de skills</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Colaboradores por Rol -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Colaboradores por Rol</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div v-for="rol in colaboradoresPorRol" :key="rol.nombre" class="q-mb-md">
              <div class="row items-center justify-between q-mb-xs">
                <span>{{ rol.nombre }}</span>
                <span class="text-weight-bold">{{ rol.count }}</span>
              </div>
              <q-linear-progress
                :value="rol.count / stats.totalColaboradores"
                :color="rol.color"
                size="md"
                rounded
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Vacantes recientes -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Vacantes Recientes</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-list>
              <q-item v-for="vacante in vacantesRecientes" :key="vacante.id">
                <q-item-section avatar>
                  <q-icon
                    :name="vacante.urgencia ? 'priority_high' : 'work'"
                    :color="vacante.urgencia ? 'warning' : 'primary'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ vacante.nombrePerfil }}</q-item-label>
                  <q-item-label caption>{{ vacante.cuenta }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="vacante.matchCount > 0 ? 'positive' : 'grey'">
                    {{ vacante.matchCount || 0 }} matches
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCollaboratorsStore } from 'stores/collaborators'
import { useVacantesStore } from 'stores/vacantes'
import { api } from 'boot/axios'
import { Endpoints } from 'src/services/endpoints'

const $q = useQuasar()
const collaboratorsStore = useCollaboratorsStore()
const vacantesStore = useVacantesStore()

// Stats generales
const stats = ref({
  totalColaboradores: 0,
  colaboradoresActivos: 0,
  disponiblesMovilidad: 0,
  vacantesAbiertas: 0,
  vacantesUrgentes: 0,
  totalSkills: 0,
})

// Skills por área
const skillsByArea = ref([
  { nombre: 'Frontend', count: 12, color: 'primary' },
  { nombre: 'Backend', count: 15, color: 'secondary' },
  { nombre: 'DevOps', count: 5, color: 'accent' },
  { nombre: 'QA', count: 8, color: 'info' },
  { nombre: 'Liderazgo', count: 6, color: 'positive' },
])

const maxSkillCount = computed(() => Math.max(...skillsByArea.value.map((a) => a.count), 1))

// Top skills
const topSkills = ref([
  { id: 1, nombre: 'React', tipo: 'tecnico', colaboradores: 8, demanda: 3 },
  { id: 2, nombre: 'Node.js', tipo: 'tecnico', colaboradores: 6, demanda: 5 },
  { id: 3, nombre: 'Liderazgo', tipo: 'blando', colaboradores: 4, demanda: 2 },
  { id: 4, nombre: 'Python', tipo: 'tecnico', colaboradores: 5, demanda: 7 },
  { id: 5, nombre: 'Comunicación', tipo: 'blando', colaboradores: 10, demanda: 1 },
])

// Brechas de skills
const brechas = ref([])
const brechasColumns = [
  { name: 'skill', label: 'Skill', field: 'skillNombre', align: 'left' },
  { name: 'requerido', label: 'Requerido', field: 'requerido', align: 'center' },
  { name: 'disponible', label: 'Disponible', field: 'disponible', align: 'center' },
  { name: 'gap', label: 'Brecha', field: 'gap', align: 'center' },
  { name: 'accion', label: 'Acción', align: 'center' },
]

// Colaboradores por rol
const colaboradoresPorRol = ref([
  { nombre: 'Desarrollador', count: 25, color: 'primary' },
  { nombre: 'QA', count: 8, color: 'secondary' },
  { nombre: 'DevOps', count: 4, color: 'accent' },
  { nombre: 'Líder', count: 6, color: 'positive' },
  { nombre: 'PM', count: 3, color: 'info' },
])

// Vacantes recientes
const vacantesRecientes = computed(() => {
  return vacantesStore.items.slice(0, 5)
})

function alertarReclutamiento(brecha) {
  $q.notify({
    type: 'info',
    message: `Alerta generada para reclutar: ${brecha.skillNombre}`,
    caption: 'Se notificará al equipo de reclutamiento',
    actions: [{ icon: 'close', color: 'white' }],
  })
}

function exportPDF() {
  $q.notify({
    type: 'positive',
    message: 'Generando reporte PDF...',
  })
  // TODO: Implementar exportación real
}

function exportExcel() {
  $q.notify({
    type: 'positive',
    message: 'Generando reporte Excel...',
  })
  // TODO: Implementar exportación real
}

async function loadStats() {
  try {
    // Cargar colaboradores
    await collaboratorsStore.fetchList()
    const colaboradores = collaboratorsStore.items

    stats.value.totalColaboradores = colaboradores.length
    stats.value.colaboradoresActivos = colaboradores.filter((c) => c.estado === 'Activo').length
    stats.value.disponiblesMovilidad = colaboradores.filter((c) => c.disponibilidad).length

    // Cargar vacantes
    await vacantesStore.fetchList()
    const vacantes = vacantesStore.items

    stats.value.vacantesAbiertas = vacantes.filter((v) => v.estado === 'Abierta').length
    stats.value.vacantesUrgentes = vacantes.filter(
      (v) => v.urgencia && v.estado === 'Abierta',
    ).length

    // Cargar skills
    const { data: skills } = await api.get(Endpoints.skills.base)
    stats.value.totalSkills = skills?.length || 0

    // Calcular brechas
    calculateBrechas(colaboradores, vacantes, skills || [])
  } catch (err) {
    console.error('Error loading stats:', err)
  }
}

function calculateBrechas(colaboradores, vacantes, skills) {
  const skillDemanda = {}
  const skillDisponible = {}

  // Contar skills requeridos en vacantes abiertas
  vacantes
    .filter((v) => v.estado === 'Abierta')
    .forEach((v) => {
      ;(v.skillsRequeridos || []).forEach((s) => {
        skillDemanda[s.skillId] = (skillDemanda[s.skillId] || 0) + 1
      })
    })

  // Contar skills disponibles en colaboradores activos
  colaboradores
    .filter((c) => c.estado === 'Activo' && c.disponibilidad)
    .forEach((c) => {
      ;[...(c.skillsTecnicos || []), ...(c.skillsBlandos || [])].forEach((s) => {
        skillDisponible[s.skillId] = (skillDisponible[s.skillId] || 0) + 1
      })
    })

  // Identificar brechas
  brechas.value = Object.entries(skillDemanda)
    .map(([skillId, requerido]) => {
      const disponible = skillDisponible[skillId] || 0
      const gap = requerido - disponible
      const skill = skills.find((s) => s.id === parseInt(skillId))
      return {
        skillId: parseInt(skillId),
        skillNombre: skill?.nombre || `Skill ${skillId}`,
        requerido,
        disponible,
        gap,
      }
    })
    .filter((b) => b.gap > 0)
    .sort((a, b) => b.gap - a.gap)
}

onMounted(() => {
  loadStats()
})
</script>
