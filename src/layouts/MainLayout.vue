<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> SIG Talento Interno </q-toolbar-title>

        <div class="text-caption">Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Navegación </q-item-label>
        <q-item
          v-if="authRequired"
          to="/login"
          exact
          clickable
          v-ripple
          class="disabled"
          @click.prevent
        >
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Inicio de Sesión</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/colaboradores" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="group" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Colaboradores</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Futuras secciones
        <q-item to="/competencias" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="psychology" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Competencias</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/vacantes" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="work" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Vacantes</q-item-label>
          </q-item-section>
        </q-item>
        -->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
const authRequired = import.meta?.env?.VITE_REQUIRE_AUTH !== 'false'

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
