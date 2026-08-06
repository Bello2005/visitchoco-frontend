import { shadingUniforms } from "./shadingUniforms";

// Calidad gráfica adaptativa de /mundo.
//
// Singleton mutable, NO un Context de React, por el mismo motivo que
// vehicleState y revealUniforms: un Context re-renderiza a todos sus
// consumidores, y re-renderizar Vegetation es carísimo (reconstruye
// geometrías de árbol y re-dispara hasta 132.300 tests de punto-en-polígono
// de los scatters). La mayoría de diales ni siquiera necesitan React: se leen
// desde useFrame. Sólo el botón de la UI y PostFX se suscriben, vía
// useSyncExternalStore.

export type QualityLevel = "low" | "medium" | "high";
export type QualityChoice = QualityLevel | "auto";

export interface QualityProfile {
  /** Rango de devicePixelRatio del Canvas */
  dpr: [number, number];
  /** MSAA del EffectComposer (el default de la librería es 8: carísimo) */
  multisampling: number;
  /** ¿La luz direccional proyecta sombras? */
  shadows: boolean;
  shadowMapSize: number;
  /** Radio de la cámara de sombras (ShadowRig) */
  shadowRadius: number;
  bloom: boolean;
  /** SMAA sustituye al MSAA cuando no hay multisampling */
  smaa: boolean;
  /** Multiplicador de los counts de vegetación (dial FRÍO: exige recargar) */
  vegetation: number;
  /** Multiplicador del césped, que es el count más alto de todos */
  grass: number;
  /** Segmentos del plano de agua; 1 = plano liso sin oleaje */
  waterSegments: number;
  /** ¿Se anima el agua por CPU? (4802 Math.sin + 28KB de upload por frame) */
  waterAnimated: boolean;
  dust: number;
  butterflies: number;
  /** Diales del sombreado estilizado */
  shadowMix: number;
  dropShadowMix: number;
  bounceStrength: number;
}

export const QUALITY_PROFILES: Record<QualityLevel, QualityProfile> = {
  low: {
    dpr: [0.6, 1],
    multisampling: 0,
    // Sin shadow map: NUM_DIR_LIGHT_SHADOWS pasa a 0 y el bloque de drop
    // shadow desaparece del shader. El core shadow de dos tonos sigue dando
    // volumen, así que la escena NO se ve plana pese a no tener sombras.
    shadows: false,
    shadowMapSize: 512,
    shadowRadius: 12,
    bloom: false,
    smaa: true,
    vegetation: 0.45,
    grass: 0.3,
    waterSegments: 1,
    waterAnimated: false,
    dust: 0,
    butterflies: 0,
    shadowMix: 0.34,
    dropShadowMix: 0,
    bounceStrength: 0,
  },
  medium: {
    dpr: [1, 1.5],
    multisampling: 0,
    shadows: true,
    shadowMapSize: 1024,
    shadowRadius: 14,
    bloom: true,
    smaa: true,
    vegetation: 0.75,
    grass: 0.6,
    waterSegments: 24,
    waterAnimated: true,
    dust: 40,
    butterflies: 10,
    shadowMix: 0.38,
    dropShadowMix: 1,
    bounceStrength: 0.1,
  },
  high: {
    dpr: [1, 2],
    multisampling: 4,
    shadows: true,
    shadowMapSize: 2048,
    shadowRadius: 17,
    bloom: true,
    smaa: false, // con MSAA 4× el SMAA sobra
    vegetation: 1,
    grass: 1,
    waterSegments: 48,
    waterAnimated: true,
    dust: 80,
    butterflies: 20,
    shadowMix: 0.38,
    dropShadowMix: 1,
    bounceStrength: 0.12,
  },
};

const STORAGE_KEY = "mundo:quality";

export const qualityState = {
  /** Lo que pidió el usuario */
  choice: "auto" as QualityChoice,
  /** El nivel EFECTIVO ya resuelto */
  level: "medium" as QualityLevel,
  /** Atajo mutable, pensado para leerse desde useFrame */
  profile: QUALITY_PROFILES.medium,
};

// ---------- detección ----------

function rendererScore(name: string): number {
  const s = name.toLowerCase();
  // Render por software: siempre lo más bajo, sin discusión.
  if (/swiftshader|llvmpipe|software|basic render/.test(s)) return -99;
  if (/apple (gpu|m\d)/.test(s)) return 2;
  if (/rtx|gtx 1\d|radeon rx [5-9]|arc a/.test(s)) return 2;
  if (/intel.*(hd|uhd) graphics/.test(s)) return -1;
  return 0;
}

/** Nombre de la GPU, o null si el navegador no lo expone.
 *  Reutiliza un canvas ya existente si se le pasa: crear contextos WebGL de
 *  más es un desperdicio (los navegadores limitan a ~16 vivos). */
export function probeRenderer(gl: WebGLRenderingContext | null): string | null {
  if (!gl) return null;
  try {
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;
    return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "") || null;
  } catch {
    return null;
  }
}

export function detectQualityLevel(renderer?: string | null): QualityLevel {
  let score = 0;

  const coarse =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches === true;
  if (coarse) score -= 2;

  const hc = navigator.hardwareConcurrency ?? 4;
  if (hc >= 8) score += 2;
  else if (hc >= 6) score += 1;
  else if (hc <= 2) score -= 2;

  // deviceMemory sólo existe en Chromium; undefined no penaliza.
  const dm = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (dm !== undefined) {
    if (dm >= 8) score += 1;
    else if (dm <= 2) score -= 2;
    else if (dm <= 4) score -= 1;
  }

  if (renderer) score += rendererScore(renderer);

  const dpr = window.devicePixelRatio || 1;
  const physPixels = window.innerWidth * window.innerHeight * dpr * dpr;
  if (physPixels > 4.5e6) score -= 1;

  // Ante lo desconocido, "medium". Un "high" equivocado son 15 FPS y el
  // usuario se va; un "medium" equivocado sólo se ve algo menos bonito, y el
  // menú lo arregla.
  if (score >= 3) return "high";
  if (score >= 0) return "medium";
  return "low";
}

// ---------- persistencia ----------

export function loadQualityChoice(): QualityChoice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "low" || raw === "medium" || raw === "high" || raw === "auto") {
      return raw;
    }
  } catch {
    // Safari en navegación privada lanza en localStorage
  }
  return "auto";
}

function saveQualityChoice(choice: QualityChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // sin persistencia; la sesión igual funciona
  }
}

// ---------- suscripción (sólo para el botón y PostFX) ----------

const listeners = new Set<() => void>();

export function subscribeQuality(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getQualitySnapshot(): QualityLevel {
  return qualityState.level;
}

export function getChoiceSnapshot(): QualityChoice {
  return qualityState.choice;
}

// ---------- aplicación ----------

/** Diales CALIENTES: se aplican sin recompilar shaders ni remontar nada.
 *  Los que dependen de three (dpr, sombras) los aplica QualityRuntime. */
function applyHotDials(p: QualityProfile): void {
  shadingUniforms.uShadowMix.value = p.shadowMix;
  shadingUniforms.uDropShadowMix.value = p.dropShadowMix;
  shadingUniforms.uBounceStrength.value = p.bounceStrength;
}

export function setQualityLevel(level: QualityLevel): void {
  qualityState.level = level;
  qualityState.profile = QUALITY_PROFILES[level];
  applyHotDials(qualityState.profile);
  listeners.forEach((fn) => fn());
}

export function setQualityChoice(choice: QualityChoice, renderer?: string | null): void {
  qualityState.choice = choice;
  saveQualityChoice(choice);
  setQualityLevel(choice === "auto" ? detectQualityLevel(renderer) : choice);
}

/** Resuelve el nivel inicial. Se llama UNA vez, antes de montar el Canvas. */
export function initQuality(renderer?: string | null): QualityLevel {
  const choice = loadQualityChoice();
  qualityState.choice = choice;
  const level = choice === "auto" ? detectQualityLevel(renderer) : choice;
  qualityState.level = level;
  qualityState.profile = QUALITY_PROFILES[level];
  applyHotDials(qualityState.profile);
  return level;
}

/** Multiplicador de counts de vegetación/detalle. Se CONGELA al montar: los
 *  counts son diales fríos (cambiarlos re-dispara los scatters). */
export function scaleCount(count: number, factor: number): number {
  return Math.max(1, Math.round(count * factor));
}
