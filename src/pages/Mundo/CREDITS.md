# Créditos y licencias — /mundo

La experiencia 3D `/mundo` adapta patrones de código de los portafolios
open-source de **Bruno Simon**, distribuidos bajo licencia **MIT**:

- **folio-2019** — https://github.com/brunosimon/folio-2019
- **folio-2025** — https://github.com/brunosimon/folio-2025

El código aquí no es una copia literal: son reimplementaciones en React Three
Fiber + Rapier de mecánicas y técnicas de esos repos. Aun así, por ser obras
derivadas de software MIT, incluimos el aviso de copyright y la licencia
completa abajo, como exige la licencia.

## Qué se adaptó y de dónde

| Archivo (`src/pages/Mundo/…`) | Patrón adaptado | Fuente |
| --- | --- | --- |
| `components/FollowCamera.tsx` | Cámara de ángulo fijo en espacio de mundo que sigue un punto de mira suavizado (no rota con el vehículo) | `Camera.js` (folio-2019) |
| `components/MundoTouchControls.tsx` | Controles táctiles móviles: joystick + botones de acelerar/reversa | `World/Controls.js` (folio-2019) |
| `components/Vehicle.tsx` | Motor del vehículo: `force = ENGINE / (1 + exceso)`, frenos por intención, freno de ralentí, `sideFrictionStiffness` | `PhysicsVehicle.js` (folio-2025) |
| `components/ShadowRig.tsx` | Luz direccional que sigue al vehículo con cámara de sombras pequeña para sombras nítidas | `Lighting.js` (folio-2025) |
| `components/RoadRibbon.tsx` | Cinta de carretera como mesh dedicado drapeado sobre el terreno | `Scenery.js` (folio-2025) |
| `utils/applyReveal.ts`, `utils/revealUniforms.ts`, `components/RevealController.tsx`, `components/IntroBeacon.tsx` | Materialización/revelado radial del mundo en el intro | folio-2025 (intro/reveal) |

## Assets (ya atribuidos por separado)

- Audio (música Baguira CC0, viento/grillos MIT): `public/sounds/mundo/README.md`.
- Los `.glb` de árboles de `public/models/folio/` (MIT, ver su `LICENSE.md`)
  YA NO se usan: la vegetación es 100% procedural (ver `Vegetation.tsx`). Los
  archivos y su licencia quedan por si se retoman.

## Licencia MIT (código de Bruno Simon adaptado en /mundo)

```
MIT License

Copyright (c) 2019 Bruno Simon (folio-2019)
Copyright (c) 2025 Bruno Simon (folio-2025)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
