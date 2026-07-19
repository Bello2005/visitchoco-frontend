import { useMemo } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  revealUniforms,
  revealState,
  REVEAL_MAX,
  TRACE_MS,
  EXPLODE_MS,
} from "../utils/revealUniforms";

// back.in de gsap (el ease de la explosión de folio-2025): arranca lento,
// retrocede un pelo y DISPARA.
function backIn(t: number): number {
  const s = 1.3;
  return (s + 1) * t * t * t - s * t * t;
}

// Cielo/niebla de la noche del intro y del día pleno (colores VisitChocó)
const SKY_NIGHT = new THREE.Color("#020d1a");
const SKY_DAY = new THREE.Color("#a5ddf2");
const FOG_NIGHT = { near: 10, far: 55 };
// far 135: la Serranía del Baudó (picos ~5.5) se ve como sierra al fondo
// mientras conduces por la carretera del valle
const FOG_DAY = { near: 34, far: 135 };

interface RevealControllerProps {
  directionalRef: RefObject<THREE.DirectionalLight | null>;
  ambientRef: RefObject<THREE.AmbientLight | null>;
  /** prefers-reduced-motion: el revelado se aplica de inmediato, sin onda */
  reducedMotion?: boolean;
}

// Orquesta el despertar: fase tracing (la línea completa el círculo) →
// exploding (radio 0→MAX con back.in) mientras el cielo AMANECE (noche→día)
// y las luces suben con el progreso.
export default function RevealController({
  directionalRef,
  ambientRef,
  reducedMotion = false,
}: RevealControllerProps) {
  const { scene } = useThree();
  const tmpColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (reducedMotion && revealState.phase !== "done") {
      revealUniforms.uRevealRadius.value = 99999;
      revealState.phase = "done";
    }

    if (revealState.phase === "tracing") {
      const t = (performance.now() - revealState.startTime) / TRACE_MS;
      if (t >= 1) {
        revealState.phase = "exploding";
        revealState.startTime = performance.now();
      }
    } else if (revealState.phase === "exploding") {
      const t = (performance.now() - revealState.startTime) / EXPLODE_MS;
      if (t >= 1) {
        revealUniforms.uRevealRadius.value = 99999;
        revealState.phase = "done";
      } else {
        revealUniforms.uRevealRadius.value = Math.max(0, backIn(t)) * REVEAL_MAX;
      }
    }

    // Progreso global del amanecer (0 = noche del intro, 1 = día pleno)
    const progress =
      revealState.phase === "done"
        ? 1
        : Math.min(1, revealUniforms.uRevealRadius.value / REVEAL_MAX);

    // Cielo y niebla amanecen con la explosión
    if (scene.background instanceof THREE.Color) {
      tmpColor.lerpColors(SKY_NIGHT, SKY_DAY, progress);
      scene.background.copy(tmpColor);
    }
    if (scene.fog instanceof THREE.Fog) {
      tmpColor.lerpColors(SKY_NIGHT, SKY_DAY, progress);
      scene.fog.color.copy(tmpColor);
      scene.fog.near = FOG_NIGHT.near + (FOG_DAY.near - FOG_NIGHT.near) * progress;
      scene.fog.far = FOG_NIGHT.far + (FOG_DAY.far - FOG_NIGHT.far) * progress;
    }

    const directional = directionalRef.current;
    if (directional) directional.intensity = 0.55 + 0.8 * progress;
    const ambient = ambientRef.current;
    if (ambient) ambient.intensity = 0.3 + 0.3 * progress;
  });

  return null;
}
