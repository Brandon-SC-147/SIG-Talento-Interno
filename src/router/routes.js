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
        redirect: '/colaboradores',
      },
      {
        path: 'colaboradores',
        name: 'colaboradores',
        component: () => import('pages/CollaboratorsPage.vue'),
      },
      {
        path: 'vacantes',
        name: 'vacantes',
        component: () => import('pages/VacantesPage.vue'),
        meta: { roles: ['Líder', 'Lider', 'Admin', 'RRHH'] },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { roles: ['Admin', 'RRHH', 'HR'] },
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
