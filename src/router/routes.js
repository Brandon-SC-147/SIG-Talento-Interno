const routes = [
  // Rutas públicas (auth)
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', name: 'login', component: () => import('pages/LoginPage.vue') }],
  },

  // Rutas protegidas (app)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/mi-perfil',
      },
      // === COLABORADOR ===
      {
        path: 'mi-perfil',
        name: 'mi-perfil',
        component: () => import('pages/MiPerfilPage.vue'),
        meta: { title: 'Mi Perfil' },
      },
      // === LÍDER ===
      {
        path: 'lider',
        name: 'lider-dashboard',
        component: () => import('pages/LiderDashboardPage.vue'),
        meta: { title: 'Panel del Líder', roles: ['Líder', 'Lider', 'Admin', 'RRHH'] },
      },
      {
        path: 'vacantes',
        name: 'vacantes',
        component: () => import('pages/VacantesPage.vue'),
        meta: { title: 'Vacantes', roles: ['Líder', 'Lider', 'Admin', 'RRHH'] },
      },
      // === ADMIN / RRHH ===
      {
        path: 'colaboradores',
        name: 'colaboradores',
        component: () => import('pages/CollaboratorsPage.vue'),
        meta: { title: 'Colaboradores', roles: ['Admin', 'RRHH'] },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { title: 'Dashboard RRHH', roles: ['Admin', 'RRHH', 'HR'] },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
