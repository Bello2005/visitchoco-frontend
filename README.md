# VisitChocó — Frontend

Guía digital interactiva del departamento de **Chocó, Colombia**: mapa municipal en tiempo real, biodiversidad, cultura afro e indígena, historia y turismo. Construida con React 19, TypeScript y Tailwind CSS.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 7 |
| Estilos | Tailwind CSS v4 + Framer Motion |
| Routing | React Router 7 |
| Mapa | Leaflet / React Leaflet |
| HTTP | Axios — cliente compartido con inyección JWT |
| Tests | Vitest + Testing Library |
| Package manager | pnpm |

---

## Requisitos

- **Node.js** 20+
- **pnpm** 10+
- Una instancia del **visitchoco-backend** corriendo (para mapa y datos dinámicos)

---

## Inicio rápido

```bash
cd visitchoco-frontend
pnpm install
cp .env.example .env.local
# Editar .env.local — configurar VITE_API_BASE_URL
pnpm dev
```

Servidor de desarrollo: **http://localhost:5173**

### Build de producción

```bash
pnpm build    # tsc -b + Vite bundle
pnpm preview  # sirve el build localmente
```

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_BASE_URL` | Origen de la API, sin trailing slash. Ej: `http://localhost:8000` |
| `VITE_APP_ENV` | `development` o `production` |
| `VITE_API_URL` | Usado por `buildApiUrl()` para rutas de auth. Por defecto: `http://localhost:8000` |

> Los valores `VITE_*` se exponen al navegador. Las API keys de terceros (OpenWeatherMap, etc.) viven exclusivamente en el backend.

---

## Scripts

| Comando | Acción |
|---------|--------|
| `pnpm dev` | Servidor Vite en modo desarrollo |
| `pnpm build` | Typecheck + bundle de producción |
| `pnpm preview` | Sirve el build de producción localmente |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (single run) |
| `pnpm test:watch` | Vitest en modo watch |

---

## Arquitectura

**Patrón de co-localización:** cada página agrupa sus propios componentes. `components/` solo contiene lo compartido entre múltiples páginas.

```
src/
├── components/
│   ├── layout/        # Compartido entre todas las páginas
│   │   ├── MainNav.tsx        # Nav responsivo: bottom tab (móvil) · pill iconos (tablet) · pill labels (desktop)
│   │   ├── SearchModal.tsx    # Búsqueda global — bottom sheet en móvil, dialog en desktop
│   │   ├── LandingFooter.tsx  # Footer informativo del sitio
│   │   └── Footer.tsx         # Footer con reproductor de audio (página Login)
│   ├── map/           # Componentes del mapa interactivo
│   │   ├── panel/             # Panel lateral (filtros, detalle, navegación)
│   │   ├── detail/            # Vistas de detalle (municipio, reserva, distribución étnica)
│   │   └── overlay/           # Controles flotantes del mapa
│   ├── auth/          # LoginForm, RegisterForm, AuthTabs
│   ├── common/        # ErrorBoundary, PrivateRoute, Background
│   ├── brand/         # Logo
│   └── features/      # FeatureGrid (panel de características en Login)
│
├── pages/
│   ├── Landing/
│   │   ├── Landing.tsx
│   │   └── components/        # HeroSection, ExploreGrid, StatsStrip, TerritorioSection…
│   ├── Fauna/
│   │   ├── Fauna.tsx
│   │   └── components/        # FaunaHero, EspeciesGrid, BallenasFeature, BiodiversityStrip…
│   ├── Festival/
│   │   ├── Festival.tsx
│   │   └── components/        # FiestaHero, CalendarioAnual, FiestasGrid, SanPachoFeature…
│   ├── Cultura/
│   │   ├── Cultura.tsx
│   │   └── components/        # CulturaHero, PESSection, ChirimiaSection, GastronomiaSection…
│   ├── Historia/
│   │   ├── Historia.tsx
│   │   └── components/        # HistoriaHero, LineaTiempo, CimarronajeSection, Personajes…
│   ├── Tourism/
│   │   ├── Tourism.tsx
│   │   └── components/        # TurismoHero, DestinosGrid, RNTSection, TemporadasSection…
│   ├── Map/           # Mapa interactivo Leaflet (pantalla completa)
│   ├── Dashboard/     # AdminDashboard / UserDashboard (requiere JWT)
│   └── Login/ Register/ Acerca/ Fuentes/ NotFound/
│
├── content/           # Datos estáticos estructurados
│   ├── faunaData.ts           # Especies icónicas, parques naturales, estadísticas
│   ├── fiestaData.ts          # Fiestas de respaldo cuando la API no responde
│   └── dataSources.ts         # Fuentes oficiales (DANE, IGAC, Ministerio de Culturas…)
│
├── hooks/             # useMapState, useFiestas, useEthnicHeatmap, useFeatureRotation…
├── services/          # api.service.ts (Axios), municipality, indigenousReserve, weather…
├── context/           # AuthContext (JWT, usuario autenticado)
├── types/             # municipality.ts, filters.ts, weather.d.ts
└── utils/             # buildApiUrl, subregionFromMunicipio
```

---

## Integración con el backend

El frontend consume la **visitchoco-backend** API bajo `/api/...`.

| Servicio | URL local |
|----------|-----------|
| Frontend | `http://localhost:5173` |
| Backend  | `http://localhost:8000` |

Asegúrate de que la configuración CORS del backend incluya el origen del frontend.

---

## Tests

```bash
pnpm test
```

Vitest usa **jsdom** con setup en `src/test/setup.ts`. Los tests de autenticación (`AuthContext.test.tsx`, `PrivateRoute.test.tsx`) usan mocks de React Router.

---

## Despliegue

Compatible con **Vercel** y cualquier host estático (Netlify, Cloudflare Pages).

1. Configurar `VITE_API_BASE_URL` en las variables de entorno de la plataforma
2. Comando de build: `pnpm build`
3. Directorio de output: `dist/`

---

## Repositorio relacionado

**[visitchoco-backend](../visitchoco-backend)** — API REST con Express 5, PostgreSQL y documentación Swagger en `/api/docs`.
