# SIG Talento Interno – Frontend (Quasar + Vue 3 + Pinia)

Frontend para gestión de competencias, colaboradores y vacantes internas (Skill Mapping).

## Tecnologías

- Vue 3 (Composition API)
- Quasar Framework (UI y temas)
- Pinia (stores de estado)
- Axios (HTTP client)
- ESLint + Prettier (calidad de código)

## Estructura principal

```
src/
	boot/axios.js         # Inicialización Axios
	components/           # Componentes UI reutilizables
		collaborators/      # Form y elementos del módulo colaboradores
	composables/          # Hooks (manejo de errores, etc.)
	layouts/              # Layouts principales
	pages/                # Vistas por ruta (Index, CollaboratorsPage)
	router/               # Configuración de rutas
	services/             # Endpoints centralizados
	stores/               # Pinia (auth, colaboradores, ...)
	css/                  # Estilos globales / variables SCSS
```

## Scripts

```bash
npm install        # Instala dependencias
npm run dev        # quasar dev
npm run build      # quasar build
npm run lint       # ESLint
npm run format     # Prettier write
```

## Variables de entorno

Crear `./.env` o `./.env.local` (no se versionan). Ejemplo:

```
VITE_API_BASE_URL=https://api.midominio.com
VITE_FEATURE_SKILLS=true
```

`boot/axios.js` puede leer `import.meta.env.VITE_API_BASE_URL` (pendiente de refactor si se aprueba).

## Módulos implementados

- Autenticación (store `auth.js` – token persistente y header Authorization).
- Colaboradores (listado con QTable, CRUD, formulario validado y diálogo).
- Manejo de errores uniforme (`useApiError`).

## Próximos módulos

- Competencias (skills)
- Vacantes (vacancies)
- Mapeo de brechas (gap analysis)

## Convenciones API esperadas

```
GET /collaborators?page&limit&sortBy&order&search -> { items: [], total }
POST /collaborators -> { id, ... }
PUT /collaborators/:id -> { id, ... }
DELETE /collaborators/:id -> 204
POST /auth/login -> { token, user }
```

## Buenas prácticas aplicadas

- Paginación y orden server-side.
- Validaciones en formularios (required, email, mínimos).
- Separación de stores por dominio.
- Centralización de endpoints (`services/endpoints.js`).
- Notificaciones de errores éxito/fracaso con Quasar Notify.

## Performance

- Actualización controlada de tabla (event `@request`).
- Lazy loading en rutas (import dinámico).
- Posibilidad de debounce en búsqueda (pendiente de confirmar).

## Seguridad (base)

- Token JWT en header Authorization.
- Espacio para interceptores de Axios (retry 401, sanitización de errores).
- Evitar exponer datos sensibles en mensajes.

## Preparando backend futuro

Se puede añadir un backend en carpeta `backend/` (Node/Nest/Fastify/Express). Recomendaciones:

```
backend/
	src/
		modules/ (auth, collaborators, skills, vacancies)
		common/
	prisma/ (opcional ORM)
	package.json
```

- Usar versiones alineadas con Node 20 (ver `package.json`).
- Definir contrato OpenAPI/Swagger temprano.
- Habilitar CORS restringido al dominio del frontend.
- Estrategia refresh token vs access token corto.
- Rate limiting (colaboradores y autenticación).

## Monorepo opcional

Si la escala crece, migrar a pnpm workspaces:

```
packages/
	frontend/
	backend/
```

## Testing (pendiente)

- Unit: Vitest/Jest para stores y composables.
- E2E: Cypress/Playwright para flujos CRUD.

## CI/CD breve (futuro)

- Pipeline: lint -> test -> build -> docker image.
- Deploy S3/CloudFront o Netlify para frontend; backend en ECS/Kubernetes.

## Contribución

1. Crear rama feature/nombre.
2. Añadir tests si cambia lógica.
3. Pull Request con descripción y evidencias.

## Licencia

Pendiente (agregar MIT o licencia corporativa).

---

Para habilitar interceptores Axios y búsqueda con debounce, abrir un issue o solicitar directamente.
