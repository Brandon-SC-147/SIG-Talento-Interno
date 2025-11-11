// Centraliza rutas (ajústalas a tu API real)
export const Endpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  collaborators: {
    base: '/collaborators',
    byId: (id) => `/collaborators/${id}`,
  },
  skills: {
    base: '/skills',
  },
  vacancies: {
    base: '/vacancies',
  },
}
