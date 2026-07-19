import * as THREE from "three";

// Intro de "despertar" inspirado en la secuencia real de folio-2025 (Reveal.js
// + Intro.js de Bruno Simon, MIT — ver public/models/folio/LICENSE.md):
// ANTES de interactuar no se ve NADA — oscuridad y un punto de luz en el
// spawn. Al hacer clic/doble clic/moverse, una línea dorada TRAZA el círculo
// alrededor del punto y entonces el territorio EXPLOTA hacia afuera mientras
// el cielo amanece (colores VisitChocó: ámbar sobre azul noche).
//
// El mundo NO se oscurece: más allá del radio se DESCARTA (invisible) y se
// materializa desde el spawn con un frente de onda brillante.

export const revealUniforms = {
  uRevealCenter: { value: new THREE.Vector3(0, 0, 0) },
  uRevealRadius: { value: 0 },
  uRevealThickness: { value: 1.3 },
  uRevealColor: { value: new THREE.Color("#ffd27f") },
  uRevealIntensity: { value: 2.6 },
};

// Radio que cubre el diorama (60x90) desde el spawn; al terminar salta a ∞.
export const REVEAL_MAX = 105;
// Radio del anillo del intro alrededor del punto de luz (unidades de mundo).
export const INTRO_RING_RADIUS = 2.6;
// Duración del trazado de la línea sobre el círculo (ms).
export const TRACE_MS = 850;
// Duración de la explosión (ms).
export const EXPLODE_MS = 2200;

type Phase = "asleep" | "tracing" | "exploding" | "done";

export const revealState = {
  phase: "asleep" as Phase,
  startTime: 0,
};

export function setRevealCenter(x: number, z: number): void {
  revealUniforms.uRevealCenter.value.set(x, 0, z);
}

// Al cargar: el mundo duerme (radio 0 — nada visible, solo el beacon).
export function startIntro(): void {
  revealUniforms.uRevealRadius.value = 0;
  revealState.phase = "asleep";
}

// Interacción del jugador: arranca el TRAZADO del círculo (la explosión la
// dispara RevealController cuando la línea completa la vuelta).
export function wakeTerritory(): void {
  if (revealState.phase !== "asleep") return;
  revealState.phase = "tracing";
  revealState.startTime = performance.now();
  // Señal para la UI HTML (oculta el hint) sin acoplar componentes.
  window.dispatchEvent(new CustomEvent("mundo:reveal"));
}

// prefers-reduced-motion / skip: el mundo nace completamente revelado.
export function revealAll(): void {
  revealUniforms.uRevealRadius.value = 99999;
  revealState.phase = "done";
}
