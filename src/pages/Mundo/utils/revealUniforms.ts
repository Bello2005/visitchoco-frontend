import * as THREE from "three";

// Uniforms compartidos por TODOS los materiales con applyReveal: la
// animación externa (RevealController) los muta por referencia y cada
// programa inyectado los lee en su frame.
export const revealUniforms = {
  uRevealCenter: { value: new THREE.Vector3(0, 0, 0) },
  uRevealRadius: { value: 0 },
};

// Radio final: cubre el diorama (40x60) desde cualquier punto clickeable
export const REVEAL_MAX = 130;

export const revealState = { animating: false, startTime: 0 };

export function triggerReveal(point: THREE.Vector3): void {
  revealUniforms.uRevealCenter.value.copy(point);
  revealUniforms.uRevealRadius.value = 0;
  revealState.animating = true;
  revealState.startTime = performance.now();
  // Señal para la UI HTML (overlay de instrucción) sin acoplar componentes
  window.dispatchEvent(new CustomEvent("mundo:reveal"));
}
