import * as THREE from "three";
import { WIDTH, HEIGHT } from "./geo";

// Agua estilizada portada de folio-2025 (WaterSurface.js / Terrain.js de Bruno
// Simon, MIT — ver src/pages/Mundo/CREDITS.md).
//
// LA IDEA QUE LO CAMBIA TODO: Bruno NO simula agua. Su plano son 4 vértices,
// plano, de color blanco puro, y toda la información vive en el alpha. El azul
// del océano no está en el agua: está pintado en el terreno con una LUT
// indexada por PROFUNDIDAD. Y sus "olas" son isocontornos del campo de
// profundidad — frac((d + t·v)·N) — que producen bandas paralelas a la costa
// rodando hacia la orilla, gratis, sin simular nada.
//
// Por eso el agua vieja parecía un PNG: estábamos simulando olas de 0.07 u
// sobre un plano de 200 u (inclinación máxima 1.26°, o sea iluminación
// constante) en vez de dibujar la señal que de verdad lee el ojo.

export const waterUniforms = {
  /** Profundidad del terreno horneada: 0 = tierra, 1 = fondo marino */
  uTerrainDepth: { value: null as THREE.DataTexture | null },
  /** Tamaño del terreno en unidades de mundo, para mapear world → UV */
  uTerrainSize: { value: new THREE.Vector2(WIDTH, HEIGHT) },
  uWaterLevel: { value: 0 },

  // ---- color por profundidad (Pacífico chocoano, no Caribe) ----
  /** Bajos junto a la playa */
  uShallowColor: { value: new THREE.Color("#4fb3a4") },
  /** Media agua */
  uMidColor: { value: new THREE.Color("#1d6d8f") },
  /** Profundo — el ancla azul que le faltaba a la paleta */
  uDeepColor: { value: new THREE.Color("#0b2f56") },

  // ---- espuma de costa ----
  // Bruno usa 0.17, pero su terreno no tiene bajos anchos y planos. Acá un
  // umbral de profundidad generoso cubre METROS de bajío (en la bahía del
  // malecón, p.ej.) y pinta el mar de blanco en vez de dibujar un filo.
  // Además el terreno YA trae su propia espuma horneada en vertex-colors
  // (C_ESPUMA), así que esto solo agrega el borde nítido del lado del agua.
  /** Profundidad hasta donde llega la espuma */
  uShoreEdge: { value: 0.05 },
  /** Suavizado del borde. Bruno usa un step duro; a nuestra resolución
   *  aliasea, así que se difumina un pelo. */
  uShoreSoft: { value: 0.055 },

  // ---- ondas de isocontorno ----
  /** Cuántas bandas caben en el rango de profundidad (Bruno: 10) */
  uRippleBands: { value: 5 },
  /** Velocidad con la que las bandas ruedan hacia la orilla (Bruno: 0.5) */
  uRippleSpeed: { value: 0.35 },
  /** Intensidad global de las bandas */
  uRippleStrength: { value: 0.14 },

  /** Amplitud del desplazamiento vertical. Bruno no desplaza (su plano sigue a
   *  la cámara); acá sí, porque hay una panga navegando que debe cabecear. */
  uWaveAmp: { value: 0.16 },
};

// Ola analítica, en unidades de mundo. La MISMA fórmula corre en el vertex
// shader y en la CPU (Vehicle.tsx) para que la panga cabecee exactamente con
// la superficie que se ve. Si se toca acá, hay que tocarla allá.
export const WAVE = {
  kxA: 0.42,
  ktA: 0.75,
  kzB: 0.55,
  ktB: 0.62,
  /** peso relativo de cada tren de olas (suman 1) */
  wA: 0.6,
  wB: 0.4,
};

/** Altura de la superficie del agua en (x, z) y tiempo t. */
export function waveHeight(x: number, z: number, t: number): number {
  return (
    waterUniforms.uWaveAmp.value *
    (Math.sin(x * WAVE.kxA + t * WAVE.ktA) * WAVE.wA +
      Math.sin(z * WAVE.kzB + t * WAVE.ktB) * WAVE.wB)
  );
}

/** El mismo cálculo, en GLSL. Se inyecta en el vertex y en el fragment. */
export const WAVE_GLSL = /* glsl */ `
float mundoWaveHeight(vec2 wxz, float t) {
	return uWaveAmp * (
		sin(wxz.x * ${WAVE.kxA} + t * ${WAVE.ktA}) * ${WAVE.wA} +
		sin(wxz.y * ${WAVE.kzB} + t * ${WAVE.ktB}) * ${WAVE.wB}
	);
}
`;
