import { useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";

const UP = new THREE.Vector3(0, 1, 0);
const OFFSET = new THREE.Vector3(0, 4.5, -9);

interface FollowCameraProps {
  target: RefObject<RapierRigidBody | null>;
}

// Cámara de seguimiento con inercia: posición y punto de mira interpolados.
// Nunca lookAt directo a la posición cruda del chasis (jitter).
export default function FollowCamera({ target }: FollowCameraProps) {
  const chassisPos = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const quat = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler());
  const lookTarget = useRef<THREE.Vector3 | null>(null);

  useFrame(({ camera }) => {
    const body = target.current;
    if (!body) return;

    const t = body.translation();
    chassisPos.current.set(t.x, t.y, t.z);
    const r = body.rotation();
    quat.current.set(r.x, r.y, r.z, r.w);
    euler.current.setFromQuaternion(quat.current, "YXZ");

    // Offset detrás del carro, rotado solo por el yaw del chasis
    desired.current
      .copy(OFFSET)
      .applyAxisAngle(UP, euler.current.y)
      .add(chassisPos.current);

    camera.position.lerp(desired.current, 0.06);
    if (camera.position.y < 1.5) camera.position.y = 1.5;

    if (!lookTarget.current) {
      lookTarget.current = chassisPos.current.clone();
    }
    lookTarget.current.lerp(chassisPos.current, 0.1);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
