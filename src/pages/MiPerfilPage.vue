<template>
  <q-page padding>
    <div class="perfil-wrapper q-mx-auto">
      <!-- HEADER -->
      <div class="row items-center justify-between q-mb-lg">
        <div class="row items-center">
          <q-icon name="person" size="md" color="primary" class="q-mr-sm" />
          <div>
            <div class="text-h5 text-weight-medium">Mi Perfil</div>
            <div class="text-caption text-grey-5">
              Gestiona tu información, habilidades y certificaciones
            </div>
          </div>
        </div>
        <q-btn color="primary" icon="edit" label="Editar perfil" @click="editarPerfil" unelevated />
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Columna Izquierda: Info Personal + Certificaciones -->
        <div class="col-12 col-md-4">
          <!-- Datos personales -->
          <q-card class="perfil-card">
            <q-card-section class="text-center">
              <q-avatar size="110px" class="q-mb-md">
                <img :src="user.fotoPerfil || 'https://cdn.quasar.dev/img/boy-avatar.png'" />
              </q-avatar>

              <div class="q-gutter-sm q-mb-md">
                <q-input
                  v-model="user.fotoPerfil"
                  label="URL Foto de Perfil"
                  dense
                  outlined
                  clearable
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-input v-model="user.nombre" label="Nombre" dense outlined />
                  </div>
                  <div class="col-6">
                    <q-input v-model="user.apellido" label="Apellido" dense outlined />
                  </div>
                </div>
                <q-input v-model="user.puestoActual" label="Puesto Actual" dense outlined />
              </div>

              <div v-if="!isLeader" class="q-mt-sm">
                <q-chip
                  :color="user.openToWork ? 'positive' : 'grey-7'"
                  text-color="white"
                  icon="work"
                  class="q-mb-xs"
                >
                  {{ user.openToWork ? 'Open to Work' : 'No disponible' }}
                </q-chip>
                <div>
                  <q-toggle
                    v-model="user.openToWork"
                    label="Disponible para ofertas"
                    @update:model-value="updateOpenToWork"
                  />
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="text-subtitle1 text-weight-medium q-mb-sm">Sobre mí</div>
              <q-input
                v-model="user.descripcionPerfil"
                type="textarea"
                outlined
                autogrow
                placeholder="Describe tu experiencia, fortalezas y objetivos profesionales..."
              />
              <q-btn
                label="Guardar descripción"
                color="primary"
                flat
                class="full-width q-mt-sm text-weight-medium"
                @click="updateProfileDescription"
              />
            </q-card-section>
          </q-card>

          <!-- Certificaciones -->
          <q-card class="perfil-card q-mt-md">
            <q-card-section class="row items-center">
              <q-icon name="verified" size="sm" color="positive" class="q-mr-sm" />
              <div class="text-h6">Certificaciones</div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-list separator v-if="user.certificaciones?.length">
                <q-item v-for="cert in user.certificaciones" :key="cert.id">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      {{ cert.nombre }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ cert.entidad }} · {{ formatDate(cert.fechaObtencion) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-xs">
                      <q-btn
                        v-if="cert.url"
                        flat
                        round
                        size="sm"
                        icon="link"
                        type="a"
                        :href="cert.url"
                        target="_blank"
                      />
                      <q-btn flat round size="sm" icon="edit" @click="openEditCert(cert)" />
                      <q-btn
                        flat
                        round
                        size="sm"
                        icon="delete"
                        color="negative"
                        @click="deleteCert(cert)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-else class="text-grey-6 text-caption text-center q-py-md">
                Aún no registras certificaciones.
              </div>

              <q-btn
                outline
                color="primary"
                label="Agregar certificación"
                class="full-width q-mt-sm text-weight-medium"
                @click="openAddCert"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Columna Derecha: Skills + Vacantes -->
        <div class="col-12 col-md-8" v-if="!isLeader">
          <!-- Skills -->
          <q-card class="perfil-card q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="row items-center">
                  <q-icon name="psychology" size="sm" color="primary" class="q-mr-sm" />
                  <div class="text-h6">Mis habilidades</div>
                </div>
                <q-btn
                  color="primary"
                  icon="add"
                  label="Agregar skill"
                  size="sm"
                  @click="openAddSkill"
                />
              </div>
            </q-card-section>

            <q-tabs
              v-model="skillTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
            >
              <q-tab name="tecnicas" label="Técnicas" />
              <q-tab name="blandas" label="Blandas" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="skillTab" animated>
              <!-- Skills técnicas -->
              <q-tab-panel name="tecnicas">
                <q-list bordered separator>
                  <q-item v-for="skill in technicalSkills" :key="skill.id">
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ skill.skill.nombre }}
                      </q-item-label>
                      <q-item-label caption> Nivel: {{ skill.nivelSkill.nombre }} </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row items-center">
                        <q-badge
                          :color="getStatusColor(skill.estado)"
                          :label="skill.estado || 'Pendiente'"
                          class="q-mr-sm"
                        />
                        <q-btn flat round icon="edit" size="sm" @click="openEditSkill(skill)" />
                      </div>
                    </q-item-section>
                  </q-item>

                  <div
                    v-if="technicalSkills.length === 0"
                    class="text-center q-pa-md text-grey-6 text-caption"
                  >
                    No has registrado habilidades técnicas.
                  </div>
                </q-list>
              </q-tab-panel>

              <!-- Skills blandas -->
              <q-tab-panel name="blandas">
                <q-list bordered separator>
                  <q-item v-for="skill in softSkills" :key="skill.id">
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ skill.skill.nombre }}
                      </q-item-label>
                      <q-item-label caption> Nivel: {{ skill.nivelSkill.nombre }} </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row items-center">
                        <q-badge
                          :color="getStatusColor(skill.estado)"
                          :label="skill.estado || 'Pendiente'"
                          class="q-mr-sm"
                        />
                        <q-btn flat round icon="edit" size="sm" @click="openEditSkill(skill)" />
                      </div>
                    </q-item-section>
                  </q-item>
                  <div
                    v-if="softSkills.length === 0"
                    class="text-center q-pa-md text-grey-6 text-caption"
                  >
                    No has registrado habilidades blandas.
                  </div>
                </q-list>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>

          <!-- Vacantes recomendadas -->
          <q-card class="perfil-card">
            <q-card-section>
              <div class="row items-center">
                <q-icon name="recommend" size="sm" color="info" class="q-mr-sm" />
                <div class="text-h6">Vacantes recomendadas para ti</div>
                <q-space />
                <q-badge color="info" outline>
                  {{ vacantesRecomendadas.length }} oportunidades
                </q-badge>
              </div>
            </q-card-section>

            <q-separator />

            <!-- Cuando SÍ hay vacantes -->
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
                    <q-item-label class="text-weight-medium">
                      {{ vacante.nombrePerfil || vacante.nombre }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ vacante.cuenta || 'Cuenta no definida' }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row q-gutter-xs">
                      <q-chip
                        v-for="skill in (vacante.skillsRequeridos || []).slice(0, 2)"
                        :key="skill.skillId || skill.id"
                        size="sm"
                        dense
                        color="grey-8"
                        text-color="white"
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

            <!-- Cuando NO hay vacantes -->
            <q-card-section v-else class="text-center text-grey-6 q-py-xl">
              <q-icon name="search_off" size="3em" class="q-mb-sm" />
              <div class="text-body2">No hay vacantes que coincidan con tu perfil</div>
              <div class="text-caption">
                Completa tus skills y certificaciones para recibir mejores recomendaciones.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Dialogos -->
      <!-- Dialogo Agregar/Editar Skill -->
      <q-dialog v-model="showSkillDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">
              {{ isEditingSkill ? 'Editar nivel' : 'Agregar habilidad' }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select
              v-model="newSkill.skillId"
              :options="availableSkills"
              label="Habilidad"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              use-input
              @filter="filterSkills"
              :disable="isEditingSkill"
            />
            <q-select
              v-model="newSkill.nivelId"
              :options="skillLevels"
              label="Nivel"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              class="q-mt-md"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn flat label="Guardar" color="primary" @click="saveSkill" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialogo Agregar/Editar Certificación -->
      <q-dialog v-model="showCertDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">
              {{ isEditingCert ? 'Editar certificación' : 'Agregar certificación' }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input v-model="newCert.nombre" label="Nombre" autofocus />
            <q-input v-model="newCert.entidad" label="Entidad emisora" class="q-mt-sm" />
            <q-input v-model="newCert.url" label="URL de credencial" class="q-mt-sm" />
            <q-input v-model="newCert.fechaObtencion" label="Fecha" type="date" class="q-mt-sm" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn flat label="Guardar" color="primary" @click="saveCert" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()

const user = ref({
  colaboradorSkills: [],
  certificaciones: [],
  descripcionPerfil: '',
})

const skillTab = ref('tecnicas')
const showSkillDialog = ref(false)
const showCertDialog = ref(false)
const isEditingCert = ref(false)
const isEditingSkill = ref(false)
const editingCertId = ref(null)

const allSkills = ref([])
const availableSkills = ref([])
const skillLevels = ref([])

const newSkill = ref({ skillId: null, nivelId: null })
const newCert = ref({ nombre: '', entidad: '', url: '', fechaObtencion: '' })

const vacantesRecomendadas = ref([])

const isLeader = computed(() => authStore.user?.rol === 'Lider')

const technicalSkills = computed(
  () => user.value.colaboradorSkills?.filter((s) => s.skill.categoria === 'Tecnica') || [],
)
const softSkills = computed(
  () => user.value.colaboradorSkills?.filter((s) => s.skill.categoria === 'Blanda') || [],
)

onMounted(async () => {
  await fetchUserData()
  await fetchCatalogs()
  await loadVacantesRecomendadas()
})

async function fetchUserData() {
  try {
    const userId = authStore.user?.id
    if (!userId) return
    const { data } = await api.get(`/api/Usuarios/${userId}`)
    user.value = data
  } catch (error) {
    console.error('Error fetching user:', error)
  }
}

async function fetchCatalogs() {
  try {
    skillLevels.value = [
      { id: 1, nombre: 'Básico' },
      { id: 2, nombre: 'Intermedio' },
      { id: 3, nombre: 'Avanzado' },
      { id: 4, nombre: 'Experto' },
    ]

    try {
      const { data } = await api.get('/api/Skills')
      allSkills.value = data
    } catch (e) {
      console.error('Error fetching skills:', e)
      allSkills.value = [
        { id: 1, nombre: 'Python', categoria: 'Tecnica' },
        { id: 2, nombre: 'Liderazgo', categoria: 'Blanda' },
      ]
    }
  } catch (error) {
    console.error(error)
  }
}

function filterSkills(val, update) {
  const category = skillTab.value === 'tecnicas' ? 'Tecnica' : 'Blanda'
  const skillsByCategory = allSkills.value.filter((s) => s.categoria === category)

  if (val === '') {
    update(() => {
      availableSkills.value = skillsByCategory
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    availableSkills.value = skillsByCategory.filter(
      (v) => v.nombre.toLowerCase().indexOf(needle) > -1,
    )
  })
}

async function updateOpenToWork(val) {
  try {
    await api.put(`/api/Usuarios/${user.value.id}/opentowork`, { openToWork: val })
    $q.notify({ type: 'positive', message: 'Disponibilidad actualizada' })
  } catch (error) {
    console.error('Error updating OpenToWork:', error)
    $q.notify({ type: 'negative', message: 'Error al actualizar disponibilidad' })
    user.value.openToWork = !val
  }
}

async function updateProfileDescription() {
  try {
    await api.put(`/api/Usuarios/${user.value.id}/profile`, {
      nombre: user.value.nombre,
      apellido: user.value.apellido,
      puestoActual: user.value.puestoActual,
      descripcionPerfil: user.value.descripcionPerfil,
      fotoPerfil: user.value.fotoPerfil,
    })
    $q.notify({ type: 'positive', message: 'Perfil actualizado' })
  } catch (error) {
    console.error('Error updating profile:', error)
    $q.notify({ type: 'negative', message: 'Error al actualizar perfil' })
  }
}

function openAddSkill() {
  isEditingSkill.value = false
  newSkill.value = { skillId: null, nivelId: null }
  showSkillDialog.value = true
}

function openEditSkill(skill) {
  isEditingSkill.value = true
  newSkill.value = { skillId: skill.skillId, nivelId: skill.nivelId }
  showSkillDialog.value = true
}

async function saveSkill() {
  try {
    await api.post(`/api/Usuarios/${user.value.id}/skills`, {
      skillId: newSkill.value.skillId,
      nivelId: newSkill.value.nivelId,
    })
    $q.notify({
      type: 'positive',
      message: isEditingSkill.value ? 'Habilidad actualizada' : 'Habilidad agregada',
    })
    showSkillDialog.value = false
    await fetchUserData()
  } catch (error) {
    console.error('Error saving skill:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar habilidad' })
  }
}

function openAddCert() {
  isEditingCert.value = false
  newCert.value = { nombre: '', entidad: '', url: '', fechaObtencion: '' }
  showCertDialog.value = true
}

function openEditCert(cert) {
  isEditingCert.value = true
  editingCertId.value = cert.id
  const date = cert.fechaObtencion ? new Date(cert.fechaObtencion).toISOString().split('T')[0] : ''
  newCert.value = {
    nombre: cert.nombre,
    entidad: cert.entidad,
    url: cert.url,
    fechaObtencion: date,
  }
  showCertDialog.value = true
}

async function saveCert() {
  try {
    if (isEditingCert.value) {
      await api.put(
        `/api/Usuarios/${user.value.id}/certificaciones/${editingCertId.value}`,
        newCert.value,
      )
      $q.notify({ type: 'positive', message: 'Certificación actualizada' })
    } else {
      await api.post(`/api/Usuarios/${user.value.id}/certificaciones`, newCert.value)
      $q.notify({ type: 'positive', message: 'Certificación agregada' })
    }

    showCertDialog.value = false
    newCert.value = { nombre: '', entidad: '', url: '', fechaObtencion: '' }
    await fetchUserData()
  } catch (error) {
    console.error('Error saving certification:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar certificación' })
  }
}

async function deleteCert(cert) {
  if (!confirm('¿Estás seguro de eliminar esta certificación?')) return
  try {
    await api.delete(`/api/Usuarios/${user.value.id}/certificaciones/${cert.id}`)
    $q.notify({ type: 'positive', message: 'Certificación eliminada' })
    await fetchUserData()
  } catch (error) {
    console.error('Error deleting certification:', error)
    $q.notify({ type: 'negative', message: 'Error al eliminar certificación' })
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

function getStatusColor(status) {
  if (status === 'Validado') return 'positive'
  return 'grey-7'
}

async function loadVacantesRecomendadas() {
  try {
    const { data } = await api.get('/api/Vacantes')
    vacantesRecomendadas.value = (data || [])
      .filter((v) => v.estado === 'Abierta')
      .slice(0, 5)
      .map((v) => ({
        ...v,
        matchScore: Math.floor(Math.random() * 30) + 70,
      }))
  } catch (error) {
    console.error('Error cargando vacantes recomendadas:', error)
  }
}

function editarPerfil() {
  $q.notify({ type: 'info', message: 'Edición avanzada de perfil próximamente' })
}
</script>

<style scoped>
.perfil-wrapper {
  max-width: 1100px;
}

.perfil-card {
  border-radius: 14px;
}
</style>
