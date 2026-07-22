// Cámara adaptada de Camera.js de folio-2019 (Bruno Simon, MIT).
// Ver src/pages/Mundo/CREDITS.md para la atribución y la licencia.
import { useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";

// Cámara estilo folio-2019 de Bruno Simon (MIT — ver public/models/folio/
// LICENSE.md). Su Camera.js hace, cada frame:
//
//   targetEased.x += (target.x - targetEased.x) * easing
//   instance.position.copy(targetEased).add(angle.normalize() * zoom.distance)
//   instance.lookAt(targetEased)
//
// LA CLAVE: el ÁNGULO ES FIJO EN ESPACIO DE MUNDO. La cámara NUNCA rota con
// el rumbo del carro — solo TRASLADA siguiendo un punto de mira suavizado, y
// el carro gira debajo. Antes rotábamos el offset por el yaw del chasis
// (applyAxisAngle), así que la cámara barría medio mundo en cada curva: mareo
// constante y sensación de que el carro responde mal.
const ANGLE = new THREE.Vector3(0.3, 0.64, 0.71).normalize();
const DISTANCE = 12.5;
// Suavizado del punto de mira (Bruno usa 0.15). Más bajo = más cinematográfico.
const EASING = 0.12;

interface FollowCameraProps {
  target: RefObject<RapierRigidBody | null>;
}

export default function FollowCamera({ target }: FollowCameraProps) {
  const chassisPos = useRef(new THREE.Vector3());
  const targetEased = useRef<THREE.Vector3 | null>(null);

  useFrame(({ camera }) => {
    const body = target.current;
    if (!body) return;

    const t = body.translation();
    chassisPos.current.set(t.x, t.y, t.z);

    // Primer frame: el punto de mira NACE sobre el carro (sin barrido inicial)
    if (!targetEased.current) {
      targetEased.current = chassisPos.current.clone();
    }
    targetEased.current.lerp(chassisPos.current, EASING);

    // RESPONSIVE: en vertical (móvil) el encuadre horizontal se estrecha
    // muchísimo y el carro se comía la pantalla. Alejamos la cámara según el
    // aspecto para que siempre se vea el mismo "ancho de mundo".
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1;
    const dist = DISTANCE * (aspect < 1 ? 1 + (1 - aspect) * 0.9 : 1);

    // Posición = punto de mira + ángulo FIJO × distancia. Nada de yaw.
    camera.position.copy(targetEased.current).addScaledVector(ANGLE, dist);
    if (camera.position.y < 1.5) camera.position.y = 1.5;
    camera.lookAt(targetEased.current);
  });

  return null;
}
