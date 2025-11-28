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
        <!-- ========== COLABORADOR ========== -->
        <q-item-label header>
          <q-icon name="person" class="q-mr-xs" />
          Colaborador
        </q-item-label>

        <q-item to="/mi-perfil" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="account_circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mi Perfil</q-item-label>
            <q-item-label caption>Skills y disponibilidad</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-sm" />

        <!-- ========== LÍDER ========== -->
        <q-item-label header>
          <q-icon name="supervisor_account" class="q-mr-xs" />
          Líder
        </q-item-label>

        <q-item to="/lider" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="space_dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Panel del Líder</q-item-label>
            <q-item-label caption>Mi equipo y búsqueda</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/vacantes" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="work" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Vacantes / Proyectos</q-item-label>
            <q-item-label caption>Crear y gestionar perfiles</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-sm" />

        <!-- ========== ADMIN / RRHH ========== -->
        <q-item-label header>
          <q-icon name="admin_panel_settings" class="q-mr-xs" />
          Admin / RRHH
        </q-item-label>

        <q-item to="/colaboradores" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="groups" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Gestión Colaboradores</q-item-label>
            <q-item-label caption>Crear, editar, eliminar</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/dashboard" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="analytics" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard RRHH</q-item-label>
            <q-item-label caption>Estadísticas y reportes</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- Info usuario -->
        <q-item-label header> Sesión Actual </q-item-label>
        <q-item>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="sm">
              {{ authStore.user?.email?.charAt(0)?.toUpperCase() || 'U' }}
            </q-avatar>
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

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
