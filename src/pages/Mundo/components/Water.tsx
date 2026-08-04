import { memo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { WATER_LEVEL } from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";
import { qualityState } from "../utils/qualityState";

// Superficie única mar+río a Y=WATER_LEVEL. El terreno cavado bajo ese
// nivel (cauce del Atrato, borde del diorama) queda cubierto por ella.
// TODO: shader GLSL custom en la fase de belleza.
function Water() {
  const geoRef = useRef<THREE.PlaneGeometry>(null);
  // Los segmentos se CONGELAN al montar: cambiarlos recrea la geometría, así
  // que es un dial frío (se aplica al recargar).
  const segments = useRef(qualityState.profile.waterSegments).current;

  useFrame(({ clock }) => {
    // El oleaje por CPU recorre 2401 vértices con 4802 Math.sin y sube 28 KB
    // al GPU CADA frame. En gama baja se apaga entero.
    if (!qualityState.profile.waterAnimated) return;
    const geo = geoRef.current;
    if (!geo) return;
    const t = clock.elapsedTime;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // y local = -Z mundo
      pos.setZ(
        i,
        Math.sin(x * 0.4 + t * 0.8) * 0.04 + Math.sin(-y * 0.5 + t * 0.6) * 0.03
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_LEVEL, 0]}>
        <planeGeometry ref={geoRef} args={[200, 200, segments, segments]} />
        <meshStandardMaterial
          flatShading
          transparent
          opacity={0.75}
          color="#2ea8c4"
          metalness={0.1}
          roughness={0.25}
          ref={(m) => {
            if (m) applyReveal(m, { fresnel: true });
          }}
        />
      </mesh>
      {/* Falso resplandor cian de fondo bajo la superficie — sin collider.
          Aclara los bajos como el agua pastel de folio-2025 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_LEVEL - 0.15, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial
          color="#7fd8e8"
          transparent
          opacity={0.05}
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </mesh>
    </>
  );
}

// memo: sin props — aislado del churn de estado de Mundo.
export default memo(Water);
