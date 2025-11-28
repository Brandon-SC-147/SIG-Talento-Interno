<template>
  <q-form
    @submit.prevent="onSubmit"
    @reset.prevent="onCancel"
    ref="formRef"
    class="q-gutter-md q-px-md"
  >
    <!-- Datos personales -->
    <div class="text-subtitle2 text-grey-7 q-mb-sm text-center">Datos personales</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="localModel.nombre"
          label="Nombre"
          :rules="[rules.required, rules.min2]"
          dense
          outlined
          clearable
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-model="localModel.apellido"
          label="Apellido"
          :rules="[rules.required, rules.min2]"
          dense
          outlined
          clearable
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-model="localModel.correo"
          label="Correo electrónico"
          type="email"
          :rules="[rules.required, rules.email]"
          dense
          outlined
          clearable
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-if="props.mode === 'create'"
          v-model="localModel.password"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          :rules="[rules.required, rules.min6]"
          dense
          outlined
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Información laboral -->
    <q-separator class="q-my-md" />
    <div class="text-subtitle2 text-grey-7 q-mb-sm text-center">Información laboral</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="localModel.puestoActual"
          label="Puesto actual"
          :rules="[rules.required]"
          dense
          outlined
          clearable
          placeholder="Ej: Desarrollador Frontend"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-select
          v-model="localModel.rolId"
          :options="roleOptions"
          label="Rol"
          :rules="[rules.required]"
          emit-value
          map-options
          dense
          outlined
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-model="localModel.cuenta"
          label="Cuenta / Proyecto"
          dense
          outlined
          clearable
          placeholder="Ej: Proyecto Alpha"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-select
          v-model="localModel.estado"
          :options="statusOptions"
          label="Estado"
          emit-value
          map-options
          dense
          outlined
        />
      </div>
    </div>

    <!-- Skills Técnicos -->
    <q-separator class="q-my-md" />
    <div class="text-subtitle2 text-grey-7 q-mb-sm text-center">Skills Técnicos</div>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-select
          v-model="selectedTechnicalSkill"
          :options="technicalSkillOptions"
          label="Agregar skill técnico"
          dense
          outlined
          option-value="value"
          option-label="label"
          @update:model-value="addSkill('tecnico')"
          clearable
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">No hay skills técnicos disponibles</q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      <div class="col-12" v-if="localModel.skillsTecnicos?.length">
        <q-list bordered separator class="rounded-borders">
          <q-item v-for="(skill, idx) in localModel.skillsTecnicos" :key="skill.skillId">
            <q-item-section>
              <q-item-label>{{ getSkillLabel(skill.skillId) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="skill.nivelId"
                :options="nivelOptions"
                label="Nivel"
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
                @click="removeSkill('tecnico', idx)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- Skills Blandos -->
    <q-separator class="q-my-md" />
    <div class="text-subtitle2 text-grey-7 q-mb-sm text-center">Skills Blandos</div>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-select
          v-model="selectedSoftSkill"
          :options="softSkillOptions"
          label="Agregar skill blando"
          dense
          outlined
          option-value="value"
          option-label="label"
          @update:model-value="addSkill('blando')"
          clearable
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">No hay skills blandos disponibles</q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      <div class="col-12" v-if="localModel.skillsBlandos?.length">
        <q-list bordered separator class="rounded-borders">
          <q-item v-for="(skill, idx) in localModel.skillsBlandos" :key="skill.skillId">
            <q-item-section>
              <q-item-label>{{ getSkillLabel(skill.skillId) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="skill.nivelId"
                :options="nivelOptions"
                label="Nivel"
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
                @click="removeSkill('blando', idx)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- Certificaciones -->
    <q-separator class="q-my-md" />
    <div class="text-subtitle2 text-grey-7 q-mb-sm text-center">Certificaciones y Cursos</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-10">
        <q-input
          v-model="newCertificacion"
          label="Nueva certificación o curso"
          dense
          outlined
          placeholder="Ej: AWS Certified Solutions Architect"
          @keyup.enter="addCertificacion"
        />
      </div>
      <div class="col-12 col-md-2">
        <q-btn
          color="primary"
          icon="add"
          label="Agregar"
          @click="addCertificacion"
          dense
          class="full-width"
        />
      </div>
      <div class="col-12" v-if="localModel.certificaciones?.length">
        <q-list bordered separator class="rounded-borders">
          <q-item v-for="(cert, idx) in localModel.certificaciones" :key="idx">
            <q-item-section avatar>
              <q-icon name="verified" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ cert }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="removeCertificacion(idx)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- Disponibilidad -->
    <q-separator class="q-my-md" />
    <div class="text-subtitle2 text-grey-7 q-mb-sm text-center">Disponibilidad</div>
    <div class="row q-col-gutter-md items-center">
      <div class="col-12 col-md-6">
        <q-toggle
          v-model="localModel.disponibilidad"
          label="Disponible para movilidad interna"
          color="primary"
        />
      </div>
      <div class="col-12 col-md-6" v-if="localModel.disponibilidad">
        <q-input
          v-model="localModel.fechaDisponibilidad"
          label="Disponible desde"
          type="date"
          dense
          outlined
        />
      </div>
    </div>

    <!-- Observaciones -->
    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12">
        <q-input
          v-model="localModel.observaciones"
          label="Observaciones / Notas"
          type="textarea"
          rows="2"
          dense
          outlined
          placeholder="Notas adicionales..."
        />
      </div>
    </div>

    <div class="row justify-end q-gutter-sm q-mt-lg">
      <q-btn flat color="primary" label="Cancelar" @click="onCancel" :disable="loading" />
      <q-btn color="primary" :label="submitLabel" type="submit" :loading="loading" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      puestoActual: '',
      rolId: null,
      cuenta: '',
      estado: 'Activo',
      skillsTecnicos: [],
      skillsBlandos: [],
      certificaciones: [],
      disponibilidad: true,
      fechaDisponibilidad: '',
      observaciones: '',
    }),
  },
  loading: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  skillOptions: { type: Array, default: () => [] },
  roleOptions: {
    type: Array,
    default: () => [
      { label: 'Colaborador', value: 3 },
      { label: 'Líder', value: 2 },
      { label: 'RRHH / Admin', value: 1 },
    ],
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])
const formRef = ref(null)
const showPassword = ref(false)
const selectedTechnicalSkill = ref(null)
const selectedSoftSkill = ref(null)
const newCertificacion = ref('')

const statusOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Inactivo', value: 'Inactivo' },
]

// Niveles de dominio para skills
const nivelOptions = [
  { label: 'Básico', value: 1 },
  { label: 'Intermedio', value: 2 },
  { label: 'Avanzado', value: 3 },
  { label: 'Experto', value: 4 },
]

// Filtrar skills técnicos (categoría "Técnico" o similar)
const technicalSkillOptions = computed(() => {
  const selectedIds = (localModel.value.skillsTecnicos || []).map((s) => s.skillId)
  return props.skillOptions.filter(
    (s) =>
      (s.category?.toLowerCase() === 'técnico' ||
        s.category?.toLowerCase() === 'tecnico' ||
        s.tipo === 'tecnico') &&
      !selectedIds.includes(s.value),
  )
})

// Filtrar skills blandos (categoría "Blando" o similar)
const softSkillOptions = computed(() => {
  const selectedIds = (localModel.value.skillsBlandos || []).map((s) => s.skillId)
  return props.skillOptions.filter(
    (s) =>
      (s.category?.toLowerCase() === 'blando' ||
        s.category?.toLowerCase() === 'soft' ||
        s.tipo === 'blando') &&
      !selectedIds.includes(s.value),
  )
})

function getSkillLabel(skillId) {
  const skill = props.skillOptions.find((s) => s.value === skillId)
  return skill?.label || `Skill ${skillId}`
}

function addSkill(tipo) {
  if (tipo === 'tecnico' && selectedTechnicalSkill.value) {
    if (!localModel.value.skillsTecnicos) localModel.value.skillsTecnicos = []
    localModel.value.skillsTecnicos.push({
      skillId: selectedTechnicalSkill.value.value,
      nivelId: 2, // Intermedio por defecto
    })
    selectedTechnicalSkill.value = null
  } else if (tipo === 'blando' && selectedSoftSkill.value) {
    if (!localModel.value.skillsBlandos) localModel.value.skillsBlandos = []
    localModel.value.skillsBlandos.push({
      skillId: selectedSoftSkill.value.value,
      nivelId: 2, // Intermedio por defecto
    })
    selectedSoftSkill.value = null
  }
}

function removeSkill(tipo, idx) {
  if (tipo === 'tecnico') {
    localModel.value.skillsTecnicos.splice(idx, 1)
  } else {
    localModel.value.skillsBlandos.splice(idx, 1)
  }
}

function addCertificacion() {
  if (newCertificacion.value?.trim()) {
    if (!localModel.value.certificaciones) localModel.value.certificaciones = []
    localModel.value.certificaciones.push(newCertificacion.value.trim())
    newCertificacion.value = ''
  }
}

function removeCertificacion(idx) {
  localModel.value.certificaciones.splice(idx, 1)
}

function getDefaultModel() {
  return {
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    puestoActual: '',
    rolId: 3,
    cuenta: '',
    estado: 'Activo',
    skillsTecnicos: [],
    skillsBlandos: [],
    certificaciones: [],
    disponibilidad: true,
    fechaDisponibilidad: '',
    observaciones: '',
  }
}

const localModel = ref(getDefaultModel())

// Sincronizar cuando cambia el modelValue (inmediatamente)
watch(
  () => props.modelValue,
  (val) => {
    const newModel = { ...getDefaultModel(), ...val }
    // NUNCA mostrar contraseñas hasheadas del backend
    // El password solo se usa para crear usuarios nuevos
    newModel.password = ''
    // Eliminar campos de hash que puedan venir del backend
    delete newModel.contraseñaHash
    delete newModel.contraseña_hash
    delete newModel.passwordHash

    // Asegurar arrays
    if (!newModel.skillsTecnicos) newModel.skillsTecnicos = []
    if (!newModel.skillsBlandos) newModel.skillsBlandos = []
    if (!newModel.certificaciones) newModel.certificaciones = []

    localModel.value = newModel
    // Resetear validación cuando cambia el modelo
    formRef.value?.resetValidation()
  },
  { immediate: true, deep: true },
)

watch(
  () => localModel.value,
  (val) => emit('update:modelValue', val),
  { deep: true },
)

const submitLabel = computed(() => (props.mode === 'edit' ? 'Guardar cambios' : 'Crear'))

const rules = {
  required: (v) => !!v || v === 0 || 'Campo requerido',
  min2: (v) => (v?.length ?? 0) >= 2 || 'Mínimo 2 caracteres',
  min6: (v) => (v?.length ?? 0) >= 6 || 'Mínimo 6 caracteres',
  email: (v) => /\S+@\S+\.\S+/.test(v) || 'Email inválido',
}

async function onSubmit() {
  const ok = await formRef.value.validate()
  if (!ok) return
  emit('submit', { ...localModel.value })
}

function onCancel() {
  emit('cancel')
}
</script>
