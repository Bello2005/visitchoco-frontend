import type { RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  revealUniforms,
  revealState,
  REVEAL_MAX,
} from "../utils/revealUniforms";

const DURATION_MS = 2800;

interface RevealControllerProps {
  directionalRef: RefObject<THREE.DirectionalLight | null>;
  ambientRef: RefObject<THREE.AmbientLight | null>;
  /** prefers-reduced-motion: el revelado se aplica de inmediato, sin onda */
  reducedMotion?: boolean;
}

// Anima el radio de revelado (easeOutQuart, ~2.8s) y ata la intensidad
// de las luces globales al progreso: amanecer (0.55/0.3) → día pleno (1.35/0.6).
export default function RevealController({
  directionalRef,
  ambientRef,
  reducedMotion = false,
}: RevealControllerProps) {
  useFrame(() => {
    if (revealState.animating) {
      if (reducedMotion) {
        revealState.animating = false;
        revealUniforms.uRevealRadius.value = REVEAL_MAX;
      } else {
        const t = (performance.now() - revealState.startTime) / DURATION_MS;
        if (t >= 1) {
          revealState.animating = false;
          revealUniforms.uRevealRadius.value = REVEAL_MAX;
        } else {
          const ease = 1 - Math.pow(1 - t, 4);
          revealUniforms.uRevealRadius.value = ease * REVEAL_MAX;
        }
      }
    }

    const progress = revealUniforms.uRevealRadius.value / REVEAL_MAX;
    const directional = directionalRef.current;
    if (directional) directional.intensity = 0.55 + 0.8 * progress;
    const ambient = ambientRef.current;
    if (ambient) ambient.intensity = 0.3 + 0.3 * progress;
  });

  return null;
}
