<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Inicio de Sesión</div>
      <div class="text-subtitle2 text-grey-7">Ingresa tus credenciales para continuar</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <!-- Banner de error -->
      <q-banner v-if="errorMessage" class="q-mb-md" dense rounded inline-actions type="warning">
        {{ errorMessage }}
      </q-banner>

      <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
        <!-- Correo -->
        <q-input
          v-model="email"
          label="Correo"
          type="email"
          autocomplete="username"
          dense
          :disable="loading"
          :rules="[rules.required, rules.email]"
        />

        <!-- Contraseña -->
        <q-input
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          label="Contraseña"
          autocomplete="current-password"
          dense
          :disable="loading"
          :rules="[rules.required, rules.min6]"
        >
          <template #append>
            <q-icon
              :name="isPwd ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <!-- Recordarme + botón Ingresar -->
        <div class="row items-center q-gutter-sm">
          <q-checkbox v-model="remember" label="Recordarme" :disable="loading" />
          <q-space />
          <q-btn color="primary" label="Ingresar" type="submit" :loading="loading" />
        </div>

        <!-- Registro -->
        <div class="q-mt-sm text-center">
          <span class="text-grey-7">¿No tienes cuenta?</span>
          <q-btn flat color="primary" label="Regístrate aquí" to="/register" no-caps />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useApiError } from 'src/composables/useApiError'

const router = useRouter()
const auth = useAuthStore()
const { notifyError, notifySuccess } = useApiError()

const formRef = ref(null)
const email = ref('')
const password = ref('')
const remember = ref(true)
const isPwd = ref(true)

const loading = ref(false)

const errorMessage = computed(() => {
  const err = auth.error
  if (!err) return ''
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Credenciales inválidas. Verifica tu correo y contraseña.'
  )
})

// Reglas de validación
const rules = {
  required: (v) => !!v || 'Requerido',
  email: (v) => /\S+@\S+\.\S+/.test(v) || 'Email inválido',
  min6: (v) => (v?.length ?? 0) >= 6 || 'Mínimo 6 caracteres',
}

async function onSubmit() {
  // 👇 si ya está en medio de un login, no hagas nada
  if (loading.value) return

  const ok = await formRef.value.validate()
  if (!ok) return

  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    notifySuccess('Bienvenido')

    // / 🔹 Solo redirigir a mi-perfil
    await router.push('/mi-perfil')
  } catch (err) {
    notifyError(err, 'No se pudo iniciar sesión')
  } finally {
    loading.value = false
  }
}
</script>
