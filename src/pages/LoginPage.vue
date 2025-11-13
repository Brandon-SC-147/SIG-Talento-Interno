<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Inicio de Sesión</div>
      <div class="text-subtitle2 text-grey-7">Ingresa tus credenciales para continuar</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-banner v-if="isDemo" inline-actions class="q-mb-md bg-grey-9 text-amber-5">
        Modo demo activo (solo desarrollo). Puedes usar las credenciales demo o lo configurado en
        .env.
      </q-banner>
      <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          v-model="email"
          label="Correo"
          type="email"
          autocomplete="username"
          dense
          :rules="[rules.required, rules.email]"
        />
        <q-input
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          label="Contraseña"
          autocomplete="current-password"
          dense
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
          <q-checkbox v-model="remember" label="Recordarme" />
          <q-space />
          <q-btn color="primary" label="Ingresar" type="submit" :loading="loading" />
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

const isDemo = computed(
  () => import.meta.env.VITE_USE_FAKE_AUTH === 'true' && !import.meta.env.PROD,
)

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
    const redirect = router.currentRoute.value.query?.redirect || '/colaboradores'
    router.push(redirect)
  } catch (err) {
    notifyError(err, 'No se pudo iniciar sesión')
  } finally {
    loading.value = false
  }
}
</script>
