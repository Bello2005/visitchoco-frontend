// Rig de sombras adaptado de Lighting.js de folio-2025 (Bruno Simon, MIT).
// Ver src/pages/Mundo/CREDITS.md para la atribución y la licencia.
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { vehicleState } from "../utils/vehicleState";

// El "piso pixelado" era el shadow map: 2048px repartidos sobre TODO el mapa
// (84×110) = sombras borrosas tipo mancha. folio-2025 mueve la luz CON el
// jugador y encoge la cámara de sombras (Ligthing.js: shadowAmplitude =
// radio de la vista). Aquí igual: la cámara de sombras cubre solo ±SHADOW_R
// alrededor del carro → ~4× más texels por metro = sombras nítidas SIEMPRE.
const SHADOW_R = 17;
const LIGHT_OFFSET = new THREE.Vector3(18, 28, 10);

interface ShadowRigProps {
  directionalRef: RefObject<THREE.DirectionalLight | null>;
}

export default function ShadowRig({ directionalRef }: ShadowRigProps) {
  const { scene } = useThree();
  const targetRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const light = directionalRef.current;
    if (!light) return;
    // el target de una DirectionalLight debe estar EN la escena para moverse
    const target = new THREE.Object3D();
    scene.add(target);
    light.target = target;
    targetRef.current = target;

    light.shadow.camera.left = -SHADOW_R;
    light.shadow.camera.right = SHADOW_R;
    light.shadow.camera.top = SHADOW_R;
    light.shadow.camera.bottom = -SHADOW_R;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 90;
    light.shadow.camera.updateProjectionMatrix();

    return () => {
      scene.remove(target);
      targetRef.current = null;
    };
  }, [scene, directionalRef]);

  useFrame(() => {
    const light = directionalRef.current;
    const target = targetRef.current;
    if (!light || !target) return;
    target.position.set(vehicleState.x, 0, vehicleState.z);
    light.position.set(
      vehicleState.x + LIGHT_OFFSET.x,
      LIGHT_OFFSET.y,
      vehicleState.z + LIGHT_OFFSET.z
    );
  });

  return null;
}
