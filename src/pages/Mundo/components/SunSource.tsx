import { forwardRef, useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { vehicleState } from "../utils/vehicleState";
import { LIGHT_OFFSET } from "./ShadowRig";

// Disco solar que sirve de ORIGEN a los GodRays del EffectComposer.
//
// No lleva applyReveal: es fuente de luz, exenta del materializado igual que
// MunicipalityLights y los faros del vehículo (si se descartara fuera del
// radio de revelado, los rayos parpadearían durante el intro).
//
// GodRaysEffect exige que la mesh no escriba profundidad y sea transparente
// (de hecho su setter lo fuerza); se declara acá igual para que el mesh sea
// correcto aunque todavía no lo haya tomado el efecto.

const SUN_DISTANCE = 280;

interface SunSourceProps {
  /** Se llama al montar/desmontar la mesh: Mundo espera a tenerla para
   *  recién ahí montar <GodRays> (su update() desreferencia lightSource
   *  sin chequear null). */
  onReady?: (mesh: THREE.Mesh | null) => void;
}

const SunSource = forwardRef<THREE.Mesh, SunSourceProps>(function SunSource(
  { onReady },
  ref
) {
  // Ref interna: useFrame siempre trabaja contra ésta, así el componente
  // funciona igual reciba una ref-objeto, una callback ref o ninguna.
  const inner = useRef<THREE.Mesh | null>(null);

  const attach = useCallback(
    (node: THREE.Mesh | null) => {
      inner.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
      onReady?.(node);
    },
    [ref, onReady]
  );

  // Dirección constante del sol, normalizada una sola vez.
  const dir = useMemo(() => LIGHT_OFFSET.clone().normalize(), []);

  useFrame(() => {
    const mesh = inner.current;
    if (!mesh) return;
    // Sigue al vehículo en X/Z manteniendo la MISMA dirección relativa: el sol
    // no queda clavado en un punto del mapa, así los rayos se comportan igual
    // manejes donde manejes.
    mesh.position.set(
      vehicleState.x + dir.x * SUN_DISTANCE,
      LIGHT_OFFSET.y * 10,
      vehicleState.z + dir.z * SUN_DISTANCE
    );
  });

  return (
    <mesh ref={attach} frustumCulled={false}>
      <sphereGeometry args={[2.5, 12, 12]} />
      <meshBasicMaterial color="#ffe8c2" transparent depthWrite={false} />
    </mesh>
  );
});

export default SunSource;
