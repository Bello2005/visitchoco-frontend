// Rig de sombras adaptado de Lighting.js de folio-2025 (Bruno Simon, MIT).
// Ver src/pages/Mundo/CREDITS.md para la atribución y la licencia.
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { vehicleState } from "../utils/vehicleState";
import { qualityState, subscribeQuality } from "../utils/qualityState";

// El "piso pixelado" era el shadow map: 2048px repartidos sobre TODO el mapa
// (84×110) = sombras borrosas tipo mancha. folio-2025 mueve la luz CON el
// jugador y encoge la cámara de sombras (Ligthing.js: shadowAmplitude =
// radio de la vista). Aquí igual: la cámara de sombras cubre solo ±SHADOW_R
// alrededor del carro → ~4× más texels por metro = sombras nítidas SIEMPRE.
// Radio por defecto; el nivel de calidad lo ajusta (ver useEffect).
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

    light.shadow.camera.near = 1;
    light.shadow.camera.far = 90;

    // Radio y resolución del shadow map según calidad. Al cambiar el mapSize
    // hay que DESECHAR el render target: three sólo lo recrea si es null.
    const applyQuality = () => {
      const p = qualityState.profile;
      const r = p.shadows ? p.shadowRadius : SHADOW_R;
      light.castShadow = p.shadows;
      light.shadow.camera.left = -r;
      light.shadow.camera.right = r;
      light.shadow.camera.top = r;
      light.shadow.camera.bottom = -r;
      light.shadow.camera.updateProjectionMatrix();
      if (light.shadow.mapSize.width !== p.shadowMapSize) {
        light.shadow.mapSize.set(p.shadowMapSize, p.shadowMapSize);
        light.shadow.map?.dispose();
        light.shadow.map = null;
      }
    };
    applyQuality();
    const unsub = subscribeQuality(applyQuality);

    return () => {
      unsub();
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
