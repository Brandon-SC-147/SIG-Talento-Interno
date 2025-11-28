// Endpoints del backend .NET: https://github.com/AldoRJ24/SistemaDeGestionTalento
export const Endpoints = {
  auth: {
    login: '/Auth/login',
    register: '/Auth/register',
  },
  usuarios: {
    base: '/Usuarios',
    byId: (id) => `/Usuarios/${id}`,
    assignSkill: (id) => `/Usuarios/${id}/skills`,
  },
  skills: {
    base: '/Skills',
    byId: (id) => `/Skills/${id}`,
  },
  vacantes: {
    base: '/Vacantes',
    byId: (id) => `/Vacantes/${id}`,
    assignSkill: (id) => `/Vacantes/${id}/skills`,
  },
  matches: {
    byVacante: (vacanteId) => `/Matches/vacante/${vacanteId}`,
  },
}
