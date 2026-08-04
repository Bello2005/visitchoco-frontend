import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useFlora } from "./Vegetation";
import { applyReveal } from "../utils/applyReveal";

// Detalle ambiental: motas de polvo flotando en los haces de luz y mariposas
// revoloteando sobre las matas. Ambos se siembran con el MISMO useFlora que
// usa Vegetation (patch:"in" = las matas densas, no los claros), así el polvo
// y las mariposas caen donde de verdad hay follaje en vez de repartirse por
// un mapa que no conocen.
//
// A diferencia de la vegetación, acá la matriz SÍ se recompone cada frame —
// son 80 + 20 instancias, el costo es despreciable frente al beneficio.

function seeded(n: number): number {
  let h = (n * 374761393 + 1013904223) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

const DUST_COUNT = 80;
const DUST_FLOOR = 0.4; // altura de arranque sobre el suelo
const DUST_RISE = 3.8; // recorrido vertical antes de reciclar

function DustMotes() {
  const geo = useMemo(() => new THREE.SphereGeometry(0.03, 4, 3), []);
  useEffect(() => () => geo.dispose(), [geo]);

  const instances = useFlora(DUST_COUNT, 24001, {
    minH: 0.4,
    maxH: 5.2,
    patch: "in",
    sink: 0,
    scaleMin: 1,
    scaleMax: 1,
  });

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const scl = useMemo(() => new THREE.Vector3(), []);

  // Brillo variable por instancia. La opacidad NO puede variar por instancia
  // (el material es uno solo), así que se modula el color: contra el fondo
  // oscuro lee igual que una opacidad distinta en cada mota.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !instances) return;
    const c = new THREE.Color();
    for (let i = 0; i < instances.length; i++) {
      const b = 0.5 + seeded(i * 31 + 7) * 0.5;
      c.setRGB(b, b, b);
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instances]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || !instances) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      const ph = seeded(i * 17 + 3);
      // Ascenso cíclico por módulo en vez de acumular: es independiente del
      // frame-rate y no acumula deriva en sesiones largas.
      const climb = (t * 0.05 + ph) % 1;
      pos.set(
        inst.x + Math.sin(t * 0.6 + ph * 6.283) * 0.35,
        inst.y + DUST_FLOOR + climb * DUST_RISE,
        inst.z + Math.cos(t * 0.45 + ph * 6.283) * 0.3
      );
      // La escala se apaga en los extremos del recorrido: esconde el salto
      // del reciclado sin tener que tocar el buffer de color cada frame.
      scl.setScalar(0.6 + Math.sin(climb * Math.PI) * (0.7 + ph * 0.6));
      m.compose(pos, quat, scl);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (!instances || instances.length === 0) return null;
  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, undefined, instances.length]}
      frustumCulled={false}
    >
      <meshBasicMaterial
        color="#fff4d6"
        transparent
        opacity={0.65}
        depthWrite={false}
        ref={(mat) => {
          if (mat) applyReveal(mat);
        }}
      />
    </instancedMesh>
  );
}

// Mariposa: dos triángulos en V abierta (ala izquierda / derecha).
function makeButterflyGeometry(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const w = 0.13; // envergadura de media ala
  const d = 0.09; // largo
  const lift = 0.05; // apertura de la V
  const v = new Float32Array([
    // ala izquierda
    0, 0, 0, -w, lift, -d, -w, lift, d,
    // ala derecha
    0, 0, 0, w, lift, d, w, lift, -d,
  ]);
  g.setAttribute("position", new THREE.BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

function Butterflies({
  count,
  seedBase,
  color,
}: {
  count: number;
  seedBase: number;
  color: string;
}) {
  const geo = useMemo(makeButterflyGeometry, []);
  useEffect(() => () => geo.dispose(), [geo]);

  const instances = useFlora(count, seedBase, {
    minH: 0.4,
    maxH: 4.6,
    patch: "in",
    sink: 0,
    scaleMin: 1,
    scaleMax: 1,
  });

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const scl = useMemo(() => new THREE.Vector3(), []);
  const euler = useMemo(() => new THREE.Euler(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || !instances) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      const ph = seeded(seedBase + i * 13) * 6.283;
      const r = 0.7 + seeded(seedBase + i * 29) * 1.1;
      // Órbita lenta alrededor de un punto fijo: "zona con mariposas", no
      // vuelo libre por todo el mapa — más barato y más creíble.
      const a = t * (0.25 + seeded(seedBase + i * 41) * 0.2) + ph;
      pos.set(
        inst.x + Math.cos(a) * r,
        inst.y + 0.75 + Math.sin(t * 1.3 + ph) * 0.35,
        inst.z + Math.sin(a) * r
      );
      // Aleteo en Z + morro hacia la tangente de la órbita.
      euler.set(0, -a, Math.sin(t * 14 + ph) * 0.4);
      quat.setFromEuler(euler);
      scl.setScalar(0.85 + seeded(seedBase + i * 53) * 0.4);
      m.compose(pos, quat, scl);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (!instances || instances.length === 0) return null;
  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, undefined, instances.length]}
      frustumCulled={false}
    >
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        ref={(mat) => {
          if (mat) applyReveal(mat);
        }}
      />
    </instancedMesh>
  );
}

export default function AmbientDetail() {
  return (
    <>
      <DustMotes />
      {/* Azul Morpho + una naranja para que no se vean todas iguales */}
      <Butterflies count={10} seedBase={31013} color="#4a6fd4" />
      <Butterflies count={10} seedBase={31051} color="#e8823c" />
    </>
  );
}
