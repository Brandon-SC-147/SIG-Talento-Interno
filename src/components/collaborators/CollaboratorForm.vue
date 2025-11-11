<template>
  <q-form @submit.prevent="onSubmit" @reset.prevent="onCancel" ref="formRef" class="q-gutter-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="localModel.name"
          label="Nombre"
          :rules="[rules.required, rules.min3]"
          dense
          clearable
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-model="localModel.email"
          label="Email"
          type="email"
          :rules="[rules.required, rules.email]"
          dense
          clearable
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input v-model="localModel.role" label="Rol" :rules="[rules.required]" dense clearable />
      </div>
      <div class="col-12 col-md-6">
        <q-select
          v-model="localModel.skills"
          :options="skillOptions"
          label="Competencias"
          use-chips
          multiple
          emit-value
          map-options
          dense
        />
      </div>
    </div>

    <div class="row justify-end q-gutter-sm q-mt-md">
      <q-btn flat color="primary" label="Cancelar" @click="onCancel" :disable="loading" />
      <q-btn color="primary" :label="submitLabel" type="submit" :loading="loading" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ name: '', email: '', role: '', skills: [] }) },
  loading: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  skillOptions: { type: Array, default: () => [] }, // [{ label, value }]
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])
const formRef = ref(null)
const localModel = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    localModel.value = { ...val }
  },
)

watch(
  () => localModel.value,
  (val) => emit('update:modelValue', val),
  { deep: true },
)

const submitLabel = computed(() => (props.mode === 'edit' ? 'Guardar cambios' : 'Crear'))

const rules = {
  required: (v) => !!v || 'Requerido',
  min3: (v) => (v?.length ?? 0) >= 3 || 'Mínimo 3 caracteres',
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
