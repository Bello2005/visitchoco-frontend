import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { WATER_LEVEL } from "./ChocoTerrain";

// Superficie única mar+río a Y=WATER_LEVEL. El terreno cavado bajo ese
// nivel (cauce del Atrato, borde del diorama) queda cubierto por ella.
// TODO: shader GLSL custom en la fase de belleza.
export default function Water() {
  const geoRef = useRef<THREE.PlaneGeometry>(null);

  useFrame(({ clock }) => {
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
        <planeGeometry ref={geoRef} args={[200, 200, 48, 48]} />
        <meshStandardMaterial
          flatShading
          transparent
          opacity={0.85}
          color="#041824"
          metalness={0.3}
          roughness={0.15}
        />
      </mesh>
      {/* Falso brillo ámbar de fondo bajo la superficie — sin collider.
          opacity 0.02: con 0.05 teñía todo el mar de marrón rojizo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_LEVEL - 0.15, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#d97706" transparent opacity={0.02} />
      </mesh>
      {/* Volumen sensor desde la superficie hacia abajo — detecta al vehículo */}
      <RigidBody type="fixed" userData={{ type: "water" }}>
        <CuboidCollider
          sensor
          args={[100, 0.6, 100]}
          position={[0, WATER_LEVEL - 0.6, 0]}
        />
      </RigidBody>
    </>
  );
}
