const routes = [
  // Rutas públicas (auth)
  {
    path: '/',
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
        path: 'colaboradores',
        name: 'colaboradores',
        component: () => import('pages/CollaboratorsPage.vue'),
      },
      // { path: 'competencias', component: () => import('pages/SkillsPage.vue') },
      // { path: 'vacantes', component: () => import('pages/VacanciesPage.vue') },
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
