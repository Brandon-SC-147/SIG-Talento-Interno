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

    <!-- Competencias -->
    <q-separator class="q-my-md" />
    <div class="text-subtitle2 text-grey-7 q-mb-sm text-center">Competencias y habilidades</div>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-select
          v-model="localModel.skills"
          :options="skillOptions"
          label="Competencias"
          use-chips
          multiple
          emit-value
          map-options
          dense
          outlined
          option-value="value"
          option-label="label"
        >
          <template #option="{ itemProps, opt, selected, toggleOption }">
            <q-item v-bind="itemProps">
              <q-item-section side>
                <q-checkbox :model-value="selected" @update:model-value="toggleOption(opt)" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
                <q-item-label caption>{{ opt.category || 'General' }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">No hay competencias disponibles</q-item-section>
            </q-item>
          </template>
        </q-select>
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
          placeholder="Certificaciones, cursos completados, notas adicionales..."
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
      skills: [],
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

const statusOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Inactivo', value: 'Inactivo' },
]

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
    skills: [],
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
