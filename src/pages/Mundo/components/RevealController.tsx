import type { RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { revealUniforms, revealState, REVEAL_MAX } from "../utils/revealUniforms";

// Eases estilo gsap (los que usa Bruno): back.out para el brote del círculo
// inicial (rebota al abrir), back.in para la explosión (arranca lento y dispara).
function backOut(t: number): number {
  const s = 1.7;
  return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
}
function backIn(t: number): number {
  const s = 1.3;
  return (s + 1) * t * t * t - s * t * t;
}

interface RevealControllerProps {
  directionalRef: RefObject<THREE.DirectionalLight | null>;
  ambientRef: RefObject<THREE.AmbientLight | null>;
  /** prefers-reduced-motion: el revelado se aplica de inmediato, sin onda */
  reducedMotion?: boolean;
}

// Anima el radio de revelado según la etapa (intro/explosión) y ata la
// intensidad de las luces al progreso: penumbra de amanecer → día pleno.
export default function RevealController({
  directionalRef,
  ambientRef,
  reducedMotion = false,
}: RevealControllerProps) {
  useFrame(() => {
    if (revealState.phase === "intro" || revealState.phase === "exploding") {
      if (reducedMotion) {
        revealUniforms.uRevealRadius.value = 99999;
        revealState.phase = "done";
      } else {
        const t =
          (performance.now() - revealState.startTime) / revealState.duration;
        if (t >= 1) {
          if (revealState.phase === "exploding") {
            revealUniforms.uRevealRadius.value = 99999;
            revealState.phase = "done";
          } else {
            revealUniforms.uRevealRadius.value = revealState.to;
            revealState.phase = "idle"; // espera la interacción del jugador
          }
        } else {
          const e = revealState.ease === "backOut" ? backOut(t) : backIn(t);
          revealUniforms.uRevealRadius.value =
            revealState.from + (revealState.to - revealState.from) * e;
        }
      }
    }

    const progress = Math.min(
      1,
      revealUniforms.uRevealRadius.value / REVEAL_MAX
    );
    const directional = directionalRef.current;
    if (directional) directional.intensity = 0.55 + 0.8 * progress;
    const ambient = ambientRef.current;
    if (ambient) ambient.intensity = 0.3 + 0.3 * progress;
  });

  return null;
}
