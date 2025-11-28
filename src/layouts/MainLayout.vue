<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> SIG Talento Interno </q-toolbar-title>

        <div class="text-caption q-mr-md" v-if="authStore.user">
          {{ authStore.user.email }}
        </div>
        <q-btn flat round icon="logout" @click="logout" v-if="authStore.isAuthenticated">
          <q-tooltip>Cerrar sesión</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Navegación </q-item-label>

        <q-item to="/colaboradores" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="group" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Colaboradores</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Vacantes - Para Líderes y Admin -->
        <q-item to="/vacantes" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="work" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Vacantes / Proyectos</q-item-label>
            <q-item-label caption>Crear y gestionar perfiles</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Dashboard - Para Admin/RRHH -->
        <q-item to="/dashboard" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard RRHH</q-item-label>
            <q-item-label caption>Estadísticas y reportes</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header> Información </q-item-label>
        <q-item>
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ authStore.user?.email || 'Usuario' }}</q-item-label>
            <q-item-label caption>{{ userRoleLabel }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Rol del usuario actual
const userRole = computed(() => {
  const role = authStore.user?.role || ''
  return role.toString().toLowerCase()
})

const userRoleLabel = computed(() => {
  const r = userRole.value
  if (r.includes('admin') || r.includes('rrhh') || r.includes('hr')) return 'Administrador / RRHH'
  if (r.includes('lider') || r.includes('líder') || r.includes('leader')) return 'Líder'
  return 'Colaborador'
})

// Permisos de navegación (para uso futuro con control de acceso por rol)
// const canAccessVacantes = computed(() => {
//   const r = userRole.value
//   return r.includes('admin') || r.includes('rrhh') || r.includes('hr') ||
//          r.includes('lider') || r.includes('líder') || r.includes('leader')
// })
// const canAccessDashboard = computed(() => {
//   const r = userRole.value
//   return r.includes('admin') || r.includes('rrhh') || r.includes('hr')
// })

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
