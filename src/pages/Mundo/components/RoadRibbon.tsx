import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { loadChocoGeo } from "../utils/geo";
import {
  roadCenterWorldX,
  worldGround,
  WATER_LEVEL,
  GATEWAY_Z,
  NORTH_Z,
} from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";

// La calzada como GEOMETRÍA PROPIA (el secreto de la road de folio-2025:
// Scenery.js usa un mesh dedicado con asfalto oscuro + glitter, no pintura
// sobre el terreno). Una cinta extruida a lo largo del espinazo. ASFALTO NEGRO
// tipo carretera pavimentada, con líneas de carril crema (borde continuo + eje
// discontinuo). Donde la vía cruza AGUA se convierte en PUENTE: el deck se
// eleva sobre el canal (que el terreno deja abierto) con física propia para el
// carro, pilotes de apoyo y hueco por debajo para que la PANGA navegue.
const STEP = 0.6; // muestreo del espinazo (curvas suaves)
const HALF_W = 1.15; // media calzada (~2.3u de ancho)
const LIFT = 0.05; // drapeado sobre el terreno (sin z-fighting)
const MARK_LIFT = 0.02; // las líneas pintadas van sobre el asfalto

// Líneas de carril (pintura sobre el asfalto negro)
const EDGE_INSET = 0.16; // qué tan adentro del filo va la línea de borde
const EDGE_HW = 0.055; // media-anchura de la línea de borde
const CENTER_HW = 0.05; // media-anchura del eje
const DASH_LEN = 1.4; // largo del trazo del eje
const DASH_GAP = 1.4; // hueco entre trazos

// Puente sobre el agua
const BRIDGE_CLEAR = 1.15; // cota del deck sobre el nivel del agua (holgura panga)
const DECK_HT = 0.12; // semigrosor del collider del deck
const BRIDGE_THRESH = 0.12; // deck sobre suelo para contar como puente (emite física)
const BLUR_PASSES = 8; // suavizado del perfil → rampas de acceso al puente

// PUENTE DE GUADUA (el bambú del Chocó): toda la estructura son cañas. Cada
// caña es una instancia de un cilindro UNITARIO (r=1,h=1) escalada por su
// matriz → un solo draw call para todo el puente.
// El puente es MÁS ANCHO que la carretera: el carro se ve holgado y bonito
// cruzando, y el tablero de tablones tapa el asfalto que pasa por debajo.
const BRIDGE_HALF_W = 1.8;
const BRIDGE_LIFT = 0.09; // el tablero va sobre el asfalto (lo oculta)
const MOUTH_FADE = 4; // muestras de embudo en cada boca del puente
const PORTAL_EVERY = 7; // cada cuántas muestras un pórtico de guadua
const PORTAL_H = 2.45; // alto libre del pórtico (el carro pasa por debajo)
const PLANK_A = new THREE.Color("#9c7a44"); // tablón de madera
const PLANK_B = new THREE.Color("#8a6a3a"); // tablón alterno (veta)
const PILING_EVERY = 5; // cada cuántas muestras una cepa de pilotes
const PILING_R = 0.1; // radio de la caña del pilote
const PILING_SPREAD = 0.19; // separación de las 2 cañas de cada cepa
const POST_EVERY = 3; // cada cuántas muestras un balaustre de baranda
const POST_R = 0.055;
const RAIL_R = 0.05;
const RAIL_TOP = 0.86; // pasamanos sobre el deck
const RAIL_MID = 0.42; // travesaño intermedio
const RAIL_OUT = 0.09; // baranda por FUERA de la calzada (no le roba ancho)
const BEAM_R = 0.075; // viga de borde longitudinal

const ASPHALT = "#232228"; // asfalto negro-carbón (tipo pavimento/pista)
const MARK = new THREE.Color("#e9dfc6"); // pintura crema cálida (VisitChocó)
const GUADUA = "#c0a55d"; // guadua seca (bambú cálido)

interface Plank {
  x: number;
  y: number;
  z: number;
  yaw: number;
  hl: number;
  hw: number;
}
interface RoadGeos {
  asphalt: THREE.BufferGeometry;
  marks: THREE.BufferGeometry;
  /** Tablero de madera del puente (más ancho que el asfalto, y encima) */
  bridgeDeck: THREE.BufferGeometry;
  planks: Plank[];
  /** Una matriz por CAÑA de guadua (cilindro unitario escalado y orientado) */
  guadua: THREE.Matrix4[];
}

// Tiende una caña entre dos puntos: la orienta y la escala a su largo. Sirve
// igual para pilotes verticales, pasamanos, crucetas y vigas.
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scl = new THREE.Vector3();
const _UP = new THREE.Vector3(0, 1, 0);
function cane(
  a: THREE.Vector3,
  b: THREE.Vector3,
  r: number,
  out: THREE.Matrix4[]
): void {
  _dir.subVectors(b, a);
  const len = _dir.length();
  if (len < 1e-4) return;
  _mid.addVectors(a, b).multiplyScalar(0.5);
  _quat.setFromUnitVectors(_UP, _dir.divideScalar(len));
  _scl.set(r, len, r);
  out.push(new THREE.Matrix4().compose(_mid, _quat, _scl));
}

function buildRoad(): RoadGeos {
  const up = new THREE.Vector3(0, 1, 0);
  const pts: THREE.Vector3[] = [];
  const sides: THREE.Vector3[] = [];
  const zs: number[] = [];
  // El extremo SUR nace en el PORTAL (plaza VisitChocó) — la vía ya no se
  // afila en un pico feo sobre la punta; la plaza tapa su extremo romo.
  for (let z = GATEWAY_Z + 0.5; z >= NORTH_Z - 0.5; z -= STEP) {
    const x = roadCenterWorldX(z);
    zs.push(z);
    pts.push(new THREE.Vector3(x, 0, z)); // y se fija tras calcular el perfil
  }
  const n = pts.length;
  const tangent = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    tangent.subVectors(next, prev);
    tangent.y = 0;
    tangent.normalize();
    sides.push(new THREE.Vector3().crossVectors(up, tangent).normalize());
  }

  // ---- perfil de altura del deck: drapea en tierra, se eleva sobre el agua --
  const groundC: number[] = [];
  const overWater: boolean[] = [];
  for (let i = 0; i < n; i++) {
    const g = worldGround(pts[i].x, zs[i]);
    groundC.push(g);
    overWater.push(g < WATER_LEVEL + 0.12);
  }
  const BRIDGE_Y = WATER_LEVEL + BRIDGE_CLEAR;
  let deck: number[] = groundC.map((g, i) =>
    overWater[i] ? Math.max(g + LIFT, BRIDGE_Y) : g + LIFT
  );
  // Suavizado: convierte los escalones puente↔tierra en rampas de acceso y
  // redondea la corona en un arco de puente natural.
  for (let p = 0; p < BLUR_PASSES; p++) {
    const nd = deck.slice();
    for (let i = 1; i < n - 1; i++) {
      nd[i] = deck[i - 1] * 0.25 + deck[i] * 0.5 + deck[i + 1] * 0.25;
    }
    deck = nd;
  }
  const widths: number[] = [];
  for (let i = 0; i < n; i++) {
    pts[i].y = deck[i];
    // Ancho constante: la vía ya no se afila en ningún extremo — nace y muere
    // ROMA dentro de las plazas (portal al sur, marimba al norte), que tapan
    // sus puntas. Los picos feos se acabaron.
    widths.push(1);
  }

  // ---- calzada: cinta indexada L-R por muestra (superficie plana) ----
  const aPos: number[] = [];
  const aIdx: number[] = [];
  for (let i = 0; i < n; i++) {
    const w = HALF_W * widths[i];
    const p = pts[i];
    const s = sides[i];
    aPos.push(p.x - s.x * w, p.y, p.z - s.z * w);
    aPos.push(p.x + s.x * w, p.y, p.z + s.z * w);
    if (i > 0) {
      const a = (i - 1) * 2;
      // winding CCW visto desde arriba → normales +Y (la cinta se construye en
      // espacio de MUNDO, sin rotación del mesh; con el orden inverso la cara
      // superior quedaba back-facing y el FrontSide la descartaba → invisible)
      aIdx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const asphalt = new THREE.BufferGeometry();
  asphalt.setAttribute("position", new THREE.Float32BufferAttribute(aPos, 3));
  asphalt.setIndex(aIdx);
  asphalt.computeVertexNormals();

  // ---- líneas de carril: quads planos crema sobre el asfalto ----
  const mPos: number[] = [];
  const arc: number[] = [0];
  for (let i = 1; i < n; i++) arc.push(arc[i - 1] + pts[i].distanceTo(pts[i - 1]));

  const tmp = new THREE.Vector3();
  const band = (i: number, off: number, hw: number) => {
    const corners: THREE.Vector3[] = [];
    for (const j of [i - 1, i]) {
      for (const d of [off - hw, off + hw]) {
        tmp.copy(pts[j]).addScaledVector(sides[j], d);
        corners.push(tmp.clone());
      }
    }
    // corners = [aIn,aOut,bIn,bOut] → 2 triángulos, winding CCW (normal +Y)
    const [a0, a1, b0, b1] = corners;
    for (const v of [a0, b0, a1, a1, b0, b1]) {
      mPos.push(v.x, v.y + MARK_LIFT, v.z);
    }
  };
  const DASH_PERIOD = DASH_LEN + DASH_GAP;
  for (let i = 1; i < n; i++) {
    if (widths[i] < 1 || widths[i - 1] < 1) continue; // sin pintura en puntas
    band(i, HALF_W - EDGE_INSET, EDGE_HW);
    band(i, -(HALF_W - EDGE_INSET), EDGE_HW);
    const midArc = (arc[i] + arc[i - 1]) * 0.5;
    if (midArc % DASH_PERIOD < DASH_LEN) band(i, 0, CENTER_HW);
  }
  const marks = new THREE.BufferGeometry();
  marks.setAttribute("position", new THREE.Float32BufferAttribute(mPos, 3));
  const mCol = new Float32Array((mPos.length / 3) * 3);
  for (let k = 0; k < mPos.length / 3; k++) {
    mCol[k * 3] = MARK.r;
    mCol[k * 3 + 1] = MARK.g;
    mCol[k * 3 + 2] = MARK.b;
  }
  marks.setAttribute("color", new THREE.BufferAttribute(mCol, 3));
  marks.computeVertexNormals();

  // ---- PUENTE DE GUADUA: tablero de tablones + estructura + colliders ----
  const planks: Plank[] = [];
  const guadua: THREE.Matrix4[] = [];
  const isBridge: boolean[] = new Array(n).fill(false);
  // El tablero del puente: superficie propia (madera), MÁS ANCHA que el
  // asfalto y por encima de él → en el puente la vía "cambia de material".
  const dPos: number[] = [];
  const dCol: number[] = [];

  // Pasada 1: ¿qué segmentos son puente?
  for (let i = 1; i < n; i++) {
    const midDeck = (deck[i] + deck[i - 1]) * 0.5;
    const midGround = (groundC[i] + groundC[i - 1]) * 0.5;
    if (midDeck - midGround >= BRIDGE_THRESH) isBridge[i] = true;
  }

  // Pasada 2: BOCA EMBUDO. En los extremos de cada tramo el tablero nace AL
  // RAS y AL ANCHO de la carretera, y solo hacia adentro sube y se ensancha.
  // Sin esto la boca era un labio vertical + paredes laterales sobresaliendo:
  // si no entrabas perfectamente alineado, chocabas en vez de colarte.
  const mouth: number[] = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    if (!isBridge[i]) continue;
    let a = i;
    while (a > 1 && isBridge[a - 1]) a--;
    let b = i;
    while (b < n - 1 && isBridge[b + 1]) b++;
    mouth[i] = Math.min(1, Math.min(i - a, b - i) / MOUTH_FADE);
  }
  const liftAt = (j: number) => BRIDGE_LIFT * mouth[j];
  const hwAt = (j: number) => HALF_W + (BRIDGE_HALF_W - HALF_W) * mouth[j];

  // Pasada 3: tablero de tablones + colliders
  for (let i = 1; i < n; i++) {
    if (!isBridge[i]) continue;
    const midDeck = (deck[i] + deck[i - 1]) * 0.5;
    const dx = pts[i].x - pts[i - 1].x;
    const dz = pts[i].z - pts[i - 1].z;
    const segLen = Math.hypot(dx, dz);
    planks.push({
      x: (pts[i].x + pts[i - 1].x) * 0.5,
      y: midDeck + (liftAt(i) + liftAt(i - 1)) * 0.5 - DECK_HT,
      z: (pts[i].z + pts[i - 1].z) * 0.5,
      yaw: Math.atan2(dx, dz),
      hl: segLen * 0.5 + 0.06, // solape leve entre planchas
      hw: (hwAt(i) + hwAt(i - 1)) * 0.5,
    });

    // Tablón transversal: un quad por segmento, alternando veta (winding CCW)
    const c = i % 2 === 0 ? PLANK_A : PLANK_B;
    const corner = (j: number, dir: number) =>
      new THREE.Vector3(
        pts[j].x + sides[j].x * dir * hwAt(j),
        deck[j] + liftAt(j),
        pts[j].z + sides[j].z * dir * hwAt(j)
      );
    const L0 = corner(i - 1, -1);
    const R0 = corner(i - 1, 1);
    const L1 = corner(i, -1);
    const R1 = corner(i, 1);
    for (const v of [L0, L1, R0, R0, L1, R1]) dPos.push(v.x, v.y, v.z);
    for (let k = 0; k < 6; k++) dCol.push(c.r, c.g, c.b);
  }

  const bridgeDeck = new THREE.BufferGeometry();
  bridgeDeck.setAttribute("position", new THREE.Float32BufferAttribute(dPos, 3));
  bridgeDeck.setAttribute("color", new THREE.Float32BufferAttribute(dCol, 3));
  bridgeDeck.computeVertexNormals();

  // Punto del borde del TABLERO (dir=-1 izq, +1 der) a una altura dada
  const edge = (i: number, dir: number, out: number, dy: number) =>
    new THREE.Vector3(
      pts[i].x + sides[i].x * dir * (hwAt(i) + out),
      deck[i] + liftAt(i) + dy,
      pts[i].z + sides[i].z * dir * (hwAt(i) + out)
    );

  for (let i = 1; i < n; i++) {
    if (!isBridge[i]) continue;
    const prevOnBridge = isBridge[i - 1];

    for (const dir of [-1, 1]) {
      // Viga de borde longitudinal + pasamanos y travesaño (solo si hay tramo
      // previo, así cada vano se tiende entre muestras contiguas del puente)
      if (prevOnBridge) {
        cane(edge(i - 1, dir, RAIL_OUT, -DECK_HT), edge(i, dir, RAIL_OUT, -DECK_HT), BEAM_R, guadua);
        cane(edge(i - 1, dir, RAIL_OUT, RAIL_TOP), edge(i, dir, RAIL_OUT, RAIL_TOP), RAIL_R, guadua);
        cane(edge(i - 1, dir, RAIL_OUT, RAIL_MID), edge(i, dir, RAIL_OUT, RAIL_MID), RAIL_R, guadua);
        // LARGUEROS bajo el tablero (se ven de costado y desde la panga)
        cane(edge(i - 1, dir, -0.35, -0.22), edge(i, dir, -0.35, -0.22), BEAM_R, guadua);
      }
      // Balaustre vertical de la baranda
      if (i % POST_EVERY === 0) {
        cane(edge(i, dir, RAIL_OUT, -DECK_HT), edge(i, dir, RAIL_OUT, RAIL_TOP), POST_R, guadua);
      }
    }

    // PÓRTICO de guadua: dos parales y un dintel por el que PASA el carro.
    // Es la firma visual del puente — enmarca al vehículo al cruzar.
    // (nunca en la boca: un pórtico ahí sería justo el obstáculo que estorba
    //  al entrar; solo dentro del puente, donde ya vas encarrilado)
    if (i % PORTAL_EVERY === 0 && mouth[i] > 0.95) {
      const lBase = edge(i, -1, RAIL_OUT, -DECK_HT);
      const rBase = edge(i, 1, RAIL_OUT, -DECK_HT);
      const lTop = edge(i, -1, RAIL_OUT, PORTAL_H);
      const rTop = edge(i, 1, RAIL_OUT, PORTAL_H);
      cane(lBase, lTop, POST_R * 1.6, guadua); // paral izq
      cane(rBase, rTop, POST_R * 1.6, guadua); // paral der
      cane(lTop, rTop, BEAM_R, guadua); // dintel
      // cartelas diagonales que rigidizan las esquinas
      const lKnee = edge(i, -1, RAIL_OUT, PORTAL_H - 0.65);
      const rKnee = edge(i, 1, RAIL_OUT, PORTAL_H - 0.65);
      const lIn = lTop.clone().lerp(rTop, 0.28);
      const rIn = rTop.clone().lerp(lTop, 0.28);
      cane(lKnee, lIn, RAIL_R, guadua);
      cane(rKnee, rIn, RAIL_R, guadua);
    }

    // CEPA de pilotes: dos cañas por costado clavadas en el lecho, viga
    // transversal bajo el deck y crucetas en X (el truss de guadua).
    if (i % PILING_EVERY === 0 && groundC[i] < WATER_LEVEL - 0.1) {
      const bed = groundC[i] - 0.35;
      const legs: THREE.Vector3[] = [];
      for (const dir of [-1, 1]) {
        const top = edge(i, dir, -0.3, -DECK_HT);
        legs.push(top.clone());
        // dos cañas ligeramente separadas a lo largo de la vía = cepa
        for (const s of [-1, 1]) {
          const t = top.clone().addScaledVector(
            new THREE.Vector3(sides[i].z, 0, -sides[i].x), // tangente
            s * PILING_SPREAD
          );
          const foot = new THREE.Vector3(t.x, bed, t.z);
          cane(foot, t, PILING_R, guadua);
        }
      }
      // travesaño bajo el deck que amarra ambas cepas
      cane(legs[0], legs[1], BEAM_R, guadua);
      // crucetas en X entre las cepas
      const lFoot = new THREE.Vector3(legs[0].x, bed, legs[0].z);
      const rFoot = new THREE.Vector3(legs[1].x, bed, legs[1].z);
      cane(lFoot, legs[1], RAIL_R, guadua);
      cane(rFoot, legs[0], RAIL_R, guadua);
    }
  }

  return { asphalt, marks, bridgeDeck, planks, guadua };
}

export default function RoadRibbon() {
  const [geos, setGeos] = useState<RoadGeos | null>(null);
  const guaduaRef = useRef<THREE.InstancedMesh>(null);
  // Cilindro UNITARIO (r=1, h=1): cada caña es este mismo tubo escalado por su
  // matriz de instancia → todo el puente en un solo draw call.
  const caneGeo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 6), []);
  const guaduaMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: GUADUA,
      roughness: 0.85,
      flatShading: true,
    });
    applyReveal(m);
    return m;
  }, []);

  useEffect(() => {
    let cancelled = false;
    // worldGround necesita el polígono cargado para la verdad de suelo
    loadChocoGeo().then(() => {
      if (!cancelled) setGeos(buildRoad());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      geos?.asphalt.dispose();
      geos?.marks.dispose();
      geos?.bridgeDeck.dispose();
    };
  }, [geos]);

  useEffect(() => {
    return () => {
      guaduaMat.dispose();
      caneGeo.dispose();
    };
  }, [guaduaMat, caneGeo]);

  // Vuelca las matrices de las cañas en el InstancedMesh
  useEffect(() => {
    const im = guaduaRef.current;
    if (!im || !geos) return;
    geos.guadua.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
  }, [geos]);

  if (!geos) return null;

  return (
    <group>
      {/* asfalto negro-carbón con textura de árido (moteado) + glitter vivo.
          DoubleSide para que el deck del puente tenga cara inferior visible
          desde la panga que pasa por debajo. */}
      <mesh geometry={geos.asphalt} receiveShadow>
        <meshStandardMaterial
          color={ASPHALT}
          roughness={0.82}
          metalness={0.0}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
          ref={(m) => {
            if (m) applyReveal(m, { groundDetail: true, glitter: true });
          }}
        />
      </mesh>
      {/* líneas de carril crema (borde + eje) — sin sombra para que resalten */}
      <mesh geometry={geos.marks}>
        <meshStandardMaterial
          vertexColors
          roughness={0.6}
          polygonOffset
          polygonOffsetFactor={-4}
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </mesh>
      {/* TABLERO DEL PUENTE: tablones de madera, más ancho que el asfalto y
          por encima → en el puente la vía cambia de material, como pediste. */}
      <mesh geometry={geos.bridgeDeck} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.9}
          side={THREE.DoubleSide}
          ref={(m) => {
            if (m) applyReveal(m, { groundDetail: true });
          }}
        />
      </mesh>
      {/* PUENTE DE GUADUA: pilotes en cepa, pórticos por los que pasa el
          carro, barandas con pasamanos y balaustres, largueros y crucetas en
          X. Todo visual (sin collider) — así la panga pasa limpio entre los
          pilotes y el carro nunca se engancha en una baranda. */}
      <instancedMesh
        ref={guaduaRef}
        args={[caneGeo, guaduaMat, geos.guadua.length]}
        castShadow
        receiveShadow
      />
      {/* Física del deck del puente: el carro cruza por encima del canal
          abierto. Cuboides orientados al rumbo, siguiendo el arco del deck. */}
      <RigidBody type="fixed" colliders={false}>
        {geos.planks.map((p, i) => (
          <CuboidCollider
            key={i}
            args={[p.hw, DECK_HT, p.hl]}
            position={[p.x, p.y, p.z]}
            rotation={[0, p.yaw, 0]}
          />
        ))}
      </RigidBody>
    </group>
  );
}
