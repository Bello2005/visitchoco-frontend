# visitChoco — Frontend

Aplicación web interactiva para explorar el turismo, la biodiversidad y los datos demográficos del departamento del **Chocó, Colombia**.

- **Repositorio:** [github.com/Bello2005/visitchoco-frontend](https://github.com/Bello2005/visitchoco-frontend)
- **API Backend:** [github.com/Bello2005/visitchoco-backend](https://github.com/Bello2005/visitchoco-backend)
- **Desplegado en:** Vercel (SPA estática)

---

## Stack tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework UI | React 19 |
| Build tool | Vite 7 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 3 + MUI 7 |
| Routing | React Router 7 |
| Estado/fetching | React Query 5 (`@tanstack/react-query`) |
| HTTP client | Axios (instancia centralizada con interceptores) |
| Autenticación | JWT en `localStorage` + `AuthContext` (useReducer) |
| Mapas | Leaflet + React Leaflet |
| Animaciones | Framer Motion |
| 3D | Three.js + `@react-three/fiber` + `@react-three/drei` |
| Gráficas | Chart.js + react-chartjs-2 |
| Lottie | lottie-react |
| i18n | i18next + react-i18next |
| Testing | Vitest 4 + Testing Library + jsdom |
| Despliegue | Vercel (SPA con rewrites) |

---

## Arquitectura

```
src/
├── components/
│   ├── common/         # PrivateRoute, ErrorBoundary, Background, Spinner
│   ├── auth/           # Componentes de login/registro
│   ├── brand/          # Logo, branding
│   ├── features/       # Componentes de dominio (fauna, etnias, etc.)
│   ├── landing/        # Secciones de la landing page
│   └── map/            # Mapa interactivo, paneles, capas
├── context/
│   └── AuthContext.tsx # Estado global de autenticación (useReducer)
├── hooks/
│   └── api/            # Hooks de React Query por dominio
│       └── useMunicipalities.ts
├── pages/
│   ├── Landing/        # Página de inicio
│   ├── Login/          # Login con JWT
│   ├── Register/       # Registro de usuario
│   ├── Map/            # Mapa interactivo del Chocó
│   ├── Animals/        # Fauna del departamento
│   ├── Tourism/        # Atractivos turísticos
│   ├── Festival/       # Festivales y eventos
│   ├── Dashboard/      # Panel admin y usuario
│   └── NotFound/       # 404
├── services/           # Llamadas a la API (axios)
│   ├── api.service.ts  # Instancia axios + interceptor de token
│   ├── auth.service.ts
│   ├── municipality.service.ts
│   ├── ethnicDistribution.service.ts
│   ├── indigenousReserve.service.ts
│   └── weather.service.ts
├── styles/             # CSS global, Tailwind, constantes
├── test/               # Setup de Vitest (mock de localStorage)
├── types/              # Tipos TypeScript globales
└── utils/              # Funciones de utilidad
```

---

## Autenticación

El flujo completo está gestionado por `AuthContext`:

```
Login exitoso
  → API devuelve { token, role }
  → login({ token, role }) en AuthContext
  → localStorage.setItem("authToken") + localStorage.setItem("userRole")
  → dispatch LOGIN → estado isAuthenticated: true

Logout
  → logout() en AuthContext
  → localStorage.removeItem de ambas keys
  → dispatch LOGOUT → redirige a /
```

### PrivateRoute

Protege rutas que requieren autenticación o un rol específico:

```tsx
// Solo usuarios autenticados
<PrivateRoute><Dashboard /></PrivateRoute>

// Solo administradores
<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>
```

Si no hay token o el rol no coincide, redirige automáticamente a `/login`.

### Interceptor de Axios

Todas las llamadas a la API incluyen el token automáticamente:

```
Authorization: Bearer <token>
```

Configurado en `services/api.service.ts`. Todos los servicios usan la misma instancia centralizada.

---

## Páginas

| Ruta | Componente | Auth | Descripción |
|------|-----------|------|-------------|
| `/` | `Landing` | No | Página principal con hero, secciones y CTA |
| `/login` | `Login` | No | Formulario de login con animaciones 3D/Lottie |
| `/register` | `Register` | No | Registro de nuevo usuario |
| `/mapa` | `Map` | No | Mapa interactivo Leaflet con capas del Chocó |
| `/animales` | `Animals` | No | Fauna del departamento |
| `/turismo` | `Tourism` | No | Atractivos turísticos |
| `/fiesta` | `Festival` | No | Festivales y eventos culturales |
| `/admin/dashboard` | `AdminDashboard` | `admin` | Panel de administración |
| `/user/dashboard` | `UserDashboard` | `user` | Panel de usuario |
| `*` | `NotFound` | No | Página 404 |

---

## Variables de entorno

Crear un archivo `.env.local` (desarrollo) o `.env.production` en la raíz:

```env
# URL del backend
VITE_API_BASE_URL=http://localhost:8000/api

# reCAPTCHA v3 (Google)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Supabase (storage de media, opcional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Todas las variables del cliente deben tener el prefijo `VITE_` para que Vite las exponga.

---

## Instalación y desarrollo

### Requisitos previos

- Node.js 20+
- pnpm 9+
- Backend corriendo localmente en `http://localhost:8000`

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env.local   # si existe, o crear manualmente
# editar .env.local con los valores reales

# 3. Iniciar en modo desarrollo (hot reload)
pnpm dev

# 4. Compilar para producción
pnpm build

# 5. Previsualizar la build
pnpm preview
```

---

## Testing

```bash
# Ejecutar tests una vez
pnpm test

# Modo watch (re-ejecuta en cada cambio)
pnpm test:watch
```

| Suite | Tests | Descripción |
|-------|-------|-------------|
| `src/context/AuthContext.test.tsx` | 4 | Estado inicial, login, logout, persistencia en localStorage |
| `src/components/common/PrivateRoute.test.tsx` | 4 | Redirección sin token, sin rol, con rol correcto, con token válido |

El setup de Vitest incluye un mock completo de `localStorage` compatible con jsdom v28 (`src/test/setup.ts`).

---

## Estructura de estilos

El proyecto usa **Tailwind CSS** + **MUI** como sistema de diseño principal.

- Clases utilitarias Tailwind para layouts, espaciado y tipografía
- Componentes MUI para elementos de UI complejos (inputs, selects, dialogs)
- `@emotion/react` y `@emotion/styled` como peer dependencies de MUI (no se usan directamente)
- CSS global en `src/index.css` e imports de CSS por página/componente

Todo el código nuevo debe usar **Tailwind + MUI** exclusivamente.

---

## Despliegue en Vercel

El `vercel.json` configura rewrites para que React Router funcione correctamente como SPA:

```bash
# Login (primera vez)
vercel login

# Despliegue preview
vercel

# Despliegue producción
vercel --prod
```

Variables a configurar en el dashboard de Vercel (Settings → Environment Variables):

`VITE_API_BASE_URL` · `VITE_RECAPTCHA_SITE_KEY` · `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY`

---

## Características principales

- **Mapa interactivo** del Chocó con capas de municipios, reservas indígenas y datos geoespaciales (PostGIS + Leaflet)
- **Datos étnicos** — visualización de la distribución étnica por municipio (DANE)
- **Clima en tiempo real** por municipio (OpenWeatherMap)
- **Login/registro** con JWT, roles de admin y usuario
- **Dashboard** diferenciado por rol
- **Internacionalización** con i18next
- **Animaciones** con Framer Motion y Lottie
- **ErrorBoundary** global para capturar errores de render sin crashear la app
