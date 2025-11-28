<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5">Mi Perfil</div>
        <div class="text-caption text-grey">Gestiona tu información y habilidades</div>
      </div>
      <q-btn color="primary" icon="edit" label="Editar perfil" @click="editarPerfil" />
    </div>

    <div class="row q-col-gutter-md">
      <!-- Información Personal -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="text-center">
            <q-avatar size="100px" color="primary" text-color="white" class="q-mb-md">
              {{ perfil.nombre?.charAt(0) }}{{ perfil.apellido?.charAt(0) }}
            </q-avatar>
            <div class="text-h6">{{ perfil.nombre }} {{ perfil.apellido }}</div>
            <div class="text-subtitle2 text-grey">{{ perfil.puestoActual }}</div>
            <q-badge :color="perfil.estado === 'Activo' ? 'positive' : 'grey'" class="q-mt-sm">
              {{ perfil.estado }}
            </q-badge>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-list dense>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="email" color="grey" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Email</q-item-label>
                  <q-item-label>{{ perfil.correo }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="business" color="grey" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Cuenta / Proyecto</q-item-label>
                  <q-item-label>{{ perfil.cuenta || 'No asignado' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="transfer_within_a_station" color="grey" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Disponibilidad</q-item-label>
                  <q-item-label>
                    <q-icon
                      :name="perfil.disponibilidad ? 'check_circle' : 'cancel'"
                      :color="perfil.disponibilidad ? 'positive' : 'negative'"
                      size="xs"
                    />
                    {{ perfil.disponibilidad ? 'Disponible para movilidad' : 'No disponible' }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Skills y Competencias -->
      <div class="col-12 col-md-8">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="code" size="md" color="primary" class="q-mr-sm" />
              <div class="text-h6">Skills Técnicos</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="perfil.skillsTecnicos?.length">
            <div class="row q-col-gutter-sm">
              <div
                v-for="skill in perfil.skillsTecnicos"
                :key="skill.skillId"
                class="col-12 col-md-6"
              >
                <q-card flat bordered>
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center justify-between">
                      <span class="text-weight-medium">{{ getSkillNombre(skill.skillId) }}</span>
                      <q-badge :color="getNivelColor(skill.nivelId)">
                        {{ getNivelLabel(skill.nivelId) }}
                      </q-badge>
                    </div>
                    <q-linear-progress
                      :value="skill.nivelId / 4"
                      :color="getNivelColor(skill.nivelId)"
                      class="q-mt-xs"
                      rounded
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
          <q-card-section v-else class="text-center text-grey">
            <q-icon name="code_off" size="2em" />
            <div>No tienes skills técnicos registrados</div>
          </q-card-section>
        </q-card>

        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="emoji_people" size="md" color="accent" class="q-mr-sm" />
              <div class="text-h6">Skills Blandos</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="perfil.skillsBlandos?.length">
            <div class="row q-col-gutter-sm">
              <div
                v-for="skill in perfil.skillsBlandos"
                :key="skill.skillId"
                class="col-12 col-md-6"
              >
                <q-card flat bordered>
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center justify-between">
                      <span class="text-weight-medium">{{ getSkillNombre(skill.skillId) }}</span>
                      <q-badge :color="getNivelColor(skill.nivelId)">
                        {{ getNivelLabel(skill.nivelId) }}
                      </q-badge>
                    </div>
                    <q-linear-progress
                      :value="skill.nivelId / 4"
                      :color="getNivelColor(skill.nivelId)"
                      class="q-mt-xs"
                      rounded
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
          <q-card-section v-else class="text-center text-grey">
            <q-icon name="emoji_people" size="2em" />
            <div>No tienes skills blandos registrados</div>
          </q-card-section>
        </q-card>

        <!-- Certificaciones -->
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <q-icon name="verified" size="md" color="positive" class="q-mr-sm" />
              <div class="text-h6">Certificaciones y Cursos</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="perfil.certificaciones?.length">
            <q-list>
              <q-item v-for="(cert, idx) in perfil.certificaciones" :key="idx">
                <q-item-section avatar>
                  <q-icon name="workspace_premium" color="warning" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ cert }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else class="text-center text-grey">
            <q-icon name="school" size="2em" />
            <div>No tienes certificaciones registradas</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Vacantes Recomendadas -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <q-icon name="recommend" size="md" color="info" class="q-mr-sm" />
              <div class="text-h6">Vacantes Recomendadas para Ti</div>
              <q-space />
              <q-badge color="info">{{ vacantesRecomendadas.length }} oportunidades</q-badge>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="vacantesRecomendadas.length" class="q-pa-none">
            <q-list separator>
              <q-item v-for="vacante in vacantesRecomendadas" :key="vacante.id" clickable>
                <q-item-section avatar>
                  <q-circular-progress
                    :value="vacante.matchScore"
                    size="45px"
                    :thickness="0.2"
                    :color="vacante.matchScore >= 80 ? 'positive' : 'warning'"
                    track-color="grey-3"
                    show-value
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ vacante.nombrePerfil }}</q-item-label>
                  <q-item-label caption>{{ vacante.cuenta }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-chip
                      v-for="skill in vacante.skillsRequeridos?.slice(0, 2)"
                      :key="skill.skillId"
                      size="sm"
                      dense
                      color="grey-3"
                    >
                      {{ skill.nombre }}
                    </q-chip>
                  </div>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat color="primary" label="Ver detalles" dense />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else class="text-center text-grey q-py-xl">
            <q-icon name="search_off" size="3em" />
            <div class="q-mt-sm">No hay vacantes que coincidan con tu perfil</div>
            <div class="text-caption">Completa tu perfil para recibir recomendaciones</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { useVacantesStore } from 'stores/vacantes'
import { api } from 'boot/axios'
import { Endpoints } from 'src/services/endpoints'

const $q = useQuasar()
const authStore = useAuthStore()
const vacantesStore = useVacantesStore()

const perfil = ref({
  nombre: '',
  apellido: '',
  correo: '',
  puestoActual: '',
  cuenta: '',
  estado: 'Activo',
  disponibilidad: true,
  skillsTecnicos: [],
  skillsBlandos: [],
  certificaciones: [],
})

const skillsMap = ref({})
const vacantesRecomendadas = ref([])

const nivelOptions = [
  { label: 'Básico', value: 1, color: 'grey' },
  { label: 'Intermedio', value: 2, color: 'info' },
  { label: 'Avanzado', value: 3, color: 'warning' },
  { label: 'Experto', value: 4, color: 'positive' },
]

function getNivelLabel(nivelId) {
  return nivelOptions.find((n) => n.value === nivelId)?.label || `Nivel ${nivelId}`
}

function getNivelColor(nivelId) {
  return nivelOptions.find((n) => n.value === nivelId)?.color || 'grey'
}

function getSkillNombre(skillId) {
  return skillsMap.value[skillId] || `Skill ${skillId}`
}

function editarPerfil() {
  $q.notify({ type: 'info', message: 'Función de edición próximamente' })
}

async function loadPerfil() {
  try {
    // Cargar skills para el mapa
    const { data: skills } = await api.get(Endpoints.skills.base)
    skills?.forEach((s) => {
      skillsMap.value[s.id] = s.nombre
    })

    // Cargar datos del usuario actual
    if (authStore.user?.id) {
      const { data } = await api.get(Endpoints.usuarios.byId(authStore.user.id))
      perfil.value = {
        ...perfil.value,
        ...data,
      }
    } else {
      // Datos de demostración
      perfil.value = {
        nombre: 'Usuario',
        apellido: 'Demo',
        correo: authStore.user?.email || 'demo@empresa.com',
        puestoActual: 'Desarrollador',
        cuenta: 'Proyecto Demo',
        estado: 'Activo',
        disponibilidad: true,
        skillsTecnicos: [
          { skillId: 1, nivelId: 3 },
          { skillId: 2, nivelId: 2 },
        ],
        skillsBlandos: [{ skillId: 5, nivelId: 3 }],
        certificaciones: ['AWS Cloud Practitioner', 'Scrum Master'],
      }
    }

    // Cargar vacantes recomendadas
    await vacantesStore.fetchList()
    vacantesRecomendadas.value = vacantesStore.items
      .filter((v) => v.estado === 'Abierta')
      .slice(0, 5)
      .map((v) => ({
        ...v,
        matchScore: Math.floor(Math.random() * 30) + 70, // Simulado
      }))
  } catch (err) {
    console.error('Error loading perfil:', err)
  }
}

onMounted(() => {
  loadPerfil()
})
</script>
