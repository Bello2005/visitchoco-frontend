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
}

// Anima el radio de revelado (easeOutQuart, ~2.8s) y ata la intensidad
// de las luces globales al progreso: penumbra (0.25/0.08) → pleno (0.9/0.25).
export default function RevealController({
  directionalRef,
  ambientRef,
}: RevealControllerProps) {
  useFrame(() => {
    if (revealState.animating) {
      const t = (performance.now() - revealState.startTime) / DURATION_MS;
      if (t >= 1) {
        revealState.animating = false;
        revealUniforms.uRevealRadius.value = REVEAL_MAX;
      } else {
        const ease = 1 - Math.pow(1 - t, 4);
        revealUniforms.uRevealRadius.value = ease * REVEAL_MAX;
      }
    }

    const progress = revealUniforms.uRevealRadius.value / REVEAL_MAX;
    const directional = directionalRef.current;
    if (directional) directional.intensity = 0.25 + 0.65 * progress;
    const ambient = ambientRef.current;
    if (ambient) ambient.intensity = 0.08 + 0.17 * progress;
  });

  return null;
}
