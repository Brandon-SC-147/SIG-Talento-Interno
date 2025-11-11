const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'colaboradores', component: () => import('pages/CollaboratorsPage.vue') },
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
