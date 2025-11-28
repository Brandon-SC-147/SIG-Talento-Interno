<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Inicio de Sesión</div>
      <div class="text-subtitle2 text-grey-7">Ingresa tus credenciales para continuar</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-banner v-if="errorMessage" class="q-mb-md" dense rounded inline-actions type="warning">
        {{ errorMessage }}
      </q-banner>
      <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          v-model="email"
          label="Correo"
          type="email"
          autocomplete="username"
          dense
          :disable="loading"
          :rules="[rules.required, rules.email]"
        />
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

        <div class="row items-center q-gutter-sm">
          <q-checkbox v-model="remember" label="Recordarme" :disable="loading" />
          <q-space />
          <q-btn color="primary" label="Ingresar" type="submit" :loading="loading" />
        </div>

        <div class="text-center q-mt-md">
          <router-link to="/register" class="text-primary">
            ¿No tienes cuenta? Regístrate aquí
          </router-link>
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

//

const rules = {
  required: (v) => !!v || 'Requerido',
  email: (v) => /\S+@\S+\.\S+/.test(v) || 'Email inválido',
  min6: (v) => (v?.length ?? 0) >= 6 || 'Mínimo 6 caracteres',
}

async function onSubmit() {
  const ok = await formRef.value.validate()
  if (!ok) return

  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    notifySuccess('Bienvenido')
    const redirect = router.currentRoute.value.query?.redirect || auth.homeByRole(auth.user?.role)
    router.push(redirect)
  } catch (err) {
    notifyError(err, 'No se pudo iniciar sesión')
  } finally {
    loading.value = false
  }
}
</script>
