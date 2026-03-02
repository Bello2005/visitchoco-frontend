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
| Mapas | Leaflet + React Leaflet + leaflet.markercluster + Canvas GridLayer custom |
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
│       ├── GrayscaleTileLayer.tsx       # Canvas GridLayer: grayscale + Chocó en color + agua azul
│       ├── MunicipalityBoundaries.tsx   # Boundaries con soporte de mapa de calor étnico
│       ├── IndigenousReserveBoundaries.tsx
│       ├── ClusteredMarkers.tsx         # Dot markers + leaflet.markercluster
│       ├── panel/                       # Panel unificado
│       │   ├── UnifiedPanel.tsx         # Desktop sidebar + MobilePanel (bottom sheet)
│       │   ├── PanelHeader.tsx          # Logo + búsqueda + login + cerrar
│       │   ├── SectionNav.tsx           # Tabs: Mapa / Animales / Turismo / Fiestas
│       │   ├── FilterChips.tsx          # Chips horizontales de filtro
│       │   ├── ItemList.tsx             # Lista de municipios o reservas
│       │   ├── DetailView.tsx           # Vista de detalle con botón volver
│       │   └── PanelToggleButton.tsx    # Botón flotante para reabrir el panel
│       ├── detail/                      # Vistas de detalle por tipo
│       │   ├── MunicipalityDetail.tsx   # Hero foto/fallback + tabs clima/transporte/población
│       │   ├── ReserveDetail.tsx
│       │   └── EthnicDetail.tsx         # Barras étnicas + correlación con heatmap
│       └── overlay/
│           └── MapControls.tsx          # Controles de zoom y reset
├── context/
│   └── AuthContext.tsx  # Estado global de autenticación (useReducer)
├── hooks/
│   ├── useMapState.ts       # Estado centralizado del mapa + URL deep links (useSearchParams)
│   ├── useEthnicHeatmap.ts  # Fetch lazy → Map<cod_dane, grupo étnico dominante>
│   └── api/
│       └── useMunicipalities.ts
├── pages/
│   ├── Landing/         # Página de inicio
│   ├── Login/           # Login con JWT
│   ├── Register/        # Registro de usuario
│   ├── Map/             # Mapa interactivo del Chocó (full-canvas, sin navbar)
│   ├── Animals/         # Fauna del departamento
│   ├── Tourism/         # Atractivos turísticos
│   ├── Festival/        # Festivales y eventos
│   ├── Dashboard/       # Panel admin y usuario
│   └── NotFound/        # 404
├── services/
│   ├── api.service.ts               # Instancia axios + interceptor de token
│   ├── auth.service.ts
│   ├── municipality.service.ts
│   ├── ethnicDistribution.service.ts
│   ├── indigenousReserve.service.ts
│   └── weather.service.ts
├── styles/              # CSS global, Tailwind, constantes
├── test/                # Setup de Vitest
├── types/               # Tipos TypeScript globales (FilterCategory, etc.)
└── utils/               # Funciones de utilidad
```

---

## Mapa interactivo

La página `/mapa` usa un layout **full-canvas** (`100dvh`) sin barra de navegación — todo el UI es un overlay sobre el mapa Leaflet.

### Panel unificado

| Dispositivo | Comportamiento |
|-------------|---------------|
| Desktop ≥769px | Sidebar izquierdo de 380px, abierto por defecto |
| Mobile ≤768px | Bottom sheet deslizable desde abajo, cerrado por defecto, drag-to-dismiss |

El estado completo del mapa vive en `useMapState.ts`:

```
panelView: "list" | "detail"
  "list"   → ItemList  (municipios o reservas con búsqueda y filtros)
  "detail" → DetailView (detalle del elemento seleccionado)
```

### Deep links (URL con estado)

La URL refleja el estado del mapa en tiempo real para compartir y SEO:

| URL | Comportamiento |
|-----|----------------|
| `/mapa?m=quibdo` | Abre el detalle de Quibdó directamente |
| `/mapa?r=5` | Abre la reserva indígena con ID 5 |
| `/mapa?filtro=indigenous` | Activa el filtro de reservas indígenas |
| `/mapa?filtro=ethnic` | Activa el mapa de calor étnico |

### Mapa de calor étnico

Al activar el filtro **Etnias**, cada municipio se colorea con su grupo étnico dominante (fuente DANE). El fetch de datos es lazy (solo cuando el filtro está activo) mediante `useEthnicHeatmap`. Renderizado como mapa coroplético: borde blanco fino + relleno semi-transparente del color étnico.

### Efecto visual del mapa base

`GrayscaleTileLayer` procesa tiles de OSM píxel a píxel usando la Canvas API:
- **Fuera del Chocó** → escala de grises, preservando azul del agua (`#aad3df`)
- **Dentro del Chocó** → colores naturales del mapa (selva verde, ríos azules, relieve)

---

## Autenticación

```
Login exitoso
  → API devuelve { token, role }
  → login({ token, role }) en AuthContext
  → localStorage.setItem("authToken") + localStorage.setItem("userRole")
  → dispatch LOGIN → isAuthenticated: true

Logout
  → logout() → removeItem → dispatch LOGOUT → redirige a /
```

### PrivateRoute

```tsx
// Solo administradores
<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>
```

### Interceptor de Axios

Todas las llamadas incluyen el token automáticamente:
```
Authorization: Bearer <token>
```

---

## Páginas

| Ruta | Auth | Descripción |
|------|------|-------------|
| `/` | No | Landing page con hero, secciones y CTA |
| `/login` | No | Formulario de login con animaciones 3D/Lottie |
| `/register` | No | Registro de nuevo usuario |
| `/mapa` | No | Mapa interactivo full-canvas del Chocó |
| `/animales` | No | Fauna del departamento |
| `/turismo` | No | Atractivos turísticos |
| `/fiesta` | No | Festivales y eventos culturales |
| `/admin/dashboard` | `admin` | Panel de administración |
| `/user/dashboard` | `user` | Panel de usuario |
| `*` | No | 404 |

---

## Variables de entorno

Crear `.env.local` en la raíz:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Instalación y desarrollo

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local   # completar con valores reales

# Desarrollo con hot reload
pnpm dev

# Build producción
pnpm build

# Tests
pnpm test
```

---

## Testing

| Suite | Tests | Descripción |
|-------|-------|-------------|
| `AuthContext.test.tsx` | 4 | Estado inicial, login, logout, persistencia en localStorage |
| `PrivateRoute.test.tsx` | 4 | Sin token, sin rol, con rol correcto, token válido |

---

## Despliegue en Vercel

```bash
vercel --prod
```

Variables en Vercel → Settings → Environment Variables:

`VITE_API_BASE_URL` · `VITE_RECAPTCHA_SITE_KEY` · `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY`

---

## Características principales

- **Mapa full-canvas** — panel único unificado (sidebar en desktop, bottom sheet en mobile con drag-to-dismiss)
- **Efecto visual del mapa** — tiles OSM en escala de grises fuera del Chocó, colores naturales dentro; procesado tile a tile con Canvas API
- **Mapa de calor étnico** — boundaries coloreados por grupo dominante DANE al activar filtro Etnias (coroplético con borde blanco)
- **Deep links** — `/mapa?m=quibdo` abre directamente un municipio; la URL se sincroniza al navegar
- **Clusters de marcadores** — leaflet.markercluster con count visible + label "municipios"
- **Hero visual** en detalle de municipio — foto real si disponible, gradiente teal + emoji como fallback
- **Clima en tiempo real** por municipio vía OpenWeatherMap
- **JWT auth** con roles admin/user e interceptor axios automático
- **i18n** con i18next · **ErrorBoundary** global · **Framer Motion** para animaciones
