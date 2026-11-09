// Road ribbon originally adapted from folio-2025 (Bruno Simon, MIT).
// See src/pages/Mundo/CREDITS.md. Bridge styling references Yuto, Chocó.
import { useEffect, useState } from "react";
import * as THREE from "three";
import { CuboidCollider, RigidBody, TrimeshCollider } from "@react-three/rapier";
import { roadCenterWorldX, worldGround, WATER_LEVEL, GATEWAY_Z, NORTH_Z, getRoadPlan, whenHeightFieldReady } from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";
import { buildRoad } from "../utils/roadGeometry";
import type { RoadGeometry } from "../utils/roadGeometry";

const PALETTE = {
  asphalt: "#30353a", white: "#f4efdc", yellow: "#f7cb38",
  concrete: "#afb4ad", rail: "#e9b52d", metal: "#56696e", light: "#fff1bc",
};

export default function RoadRibbon() {
  const [road, setRoad] = useState<RoadGeometry | null>(null);
  useEffect(() => {
    let cancelled = false;
    let built: RoadGeometry | undefined;
    // Use the published coast/ramp heights, not the procedural fallback.
    void whenHeightFieldReady().then(() => {
      if (cancelled) return;
      built = buildRoad({ startZ: GATEWAY_Z + 0.5, endZ: NORTH_Z - 0.5, centerX: roadCenterWorldX, ground: worldGround, waterLevel: WATER_LEVEL }, getRoadPlan());
      setRoad(built);
    });
    return () => {
      cancelled = true;
      Object.values(built?.layers ?? {}).forEach(geometry => geometry.dispose());
      built?.surface.dispose();
    };
  }, []);

  if (!road) return null;
  return (
    <group>
      {Object.entries(road.layers).map(([name, geometry]) => {
        const layer = name as keyof typeof PALETTE;
        return (
          <mesh key={layer} geometry={geometry} castShadow={layer === "concrete" || layer === "rail"} receiveShadow dispose={null}>
            <meshStandardMaterial
              color={PALETTE[layer]}
              roughness={layer === "metal" ? 0.4 : 0.82}
              metalness={layer === "rail" || layer === "metal" ? 0.35 : 0}
              side={THREE.DoubleSide}
              emissive={layer === "light" ? PALETTE.light : "#000000"}
              emissiveIntensity={layer === "light" ? 0.7 : 0}
              ref={material => { if (material) applyReveal(material, { groundDetail: layer === "asphalt" || layer === "concrete" }); }}
            />
          </mesh>
        );
      })}
      <RigidBody type="fixed" colliders={false}>
        <TrimeshCollider args={[road.surface.attributes.position.array as Float32Array, road.surface.index!.array as Uint32Array]} />
        {road.barriers.map((barrier, i) => (
          <CuboidCollider key={i} args={[0.08, 0.52, barrier.halfLength]} position={barrier.position} rotation={barrier.rotation} />
        ))}
      </RigidBody>
    </group>
  );
}
