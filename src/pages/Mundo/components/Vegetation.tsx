import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { loadChocoGeo, localToLonLat, WIDTH, HEIGHT } from "../utils/geo";
import type { ChocoGeo } from "../utils/geo";
import {
  worldGround,
  roadMask,
  patchNoise,
  whenHeightFieldReady,
  MALECON_FRONT_X,
  MALECON_Z,
} from "./ChocoTerrain";
import { SPAWN_POS, makeCanoeGeometry } from "./Vehicle";
import { applyReveal } from "../utils/applyReveal";

// VEGETACIÓN DEL CHOCÓ — selva húmeda del Pacífico, PROCEDURAL y premium.
//
// Todo se genera a mano (cero GLB): árboles con copa de DEGRADADO vertical
// horneado en vertex-colors (volumen y luz, no bolas planas), PALMAS con
// tronco curvo, frondas plegadas que caen y cocos, HELICONIAS junto al agua,
// y CÉSPED que se mece. Todo instanciado (~1 draw call por parte), anclado a la
// superficie REAL (worldGround, esperando el heightfield → nada flota), y con
// la BRISA del shader (applyReveal sway) proporcional a la altura.
//
// Biomas por banda de altura de la superficie (la clave del look del Chocó):
//   playa (0.10-0.42): palmas del litoral + pangas varadas
//   ribera (0.14-0.5): heliconias/platanillo
//   selva baja (0.42-2.3): dosel de dos siluetas + arbustos + césped en claros
//   bosque de niebla del Baudó (2.2-4.6): árboles bajos verde-bruma
//   crestas (1.9-5.4): rocas

// --- PRNG determinista (mismo bosque en cada carga) ---
function seeded(n: number): number {
  let h = (n * 374761393 + 1013904223) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function smoothstep(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

// Normaliza a NO-INDEXADO y SOLO-POSICIÓN → así cualquier mezcla de formas
// (icosferas no indexadas, cilindros indexados, frondas…) es consistente para
// mergeGeometries. Las normales se computan DESPUÉS del merge (o en
// bakeGradient). Con flatShading el shader usa derivadas, no el atributo normal.
function posOnly(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const src = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute(
    "position",
    (src.getAttribute("position") as THREE.BufferAttribute).clone()
  );
  if (src !== g) src.dispose();
  g.dispose();
  return o;
}

// Hornea un DEGRADADO vertical en vertex-colors: oscuro abajo/dentro → claro
// arriba, y un plus por normal.y (top-lit). Esto es lo que da el volumen
// "premium" a la copa sin texturas.
function bakeGradient(
  geo: THREE.BufferGeometry,
  colBottom: string,
  colTop: string,
  topLight = 0.16
): void {
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const minY = bb.min.y;
  const spanY = Math.max(1e-4, bb.max.y - bb.min.y);
  const p = geo.attributes.position;
  const nrm = geo.attributes.normal;
  const cB = new THREE.Color(colBottom);
  const cT = new THREE.Color(colTop);
  const tmp = new THREE.Color();
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const t = smoothstep((p.getY(i) - minY) / spanY);
    tmp.copy(cB).lerp(cT, t);
    const up = Math.max(0, nrm.getY(i));
    tmp.multiplyScalar(1 - topLight + topLight * (0.4 + up));
    col[i * 3] = tmp.r;
    col[i * 3 + 1] = tmp.g;
    col[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
}

// ---------- ÁRBOL: tronco cónico + copa de icosferas con degradado ----------
interface TwoGeo {
  wood: THREE.BufferGeometry;
  leaf: THREE.BufferGeometry;
  height: number;
}
function makeTreeGeo(cfg: {
  height: number;
  trunkR: number;
  crownR: number;
  colBot: string;
  colTop: string;
  seed: number;
  layers?: number;
}): TwoGeo {
  const { height, trunkR, crownR, colBot, colTop, seed } = cfg;
  const layers = cfg.layers ?? 2;
  const rnd = mulberry32(seed);
  const trunkH = height * 0.44;

  const trunk = new THREE.CylinderGeometry(trunkR * 0.55, trunkR, trunkH, 6, 1);
  trunk.translate(0, trunkH / 2, 0);
  const wood = posOnly(trunk);
  wood.computeVertexNormals();

  // Copa: 1 icosfera grande achatada + capas menores desplazadas arriba →
  // corona voluminosa y algo irregular (nube de hojas), no una bola perfecta.
  const parts: THREE.BufferGeometry[] = [];
  const main = new THREE.IcosahedronGeometry(crownR, 1);
  main.scale(1, 0.9, 1);
  main.translate(0, trunkH + crownR * 0.72, 0);
  parts.push(posOnly(main));
  for (let l = 1; l <= layers - 1; l++) {
    const r = crownR * (0.66 - l * 0.12);
    const g = new THREE.IcosahedronGeometry(r, 1);
    g.translate(
      (rnd() - 0.5) * crownR * 0.5,
      trunkH + crownR * (1.05 + l * 0.35),
      (rnd() - 0.5) * crownR * 0.5
    );
    parts.push(posOnly(g));
  }
  const leaf = mergeGeometries(parts, false);
  // Sacudida orgánica de los vértices de la copa (rompe la esfera perfecta)
  const p = leaf.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(
      i,
      p.getX(i) + (rnd() - 0.5) * crownR * 0.22,
      p.getY(i) + (rnd() - 0.5) * crownR * 0.14,
      p.getZ(i) + (rnd() - 0.5) * crownR * 0.22
    );
  }
  p.needsUpdate = true;
  bakeGradient(leaf, colBot, colTop);
  return { wood, leaf, height };
}

// ---------- FRONDA plegada que cae (palma / heliconia) ----------
// Tres líneas longitudinales (izq / lomo / der): el lomo va arriba y los bordes
// caen → sección en V. El largo se arquea hacia abajo (caída). Nada de cartón.
function makeFrond(cfg: {
  len: number;
  wid: number;
  sag: number; // cuánto se arquea hacia abajo la punta
  fold: number; // pliegue en V de la sección
  taper: number; // afinado del ancho hacia la punta
  segs: number;
}): THREE.BufferGeometry {
  const { len, wid, sag, fold, taper, segs } = cfg;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const x = t * len;
    const droop = -sag * t * t;
    const hw = wid * (1 - t * taper) * 0.5;
    const edgeY = droop - fold * hw;
    pos.push(x, edgeY, -hw); // izq  (3i)
    pos.push(x, droop, 0); //   lomo (3i+1)
    pos.push(x, edgeY, hw); //  der  (3i+2)
  }
  for (let i = 0; i < segs; i++) {
    const a = 3 * i;
    const b = 3 * (i + 1);
    idx.push(a, b, a + 1, a + 1, b, b + 1); // media izquierda
    idx.push(a + 1, b + 1, a + 2, a + 2, b + 1, b + 2); // media derecha
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return posOnly(g); // no-indexado, solo posición (normales tras el merge)
}

// ---------- PALMA del litoral: tronco curvo + cocos + corona de frondas ------
function makePalmGeo(): TwoGeo {
  const height = 2.3;
  const trunkH = 1.95;
  // tronco curvado hacia el mar
  const trunk = new THREE.CylinderGeometry(0.05, 0.1, trunkH, 6, 8);
  trunk.translate(0, trunkH / 2, 0);
  const tp = trunk.attributes.position;
  for (let i = 0; i < tp.count; i++) {
    const y = tp.getY(i);
    tp.setX(i, tp.getX(i) + Math.pow(y / trunkH, 2) * 0.42);
  }
  trunk.computeVertexNormals();
  const woodParts: THREE.BufferGeometry[] = [posOnly(trunk)];
  // cabeza y cocos bajo la corona (en la punta curvada del tronco)
  const headX = 0.42;
  const head = new THREE.IcosahedronGeometry(0.14, 0);
  head.translate(headX, trunkH + 0.05, 0);
  woodParts.push(posOnly(head));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const c = new THREE.IcosahedronGeometry(0.075, 0);
    c.translate(headX + Math.cos(a) * 0.14, trunkH - 0.04, Math.sin(a) * 0.14);
    woodParts.push(posOnly(c));
  }
  const wood = mergeGeometries(woodParts, false);
  wood.computeVertexNormals();

  // corona de frondas plegadas que caen
  const frondParts: THREE.BufferGeometry[] = [];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const f = makeFrond({
      len: 1.15,
      wid: 0.34,
      sag: 0.72,
      fold: 0.5,
      taper: 0.8,
      segs: 6,
    });
    const pitch = -0.15 - (i % 2) * 0.12; // unas más caídas que otras
    f.rotateZ(pitch);
    f.rotateY((i / n) * Math.PI * 2 + 0.3);
    f.translate(headX, trunkH + 0.02, 0);
    frondParts.push(f);
  }
  const leaf = mergeGeometries(frondParts, false);
  bakeGradient(leaf, "#1f8a49", "#4bc06a", 0.1);
  return { wood, leaf, height };
}

// ---------- HELICONIA / platanillo: hojas anchas + bráctea roja ----------
function makeHeliconiaGeo(): TwoGeo {
  const height = 0.95;
  const stemH = 0.72;
  const woodParts: THREE.BufferGeometry[] = [];
  const stem = new THREE.CylinderGeometry(0.02, 0.035, stemH, 5);
  stem.translate(0, stemH / 2, 0);
  woodParts.push(posOnly(stem));
  // bráctea roja (la flor colgante del platanillo) — acento de color
  const bractParts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 3; i++) {
    const b = new THREE.ConeGeometry(0.05, 0.16, 4);
    b.rotateZ(Math.PI / 2 - 0.5);
    b.translate(0.1 + i * 0.06, stemH - 0.05 - i * 0.09, 0);
    bractParts.push(posOnly(b));
  }
  const bract = mergeGeometries(bractParts, false);
  bract.computeVertexNormals();
  const bcol = new Float32Array(bract.attributes.position.count * 3);
  const cred = new THREE.Color("#c1502f");
  for (let i = 0; i < bract.attributes.position.count; i++) {
    bcol[i * 3] = cred.r;
    bcol[i * 3 + 1] = cred.g;
    bcol[i * 3 + 2] = cred.b;
  }
  bract.setAttribute("color", new THREE.BufferAttribute(bcol, 3));

  // hojas anchas casi erguidas (banano-like)
  const leafParts: THREE.BufferGeometry[] = [];
  const n = 5;
  for (let i = 0; i < n; i++) {
    const f = makeFrond({
      len: 0.62,
      wid: 0.4,
      sag: 0.28,
      fold: 0.7,
      taper: 0.5,
      segs: 4,
    });
    f.rotateZ(0.7 - (i % 2) * 0.25); // erguidas
    f.rotateY((i / n) * Math.PI * 2 + 0.2);
    f.translate(0, stemH * 0.55, 0);
    leafParts.push(f);
  }
  const leaves = mergeGeometries(leafParts, false);
  bakeGradient(leaves, "#1c8a4c", "#46b86a", 0.12);
  // fusionar hojas + bráctea (ambas con color) en una sola geo "leaf"
  const leaf = mergeGeometries([leaves, bract], false);
  const wood = mergeGeometries(woodParts, false);
  wood.computeVertexNormals();
  return { wood, leaf, height };
}

// ---------- CÉSPED: matojo de briznas curvas con degradado ----------
function makeBlade(w: number, h: number, curve: number): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(w, h, 1, 3);
  g.translate(0, h / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const ty = p.getY(i) / h;
    p.setX(i, p.getX(i) * (1 - ty * 0.85)); // afina hacia la punta
    p.setZ(i, p.getZ(i) + ty * ty * curve); // se arquea
  }
  return posOnly(g);
}
function makeGrassTuft(seed: number): THREE.BufferGeometry {
  const rnd = mulberry32(seed);
  const parts: THREE.BufferGeometry[] = [];
  const blades = 5;
  for (let i = 0; i < blades; i++) {
    const b = makeBlade(0.06, 0.24 + rnd() * 0.16, 0.1 + rnd() * 0.12);
    b.rotateY(rnd() * Math.PI * 2);
    b.translate((rnd() - 0.5) * 0.1, 0, (rnd() - 0.5) * 0.1);
    parts.push(b);
  }
  const tuft = mergeGeometries(parts, false);
  bakeGradient(tuft, "#2f7a44", "#67cf78", 0);
  return tuft;
}

// ================= DISPERSIÓN =================
interface Instance {
  x: number;
  z: number;
  y: number;
  rotY: number;
  tiltX: number;
  tiltZ: number;
  scale: number;
}
interface ScatterCfg {
  minH: number;
  maxH: number;
  patch?: "in" | "out" | "any"; // matas (árboles) / claros (césped) / donde sea
  road?: number; // umbral de roadMask que despeja (def 0.08)
  sink?: number; // cuánto hundir la base (def 0.12)
  tiltAmp?: number; // inclinación aleatoria (def 0.03 — erguido)
  scaleMin?: number;
  scaleMax?: number;
}
function scatter(
  geo: ChocoGeo,
  count: number,
  seedBase: number,
  cfg: ScatterCfg
): Instance[] {
  const {
    minH,
    maxH,
    patch = "in",
    road = 0.08,
    sink = 0.12,
    tiltAmp = 0.03,
    scaleMin = 0.85,
    scaleMax = 1.5,
  } = cfg;
  const out: Instance[] = [];
  let tries = 0;
  const maxTries = count * 90;
  while (out.length < count && tries < maxTries) {
    const s = seedBase + tries * 7;
    tries++;
    const x = (seeded(s) - 0.5) * WIDTH;
    const y = (seeded(s + 1) - 0.5) * HEIGHT; // local N-S
    const { lon, lat } = localToLonLat(geo, x, y);
    if (!geo.isInside(lon, lat)) continue;
    const h = worldGround(x, -y); // world Z = -y
    if (h < minH || h > maxH) continue;
    const pn = patchNoise(x, y);
    if (patch === "in" && pn < 0.55) continue; // matas
    if (patch === "out" && pn > 0.5) continue; // claros
    if (roadMask(x, y) > road) continue;
    if (Math.hypot(x - SPAWN_POS.x, y + SPAWN_POS.z) < 5) continue;
    if (Math.hypot(x - (MALECON_FRONT_X - 1.5), y + MALECON_Z) < 6.5) continue;
    out.push({
      x,
      z: -y,
      y: h - sink,
      rotY: seeded(s + 2) * Math.PI * 2,
      tiltX: (seeded(s + 3) - 0.5) * tiltAmp,
      tiltZ: (seeded(s + 4) - 0.5) * tiltAmp,
      scale: scaleMin + seeded(s + 5) * (scaleMax - scaleMin),
    });
  }
  return out;
}

// Hook: espera el heightfield (para no flotar) y luego dispersa
function useFlora(
  count: number,
  seedBase: number,
  cfg: ScatterCfg
): Instance[] | null {
  const [instances, setInstances] = useState<Instance[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    whenHeightFieldReady()
      .then(() => loadChocoGeo())
      .then((geo) => {
        if (!cancelled) setInstances(scatter(geo, count, seedBase, cfg));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, seedBase]);
  return instances;
}

// Una parte instanciada (tronco, copa, hoja…) con las mismas transformaciones
function InstancedPart({
  geo,
  instances,
  yOff = 0,
  tiltMul = 1,
  castShadow = false,
  receiveShadow = false,
  children,
}: {
  geo: THREE.BufferGeometry;
  instances: Instance[];
  yOff?: number;
  tiltMul?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const im = ref.current;
    if (!im) return;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      pos.set(inst.x, inst.y + yOff, inst.z);
      euler.set(inst.tiltX * tiltMul, inst.rotY, inst.tiltZ * tiltMul);
      quat.setFromEuler(euler);
      scl.setScalar(inst.scale);
      m.compose(pos, quat, scl);
      im.setMatrixAt(i, m);
    }
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
  }, [instances, yOff, tiltMul]);
  return (
    <instancedMesh
      ref={ref}
      args={[geo, undefined, instances.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    >
      {children}
    </instancedMesh>
  );
}

const trunkRef = (m: THREE.Material | null) => {
  if (m) applyReveal(m);
};

// ---------- especies ----------
function TreeField({
  count,
  seedBase,
  geoCfg,
  trunkColor,
  minH,
  maxH,
  swayAmp = 0.06,
  scaleMin,
  scaleMax,
}: {
  count: number;
  seedBase: number;
  geoCfg: Parameters<typeof makeTreeGeo>[0];
  trunkColor: string;
  minH: number;
  maxH: number;
  swayAmp?: number;
  scaleMin?: number;
  scaleMax?: number;
}) {
  const { wood, leaf } = useMemo(() => makeTreeGeo(geoCfg), [geoCfg]);
  useEffect(
    () => () => {
      wood.dispose();
      leaf.dispose();
    },
    [wood, leaf]
  );
  const instances = useFlora(count, seedBase, {
    minH,
    maxH,
    patch: "in",
    tiltAmp: 0.03,
    sink: 0.14,
    scaleMin,
    scaleMax,
  });
  if (!instances || instances.length === 0) return null;
  return (
    <group>
      <InstancedPart geo={wood} instances={instances} castShadow receiveShadow>
        <meshStandardMaterial
          color={trunkColor}
          flatShading
          roughness={0.9}
          ref={trunkRef}
        />
      </InstancedPart>
      <InstancedPart geo={leaf} instances={instances} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.72}
          ref={(m) => {
            if (m) applyReveal(m, { sway: true, swayAmp });
          }}
        />
      </InstancedPart>
    </group>
  );
}

function PalmField({ count, seedBase }: { count: number; seedBase: number }) {
  const { wood, leaf } = useMemo(makePalmGeo, []);
  useEffect(
    () => () => {
      wood.dispose();
      leaf.dispose();
    },
    [wood, leaf]
  );
  const instances = useFlora(count, seedBase, {
    minH: 0.1,
    maxH: 0.44,
    patch: "any",
    sink: 0.06,
    tiltAmp: 0.05,
    scaleMin: 0.85,
    scaleMax: 1.35,
  });
  if (!instances || instances.length === 0) return null;
  return (
    <group>
      <InstancedPart geo={wood} instances={instances} castShadow>
        <meshStandardMaterial
          color="#7a5a38"
          flatShading
          roughness={0.95}
          ref={trunkRef}
        />
      </InstancedPart>
      {/* frondas: NO castShadow (planos → manchas duras) pero sí se mecen fuerte */}
      <InstancedPart geo={leaf} instances={instances}>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.78}
          side={THREE.DoubleSide}
          ref={(m) => {
            if (m) applyReveal(m, { sway: true, swayAmp: 0.09 });
          }}
        />
      </InstancedPart>
    </group>
  );
}

function HeliconiaField({ count, seedBase }: { count: number; seedBase: number }) {
  const { wood, leaf } = useMemo(makeHeliconiaGeo, []);
  useEffect(
    () => () => {
      wood.dispose();
      leaf.dispose();
    },
    [wood, leaf]
  );
  const instances = useFlora(count, seedBase, {
    minH: 0.16,
    maxH: 0.55,
    patch: "any",
    road: 0.25,
    sink: 0.05,
    tiltAmp: 0.06,
    scaleMin: 0.8,
    scaleMax: 1.4,
  });
  if (!instances || instances.length === 0) return null;
  return (
    <group>
      <InstancedPart geo={wood} instances={instances} castShadow>
        <meshStandardMaterial
          color="#3f7a3a"
          flatShading
          roughness={0.9}
          ref={trunkRef}
        />
      </InstancedPart>
      <InstancedPart geo={leaf} instances={instances} castShadow>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.7}
          side={THREE.DoubleSide}
          ref={(m) => {
            if (m) applyReveal(m, { sway: true, swayAmp: 0.11 });
          }}
        />
      </InstancedPart>
    </group>
  );
}

function GrassField({ count, seedBase }: { count: number; seedBase: number }) {
  const geo = useMemo(() => makeGrassTuft(seedBase * 3 + 1), [seedBase]);
  useEffect(() => () => geo.dispose(), [geo]);
  // El césped llena los CLAROS (patch:"out"), donde no hay árboles → composición
  const instances = useFlora(count, seedBase, {
    minH: 0.3,
    maxH: 1.4,
    patch: "out",
    road: 0.55,
    sink: 0.03,
    tiltAmp: 0.05,
    scaleMin: 0.7,
    scaleMax: 1.5,
  });
  if (!instances || instances.length === 0) return null;
  return (
    <InstancedPart geo={geo} instances={instances} receiveShadow>
      <meshStandardMaterial
        vertexColors
        flatShading
        roughness={0.85}
        side={THREE.DoubleSide}
        ref={(m) => {
          if (m) applyReveal(m, { sway: true, swayAmp: 0.22 });
        }}
      />
    </InstancedPart>
  );
}

function Rocks({ count, seedBase }: { count: number; seedBase: number }) {
  const geo = useMemo(() => new THREE.DodecahedronGeometry(0.32, 0), []);
  useEffect(() => () => geo.dispose(), [geo]);
  const instances = useFlora(count, seedBase, {
    minH: 1.9,
    maxH: 5.4,
    patch: "any",
    sink: 0.1,
    tiltAmp: 0.6,
    scaleMin: 0.5,
    scaleMax: 1.6,
  });
  if (!instances || instances.length === 0) return null;
  return (
    <InstancedPart geo={geo} instances={instances} castShadow receiveShadow>
      <meshStandardMaterial
        color="#7d8577"
        flatShading
        roughness={0.95}
        ref={trunkRef}
      />
    </InstancedPart>
  );
}

function BeachedCanoes({ count, seedBase }: { count: number; seedBase: number }) {
  const geo = useMemo(makeCanoeGeometry, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const instances = useFlora(count, seedBase, {
    minH: 0.12,
    maxH: 0.3,
    patch: "any",
    sink: -0.28, // el casco reposa un poco elevado sobre la orilla
    tiltAmp: 0.18,
    scaleMin: 0.7,
    scaleMax: 1.0,
  });
  if (!instances || instances.length === 0) return null;
  return (
    <InstancedPart geo={geo} instances={instances} castShadow receiveShadow>
      <meshStandardMaterial
        color="#6e4519"
        flatShading
        roughness={0.9}
        ref={trunkRef}
      />
    </InstancedPart>
  );
}

// CALIDAD sobre cantidad (folio-2025): matas por patchNoise con claros, césped
// llenando el espacio negativo, y la carretera despejada.
export default function Vegetation() {
  return (
    <>
      {/* Dosel alto — selva baja del valle */}
      <TreeField
        count={200}
        seedBase={101}
        trunkColor="#4a3524"
        minH={0.42}
        maxH={2.3}
        geoCfg={{
          height: 2.4,
          trunkR: 0.13,
          crownR: 0.95,
          colBot: "#14612f",
          colTop: "#34a457",
          seed: 11,
          layers: 3,
        }}
        scaleMin={0.85}
        scaleMax={1.55}
      />
      {/* Dosel medio — otra silueta, verde más vivo */}
      <TreeField
        count={150}
        seedBase={877}
        trunkColor="#4a3524"
        minH={0.42}
        maxH={2.3}
        geoCfg={{
          height: 1.8,
          trunkR: 0.1,
          crownR: 0.8,
          colBot: "#1a6b39",
          colTop: "#48b86a",
          seed: 29,
          layers: 2,
        }}
        scaleMin={0.8}
        scaleMax={1.4}
      />
      {/* Arbustos — pegados al piso, llenan bajo el dosel */}
      <TreeField
        count={140}
        seedBase={3301}
        trunkColor="#3a2d1e"
        minH={0.42}
        maxH={2.3}
        swayAmp={0.1}
        geoCfg={{
          height: 0.7,
          trunkR: 0.06,
          crownR: 0.42,
          colBot: "#1f7040",
          colTop: "#59c079",
          seed: 47,
          layers: 2,
        }}
        scaleMin={0.7}
        scaleMax={1.3}
      />
      {/* Bosque de niebla de la Serranía del Baudó — bajo, verde-bruma */}
      <TreeField
        count={120}
        seedBase={5507}
        trunkColor="#3a3226"
        minH={2.2}
        maxH={4.6}
        geoCfg={{
          height: 1.25,
          trunkR: 0.09,
          crownR: 0.62,
          colBot: "#2f5a46",
          colTop: "#567f66",
          seed: 83,
          layers: 2,
        }}
        scaleMin={0.75}
        scaleMax={1.35}
      />
      <PalmField count={110} seedBase={9091} />
      <HeliconiaField count={90} seedBase={4201} />
      <GrassField count={520} seedBase={6301} />
      <Rocks count={90} seedBase={7717} />
      <BeachedCanoes count={10} seedBase={12007} />
    </>
  );
}
