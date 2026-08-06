import * as THREE from "three";
import {
  SEA_FLOOR,
  WATER_LEVEL,
  getHeightField,
  whenHeightFieldReady,
} from "../components/ChocoTerrain";
import { waterUniforms } from "./waterUniforms";

// Hornea la PROFUNDIDAD del terreno en una textura para poder leerla desde el
// fragment shader del agua.
//
// Bruno la trae de un PNG de autoría; nosotros la derivamos del heightfield que
// ChocoTerrain YA calcula y publica (121×181 floats) — no se reevalúa
// terrainHeight ni se toca la geometría. Una sola pasada al cargar.
//
// Convención (igual que terrainData.b de folio-2025):
//   0 = tierra firme · 1 = fondo marino (SEA_FLOOR)

let baked = false;

export function bakeTerrainDepthTexture(): Promise<void> {
  if (baked) return Promise.resolve();
  return whenHeightFieldReady().then(() => {
    if (baked) return;
    const field = getHeightField();
    if (!field) return;

    const { data, cols, rows } = field;
    const range = WATER_LEVEL - SEA_FLOOR; // 2.0
    const out = new Float32Array(cols * rows);
    for (let i = 0; i < out.length; i++) {
      const d = (WATER_LEVEL - data[i]) / range;
      out[i] = d < 0 ? 0 : d > 1 ? 1 : d;
    }

    const tex = new THREE.DataTexture(
      out,
      cols,
      rows,
      THREE.RedFormat,
      THREE.FloatType
    );
    // Lineal para que la espuma y las bandas no se vean escalonadas, y
    // ClampToEdge para que MÁS ALLÁ del terreno (el plano de agua es 200×200 y
    // el terreno 60×90) se propague el borde: mar abierto = profundo.
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;

    waterUniforms.uTerrainDepth.value = tex;
    waterUniforms.uWaterLevel.value = WATER_LEVEL;
    baked = true;
  });
}
