import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { loadChocoGeo, localToLonLat, WIDTH, HEIGHT } from "../utils/geo";
import type { ChocoGeo } from "../utils/geo";
import {
  worldGround,
  roadMask,
  patchNoise,
  MALECON_FRONT_X,
  MALECON_Z,
} from "./ChocoTerrain";
import { SPAWN_POS, makeCanoeGeometry } from "./Vehicle";
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

// Dispersa instancias en tierra firme (dentro del polígono), en la BANDA de
// alturas del bioma [minH, maxH], evitando carretera y spawn. La banda es lo
// que hace los biomas del Chocó real: playa (palmas), selva baja, bosque de
// niebla en las cimas.
function scatter(
  geo: ChocoGeo,
  count: number,
  seedBase: number,
  targetHeight: number,
  nativeHeight: number,
  minH: number,
  maxH: number
): Instance[] {
  const base = targetHeight / nativeHeight;
  const out: Instance[] = [];
  let tries = 0;
  const maxTries = count * 80;

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
    if (h < minH || h > maxH) continue;

    // MATAS con claros: solo crece donde el ruido de parches lo permite —
    // colocación con intención (bosquecillos + espacio negativo), no confeti
    if (patchNoise(x, y) < 0.55) continue;

    // Despeje generoso de la carretera: la vía es protagonista y respira
    if (roadMask(x, y) > 0.08) continue;

    // Claro de aparición del carro (coords locales: x, y = -z mundo)
    if (Math.hypot(x - SPAWN_POS.x, y + SPAWN_POS.z) < 5) continue;

    // Claro del MALECÓN DE QUIBDÓ: el paseo ribereño respira (sin selva encima)
    if (Math.hypot(x - (MALECON_FRONT_X - 1.5), y + MALECON_Z) < 6.5) continue;

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
  /** banda de alturas del bioma (defaults: selva baja) */
  minH?: number;
  maxH?: number;
}

function TreeSpecies({
  url,
  count,
  seedBase,
  targetHeight,
  trunkColor,
  canopyColor,
  minH = 0.42,
  maxH = 2.3,
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
        setInstances(
          scatter(geo, count, seedBase, targetHeight, nativeHeight, minH, maxH)
        );
    });
    return () => {
      cancelled = true;
    };
  }, [count, seedBase, targetHeight, nativeHeight, minH, maxH]);

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
            if (m) applyReveal(m, { sway: true });
          }}
        />
      </instancedMesh>
    </group>
  );
}

// Rocas de la Serranía: dodecaedros instanciados en las cotas altas — 1 draw
// call, dan textura a las crestas que se veían peladas.
function Rocks({ count, seedBase }: { count: number; seedBase: number }) {
  const geometry = useMemo(() => new THREE.DodecahedronGeometry(0.32, 0), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const [instances, setInstances] = useState<Instance[] | null>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    let cancelled = false;
    loadChocoGeo().then((geo) => {
      if (cancelled) return;
      const out: Instance[] = [];
      let tries = 0;
      while (out.length < count && tries < count * 80) {
        const s = seedBase + tries * 11;
        tries++;
        const x = (seeded(s) - 0.5) * WIDTH;
        const y = (seeded(s + 1) - 0.5) * HEIGHT;
        const { lon, lat } = localToLonLat(geo, x, y);
        if (!geo.isInside(lon, lat)) continue;
        const h = worldGround(x, -y);
        if (h < 1.9 || h > 5.4) continue; // solo cotas altas de la Serranía
        out.push({
          x,
          z: -y,
          y: h - 0.1,
          rotY: seeded(s + 2) * Math.PI * 2,
          tiltX: (seeded(s + 3) - 0.5) * 0.6,
          tiltZ: (seeded(s + 4) - 0.5) * 0.6,
          scale: 0.5 + seeded(s + 5) * 1.1,
        });
      }
      setInstances(out);
    });
    return () => {
      cancelled = true;
    };
  }, [count, seedBase, geometry]);

  useLayoutEffect(() => {
    if (!instances || !meshRef.current) return;
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
      meshRef.current.setMatrixAt(i, m);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [instances]);

  if (!instances || instances.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, instances.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    >
      <meshStandardMaterial
        color="#7d8577"
        flatShading
        roughness={0.95}
        ref={(m) => {
          if (m) applyReveal(m);
        }}
      />
    </instancedMesh>
  );
}

// ---------- palma chocoana procedural (tronco curvado + frondas radiales) ---
function makePalmGeometry(): {
  trunk: THREE.BufferGeometry;
  fronds: THREE.BufferGeometry;
} {
  // Escala pensada contra el carro (1.8×3.2): palma ~1.3 de alto, frondas
  // de ~0.55 — silueta costera, no monstruo jurásico.
  const trunk = new THREE.CylinderGeometry(0.035, 0.065, 1.1, 5, 4);
  trunk.translate(0, 0.55, 0); // base en y=0
  const tp = trunk.attributes.position;
  for (let i = 0; i < tp.count; i++) {
    const y = tp.getY(i);
    tp.setX(i, tp.getX(i) + Math.pow(y / 1.1, 2) * 0.22); // curvatura al mar
  }
  trunk.computeVertexNormals();

  const frondParts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const f = new THREE.PlaneGeometry(0.58, 0.15, 3, 1);
    f.translate(0.29, 0, 0); // extender hacia afuera desde el eje
    const fp = f.attributes.position;
    for (let k = 0; k < fp.count; k++) {
      const x = fp.getX(k);
      fp.setY(k, fp.getY(k) - Math.pow(x / 0.58, 2) * 0.24); // caída de la hoja
    }
    f.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    f.applyMatrix4(
      new THREE.Matrix4().makeRotationY((i * Math.PI) / 3 + 0.25)
    );
    f.translate(0.22, 1.12, 0); // copa del tronco curvado
    frondParts.push(f);
  }
  const fronds = mergeGeometries(frondParts, false);
  fronds.computeVertexNormals();
  return { trunk, fronds };
}

// Palmas del litoral Pacífico: solo en la banda de playa (biome real del
// Chocó costero). 2 draw calls instanciados.
function Palms({ count, seedBase }: { count: number; seedBase: number }) {
  const { trunk, fronds } = useMemo(makePalmGeometry, []);
  useEffect(
    () => () => {
      trunk.dispose();
      fronds.dispose();
    },
    [trunk, fronds]
  );

  const [instances, setInstances] = useState<Instance[] | null>(null);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const frondsRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    let cancelled = false;
    loadChocoGeo().then((geo) => {
      if (!cancelled)
        setInstances(scatter(geo, count, seedBase, 1.9, 1.9, 0.1, 0.42));
    });
    return () => {
      cancelled = true;
    };
  }, [count, seedBase]);

  useLayoutEffect(() => {
    if (!instances) return;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      pos.set(inst.x, inst.y + 0.08, inst.z);
      euler.set(inst.tiltX * 0.5, inst.rotY, inst.tiltZ * 0.5);
      quat.setFromEuler(euler);
      scl.setScalar(inst.scale);
      m.compose(pos, quat, scl);
      trunkRef.current?.setMatrixAt(i, m);
      frondsRef.current?.setMatrixAt(i, m);
    }
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (frondsRef.current) frondsRef.current.instanceMatrix.needsUpdate = true;
  }, [instances]);

  if (!instances || instances.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[trunk, undefined, instances.length]}
        castShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#8a6a42"
          flatShading
          roughness={0.95}
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </instancedMesh>
      {/* Las frondas NO proyectan sombra: planos horizontales → manchas
          enormes y duras en el suelo que confunden más de lo que aportan */}
      <instancedMesh
        ref={frondsRef}
        args={[fronds, undefined, instances.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#3fae5a"
          flatShading
          roughness={0.85}
          side={THREE.DoubleSide}
          ref={(m) => {
            if (m) applyReveal(m, { sway: true });
          }}
        />
      </instancedMesh>
    </group>
  );
}

// Pangas varadas en las orillas — la escena cotidiana del Chocó ribereño.
// Reusa el casco del vehículo. 1 draw call.
function BeachedCanoes({ count, seedBase }: { count: number; seedBase: number }) {
  const geometry = useMemo(makeCanoeGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const [instances, setInstances] = useState<Instance[] | null>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    let cancelled = false;
    loadChocoGeo().then((geo) => {
      if (!cancelled)
        setInstances(scatter(geo, count, seedBase, 1, 1, 0.12, 0.3));
    });
    return () => {
      cancelled = true;
    };
  }, [count, seedBase]);

  useLayoutEffect(() => {
    if (!instances || !meshRef.current) return;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      pos.set(inst.x, inst.y + 0.28, inst.z);
      euler.set(inst.tiltX * 0.4, inst.rotY, inst.tiltZ * 0.4);
      quat.setFromEuler(euler);
      scl.setScalar(0.75 + (inst.scale % 0.3));
      m.compose(pos, quat, scl);
      meshRef.current.setMatrixAt(i, m);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [instances]);

  if (!instances || instances.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, instances.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    >
      <meshStandardMaterial
        color="#6e4519"
        flatShading
        roughness={0.9}
        ref={(m) => {
          if (m) applyReveal(m);
        }}
      />
    </instancedMesh>
  );
}

// Biomas del Chocó real, por banda de altura de la superficie:
//   playa (0.10-0.42): palmas del litoral + pangas varadas
//   selva baja (0.42-2.3): dosel denso de dos siluetas + matorral
//   bosque de niebla del Baudó (2.2-3.8): árboles bajos verde-bruma
//   crestas (1.9-4.2): rocas
// Todo instanciado: ~11 draw calls.
// CALIDAD sobre cantidad (lección de folio-2025): la mitad de elementos,
// agrupados en matas por patchNoise con claros y la carretera despejada.
export default function Vegetation() {
  return (
    <>
      <TreeSpecies
        url={MODELS.oak}
        count={240}
        seedBase={101}
        targetHeight={2.1}
        trunkColor="#4a3a28"
        canopyColor="#1f7d3f"
      />
      <TreeSpecies
        url={MODELS.cherry}
        count={170}
        seedBase={877}
        targetHeight={1.7}
        trunkColor="#4a3a28"
        canopyColor="#37a457"
      />
      {/* Matorral: la misma silueta cherry a escala de arbusto, pegada al piso */}
      <TreeSpecies
        url={MODELS.cherry}
        count={120}
        seedBase={3301}
        targetHeight={0.55}
        trunkColor="#3a2d1e"
        canopyColor="#2c8a4b"
      />
      {/* Bosque de niebla de la Serranía del Baudó: bajo, denso, verde-bruma */}
      <TreeSpecies
        url={MODELS.oak}
        count={140}
        seedBase={5507}
        targetHeight={1.15}
        trunkColor="#3a3226"
        canopyColor="#3d6b52"
        minH={2.2}
        maxH={4.6}
      />
      <Palms count={110} seedBase={9091} />
      <BeachedCanoes count={10} seedBase={12007} />
      <Rocks count={90} seedBase={7717} />
    </>
  );
}
