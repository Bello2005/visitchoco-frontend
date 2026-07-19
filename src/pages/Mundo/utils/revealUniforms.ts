import * as THREE from "three";

// Intro de "materialización" inspirado en la lógica de Reveal.js / Intro.js de
// bruno-simon/folio-2025 (licencia MIT — ver public/models/folio/LICENSE.md).
// El mundo NO se oscurece: más allá del radio se DESCARTA (invisible) y el
// territorio aparece desde el punto de spawn hacia afuera, con un frente de onda
// brillante. Dos etapas: (1) al cargar, un círculo pequeño alrededor del spawn;
// (2) al interactuar, el territorio EXPLOTA hacia afuera y arranca el juego.

// Uniforms compartidos por TODOS los materiales con applyReveal: RevealController
// los muta por referencia y cada programa inyectado los lee en su frame.
export const revealUniforms = {
  uRevealCenter: { value: new THREE.Vector3(0, 0, 0) },
  uRevealRadius: { value: 0 },
  uRevealThickness: { value: 1.3 },
  uRevealColor: { value: new THREE.Color("#ffd27f") },
  uRevealIntensity: { value: 2.6 },
};

// Radio que cubre el diorama (40x60) desde el spawn; al terminar salta a ∞.
export const REVEAL_MAX = 65;
// Círculo pequeño inicial alrededor del spawn (etapa 1).
export const INTRO_RADIUS = 7;

type Phase = "idle" | "intro" | "exploding" | "done";

export const revealState = {
  phase: "idle" as Phase,
  startTime: 0,
  from: 0,
  to: 0,
  duration: 0,
  ease: "backOut" as "backOut" | "backIn",
};

export function setRevealCenter(x: number, z: number): void {
  revealUniforms.uRevealCenter.value.set(x, 0, z);
}

// Etapa 1 — al cargar: revela un círculo pequeño alrededor del spawn (back.out).
export function startIntro(): void {
  revealUniforms.uRevealRadius.value = 0;
  revealState.from = 0;
  revealState.to = INTRO_RADIUS;
  revealState.duration = 1500;
  revealState.ease = "backOut";
  revealState.startTime = performance.now();
  revealState.phase = "intro";
}

// Etapa 2 — al interactuar: el territorio EXPLOTA hacia afuera (back.in).
export function explodeReveal(): void {
  if (revealState.phase === "exploding" || revealState.phase === "done") return;
  revealState.from = revealUniforms.uRevealRadius.value;
  revealState.to = REVEAL_MAX;
  revealState.duration = 2000;
  revealState.ease = "backIn";
  revealState.startTime = performance.now();
  revealState.phase = "exploding";
  // Señal para la UI HTML (oculta el hint) sin acoplar componentes.
  window.dispatchEvent(new CustomEvent("mundo:reveal"));
}

// prefers-reduced-motion / skip: el mundo nace completamente revelado.
export function revealAll(): void {
  revealUniforms.uRevealRadius.value = 99999;
  revealState.phase = "done";
}
