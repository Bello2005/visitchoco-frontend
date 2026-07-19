import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { loadChocoGeo, localToLonLat, WIDTH, HEIGHT } from "../utils/geo";
import type { ChocoGeo } from "../utils/geo";
import { worldGround } from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";

// Vegetación de la selva húmeda del Pacífico. Modelos low-poly de Bruno Simon
// (folio-2025, licencia MIT — ver public/models/folio/LICENSE.md), recoloreados
// a verdes tropicales del Chocó y dispersos SOLO en tierra firme dentro del
// polígono. Dos "especies" (siluetas distintas) instanciadas: 4 draw calls total.
const MODELS = {
  oak: "/models/folio/oakTrees.glb",
  cherry: "/models/folio/cherryTrees.glb",
} as const;
useGLTF.preload(MODELS.oak);
useGLTF.preload(MODELS.cherry);

// pseudo-random determinista con seed entera (mismo bosque en cada carga)
function seeded(n: number): number {
  let h = (n * 374761393 + 1013904223) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

// Separa tronco vs copa de un modelo de árbol y hornea las transformaciones de
// cada nodo en una sola geometría por parte. Devuelve base en y=0 y la altura
// total nativa para poder escalar a un tamaño objetivo en el mundo.
interface TreeGeo {
  trunk: THREE.BufferGeometry;
  canopy: THREE.BufferGeometry;
  nativeHeight: number;
}

function extractTree(scene: THREE.Object3D): TreeGeo {
  const trunkParts: THREE.BufferGeometry[] = [];
  const canopyParts: THREE.BufferGeometry[] = [];

  scene.updateWorldMatrix(true, true);
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const g = mesh.geometry.clone();
    g.applyMatrix4(mesh.matrixWorld); // hornea posición/escala del nodo
    // Solo posición y normal — descartamos UV para que el merge sea consistente
    const clean = new THREE.BufferGeometry();
    clean.setAttribute("position", g.getAttribute("position"));
    if (g.getAttribute("normal")) clean.setAttribute("normal", g.getAttribute("normal"));
    if (g.index) clean.setIndex(g.index);
    const name = mesh.name.toLowerCase();
    if (name.includes("body") || name.includes("plane")) trunkParts.push(clean);
    else canopyParts.push(clean);
  });

  const trunk = mergeGeometries(trunkParts, false);
  const canopy = mergeGeometries(canopyParts, false);

  // Base del tronco a y=0 (ambas partes con el mismo offset)
  trunk.computeBoundingBox();
  const minY = trunk.boundingBox!.min.y;
  trunk.translate(0, -minY, 0);
  canopy.translate(0, -minY, 0);

  canopy.computeBoundingBox();
  const nativeHeight = canopy.boundingBox!.max.y;

  return { trunk, canopy, nativeHeight };
}

interface Instance {
  x: number;
  z: number;
  y: number;
  rotY: number;
  tiltX: number;
  tiltZ: number;
  scale: number;
}

// Dispersa árboles en tierra firme (dentro del polígono, sobre el agua, bajo las
// cimas peladas), evitando el punto de aparición del vehículo.
function scatter(
  geo: ChocoGeo,
  count: number,
  seedBase: number,
  targetHeight: number,
  nativeHeight: number
): Instance[] {
  const base = targetHeight / nativeHeight;
  const out: Instance[] = [];
  let tries = 0;
  const maxTries = count * 60;

  while (out.length < count && tries < maxTries) {
    const s = seedBase + tries * 7;
    tries++;
    const x = (seeded(s) - 0.5) * WIDTH;
    const y = (seeded(s + 1) - 0.5) * HEIGHT; // local N-S
    const { lon, lat } = localToLonLat(geo, x, y);
    if (!geo.isInside(lon, lat)) continue;

    // Altura REAL de la superficie (worldGround = malla con playa), no la
    // terrainHeight cruda — si no, los árboles cerca de la costa flotan sobre
    // la playa rebajada o caen al agua. worldGround(x, -y): world Z = -y local.
    const h = worldGround(x, -y);
    if (h < 0.42 || h > 3.4) continue; // por encima de la playa, bajo la bruma

    // Claro de aparición del carro (world 9,7 → local 9,-7): que se vea al nacer
    if (Math.hypot(x - 9, y + 7) < 5) continue;

    out.push({
      x,
      z: -y, // world Z = -y local
      y: h - 0.12, // hundir la base en el suelo
      rotY: seeded(s + 2) * Math.PI * 2,
      tiltX: (seeded(s + 3) - 0.5) * 0.12,
      tiltZ: (seeded(s + 4) - 0.5) * 0.12,
      scale: base * (0.8 + seeded(s + 5) * 0.7),
    });
  }
  return out;
}

interface SpeciesProps {
  url: string;
  count: number;
  seedBase: number;
  targetHeight: number;
  trunkColor: string;
  canopyColor: string;
}

function TreeSpecies({
  url,
  count,
  seedBase,
  targetHeight,
  trunkColor,
  canopyColor,
}: SpeciesProps) {
  const { scene } = useGLTF(url);
  const { trunk, canopy, nativeHeight } = useMemo(
    () => extractTree(scene),
    [scene]
  );

  const [instances, setInstances] = useState<Instance[] | null>(null);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    let cancelled = false;
    loadChocoGeo().then((geo) => {
      if (!cancelled)
        setInstances(scatter(geo, count, seedBase, targetHeight, nativeHeight));
    });
    return () => {
      cancelled = true;
    };
  }, [count, seedBase, targetHeight, nativeHeight]);

  useLayoutEffect(() => {
    if (!instances) return;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      pos.set(inst.x, inst.y, inst.z);
      euler.set(inst.tiltX, inst.rotY, inst.tiltZ);
      quat.setFromEuler(euler);
      scl.setScalar(inst.scale);
      m.compose(pos, quat, scl);
      trunkRef.current?.setMatrixAt(i, m);
      canopyRef.current?.setMatrixAt(i, m);
    }
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (canopyRef.current) canopyRef.current.instanceMatrix.needsUpdate = true;
  }, [instances]);

  useEffect(() => {
    return () => {
      trunk.dispose();
      canopy.dispose();
    };
  }, [trunk, canopy]);

  if (!instances || instances.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[trunk, undefined, instances.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          color={trunkColor}
          flatShading
          roughness={0.9}
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </instancedMesh>
      <instancedMesh
        ref={canopyRef}
        args={[canopy, undefined, instances.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          color={canopyColor}
          flatShading
          roughness={0.85}
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </instancedMesh>
    </group>
  );
}

// Selva del Chocó: dos siluetas, copa esmeralda y una variedad más clara para
// dar profundidad al dosel. Tronco de corteza húmeda oscura.
export default function Vegetation() {
  return (
    <>
      <TreeSpecies
        url={MODELS.oak}
        count={320}
        seedBase={101}
        targetHeight={2.1}
        trunkColor="#4a3a28"
        canopyColor="#1f7d3f"
      />
      <TreeSpecies
        url={MODELS.cherry}
        count={220}
        seedBase={877}
        targetHeight={1.7}
        trunkColor="#4a3a28"
        canopyColor="#37a457"
      />
    </>
  );
}
