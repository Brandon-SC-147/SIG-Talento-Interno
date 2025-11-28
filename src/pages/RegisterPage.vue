<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Crear Cuenta</div>
      <div class="text-subtitle2 text-grey-7">Regístrate para acceder al sistema</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-banner v-if="errorMessage" class="q-mb-md bg-negative text-white" dense rounded>
        {{ errorMessage }}
      </q-banner>

      <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.nombre"
              label="Nombre"
              dense
              outlined
              :disable="loading"
              :rules="[rules.required, rules.min2]"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.apellido"
              label="Apellido"
              dense
              outlined
              :disable="loading"
              :rules="[rules.required, rules.min2]"
            />
          </div>
        </div>

        <q-input
          v-model="form.email"
          label="Correo electrónico"
          type="email"
          autocomplete="email"
          dense
          outlined
          :disable="loading"
          :rules="[rules.required, rules.email]"
        />

        <q-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Contraseña"
          autocomplete="new-password"
          dense
          outlined
          :disable="loading"
          :rules="[rules.required, rules.min6]"
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          label="Confirmar contraseña"
          autocomplete="new-password"
          dense
          outlined
          :disable="loading"
          :rules="[rules.required, rules.matchPassword]"
        />

        <q-input
          v-model="form.puesto"
          label="Puesto actual"
          dense
          outlined
          :disable="loading"
          placeholder="Ej: Desarrollador Frontend"
        />

        <q-select
          v-model="form.rolId"
          :options="roleOptions"
          label="Rol"
          dense
          outlined
          emit-value
          map-options
          :disable="loading"
        />

        <div class="row items-center justify-between q-mt-md">
          <router-link to="/login" class="text-primary">
            ¿Ya tienes cuenta? Inicia sesión
          </router-link>
          <q-btn
            color="primary"
            label="Registrarse"
            type="submit"
            :loading="loading"
            icon="person_add"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useApiError } from 'src/composables/useApiError'

const router = useRouter()
const auth = useAuthStore()
const { notifyError, notifySuccess } = useApiError()

const formRef = ref(null)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: '',
  puesto: '',
  rolId: 3, // Colaborador por defecto
})

const roleOptions = [
  { label: 'Colaborador', value: 3 },
  { label: 'Líder', value: 2 },
  { label: 'RRHH / Admin', value: 1 },
]

const rules = {
  required: (v) => !!v || 'Campo requerido',
  min2: (v) => (v?.length ?? 0) >= 2 || 'Mínimo 2 caracteres',
  min6: (v) => (v?.length ?? 0) >= 6 || 'Mínimo 6 caracteres',
  email: (v) => /\S+@\S+\.\S+/.test(v) || 'Email inválido',
  matchPassword: (v) => v === form.value.password || 'Las contraseñas no coinciden',
}

async function onSubmit() {
  const ok = await formRef.value.validate()
  if (!ok) return

  loading.value = true
  errorMessage.value = ''

  try {
    await auth.register({
      nombre: form.value.nombre,
      apellido: form.value.apellido,
      email: form.value.email,
      password: form.value.password,
      puesto: form.value.puesto,
      rolId: form.value.rolId,
    })

    notifySuccess('Cuenta creada exitosamente')

    // Auto-login después de registrar
    try {
      await auth.login({
        email: form.value.email,
        password: form.value.password,
      })
      router.push(auth.homeByRole(auth.user?.role))
    } catch {
      // Si falla el auto-login, redirigir al login
      router.push('/login')
    }
  } catch (err) {
    errorMessage.value = err?.response?.data?.message || err?.message || 'Error al crear la cuenta'
    notifyError(err, 'No se pudo crear la cuenta')
  } finally {
    loading.value = false
  }
}
</script>
