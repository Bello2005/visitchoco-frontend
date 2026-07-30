import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { loadChocoGeo, localToLonLat, WIDTH, HEIGHT } from "../utils/geo";
import { worldGround, roadMask } from "./ChocoTerrain";
import { SPAWN_POS } from "./Vehicle";
import { applyReveal } from "../utils/applyReveal";

// Fauna low-poly del Chocó (placeholder hasta tener los modelos reales):
// garzas blancas paradas en las orillas + una bandada volando en círculos
// sobre el valle del Atrato. Instanciado — 3 draw calls en total.

function seeded(n: number): number {
  let h = (n * 374761393 + 1013904223) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

// Garza: cuerpo ovoide + cuello en S simplificado + cabeza. Una sola
// geometría blanca (pico/patas van en la segunda, oscura).
function makeHeronBody(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const body = new THREE.SphereGeometry(0.09, 6, 5);
  body.scale(1, 0.85, 1.5);
  body.translate(0, 0.26, 0);
  parts.push(body);
  const neck = new THREE.CylinderGeometry(0.02, 0.028, 0.22, 5);
  neck.translate(0, 0.42, 0.1);
  neck.rotateX(0.35);
  parts.push(neck);
  const head = new THREE.SphereGeometry(0.04, 6, 5);
  head.translate(0, 0.52, 0.16);
  parts.push(head);
  const g = mergeGeometries(parts, false);
  g.computeVertexNormals();
  return g;
}

function makeHeronDark(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const beak = new THREE.ConeGeometry(0.014, 0.12, 4);
  beak.rotateX(Math.PI / 2 - 0.25);
  beak.translate(0, 0.51, 0.24);
  parts.push(beak);
  for (const side of [-1, 1]) {
    const leg = new THREE.CylinderGeometry(0.008, 0.008, 0.24, 4);
    leg.translate(side * 0.035, 0.1, 0);
    parts.push(leg);
  }
  const g = mergeGeometries(parts, false);
  g.computeVertexNormals();
  return g;
}

interface Placement {
  x: number;
  y: number;
  z: number;
  rotY: number;
  s: number;
}

function Garzas({ count, seedBase }: { count: number; seedBase: number }) {
  const bodyGeo = useMemo(makeHeronBody, []);
  const darkGeo = useMemo(makeHeronDark, []);
  useEffect(
    () => () => {
      bodyGeo.dispose();
      darkGeo.dispose();
    },
    [bodyGeo, darkGeo]
  );

  const [placements, setPlacements] = useState<Placement[] | null>(null);
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const darkRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    let cancelled = false;
    loadChocoGeo().then((geo) => {
      if (cancelled) return;
      const out: Placement[] = [];
      let tries = 0;
      while (out.length < count && tries < count * 120) {
        const s = seedBase + tries * 13;
        tries++;
        const x = (seeded(s) - 0.5) * WIDTH;
        const y = (seeded(s + 1) - 0.5) * HEIGHT;
        const { lon, lat } = localToLonLat(geo, x, y);
        if (!geo.isInside(lon, lat)) continue;
        const h = worldGround(x, -y);
        if (h < 0.04 || h > 0.28) continue; // solo la orilla misma
        if (roadMask(x, y) > 0.15) continue;
        if (Math.hypot(x - SPAWN_POS.x, y + SPAWN_POS.z) < 4) continue;
        out.push({
          x,
          y: h,
          z: -y,
          rotY: seeded(s + 2) * Math.PI * 2,
          s: 0.9 + seeded(s + 3) * 0.4,
        });
      }
      setPlacements(out);
    });
    return () => {
      cancelled = true;
    };
  }, [count, seedBase]);

  useLayoutEffect(() => {
    if (!placements) return;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();
    for (let i = 0; i < placements.length; i++) {
      const p = placements[i];
      pos.set(p.x, p.y, p.z);
      euler.set(0, p.rotY, 0);
      quat.setFromEuler(euler);
      scl.setScalar(p.s);
      m.compose(pos, quat, scl);
      bodyRef.current?.setMatrixAt(i, m);
      darkRef.current?.setMatrixAt(i, m);
    }
    if (bodyRef.current) bodyRef.current.instanceMatrix.needsUpdate = true;
    if (darkRef.current) darkRef.current.instanceMatrix.needsUpdate = true;
  }, [placements]);

  if (!placements || placements.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeo, undefined, placements.length]}
        castShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#f2f3ee"
          flatShading
          roughness={0.8}
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </instancedMesh>
      <instancedMesh
        ref={darkRef}
        args={[darkGeo, undefined, placements.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#c98a3b"
          flatShading
          roughness={0.9}
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </instancedMesh>
    </group>
  );
}

// Bandada: pájaros-silueta (dos alas en V) orbitando lento sobre el valle,
// con aleteo y bobbing. Matrices recalculadas por frame (14 aves = barato).
const FLOCK_COUNT = 14;
const FLOCK_CENTER = { x: 4, z: -6 };
const FLOCK_R = 11;
const FLOCK_Y = 6.5;

function makeBirdGeometry(): THREE.BufferGeometry {
  // dos triángulos en V (alas), silueta clásica de ave lejana
  const g = new THREE.BufferGeometry();
  const v = new Float32Array([
    // ala izquierda
    0, 0, 0.14, -0.34, 0.1, -0.1, 0, 0, -0.08,
    // ala derecha
    0, 0, 0.14, 0, 0, -0.08, 0.34, 0.1, -0.1,
  ]);
  g.setAttribute("position", new THREE.BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

function Bandada() {
  const geo = useMemo(makeBirdGeometry, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const scl = useMemo(() => new THREE.Vector3(), []);
  const euler = useMemo(() => new THREE.Euler(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < FLOCK_COUNT; i++) {
      const off = (i / FLOCK_COUNT) * Math.PI * 2;
      const a = t * 0.12 + off; // órbita lenta
      const r = FLOCK_R + Math.sin(off * 3.1) * 2.2;
      const x = FLOCK_CENTER.x + Math.cos(a) * r;
      const z = FLOCK_CENTER.z + Math.sin(a) * r;
      const yv = FLOCK_Y + Math.sin(t * 0.9 + off * 5.0) * 0.5;
      const flap = Math.sin(t * 7 + off * 9) * 0.45; // aleteo
      pos.set(x, yv, z);
      euler.set(flap, -a - Math.PI / 2, 0); // tangente a la órbita
      quat.setFromEuler(euler);
      scl.setScalar(0.9);
      m.compose(pos, quat, scl);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, undefined, FLOCK_COUNT]}
      frustumCulled={false}
    >
      <meshBasicMaterial
        color="#1e2b33"
        side={THREE.DoubleSide}
        ref={(m2) => {
          if (m2) applyReveal(m2);
        }}
      />
    </instancedMesh>
  );
}

export default function Fauna() {
  return (
    <>
      <Garzas count={14} seedBase={40009} />
      <Bandada />
    </>
  );
}
