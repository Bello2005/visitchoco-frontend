import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { loadChocoGeo, HEIGHT } from "../utils/geo";
import {
  roadCenterWorldX,
  worldGround,
  WATER_LEVEL,
  GATEWAY_Z,
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
const TAPER = 7; // muestras de afilado en las puntas

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
const PILLAR_EVERY = 5; // cada cuántas muestras un par de pilotes
const PILLAR_HW = 0.14; // semiancho del pilote

const ASPHALT = "#232228"; // asfalto negro-carbón (tipo pavimento/pista)
const MARK = new THREE.Color("#e9dfc6"); // pintura crema cálida (VisitChocó)
const PILLAR_COLOR = "#2b2830"; // hormigón oscuro del pilote

interface Plank {
  x: number;
  y: number;
  z: number;
  yaw: number;
  hl: number;
}
interface Pillar {
  x: number;
  y: number;
  z: number;
  h: number;
}
interface RoadGeos {
  asphalt: THREE.BufferGeometry;
  marks: THREE.BufferGeometry;
  planks: Plank[];
  pillars: Pillar[];
}

function buildRoad(): RoadGeos {
  const up = new THREE.Vector3(0, 1, 0);
  const pts: THREE.Vector3[] = [];
  const sides: THREE.Vector3[] = [];
  const zs: number[] = [];
  // El extremo SUR nace en el PORTAL (plaza VisitChocó) — la vía ya no se
  // afila en un pico feo sobre la punta; la plaza tapa su extremo romo.
  for (let z = GATEWAY_Z + 0.5; z >= -HEIGHT / 2 + 2; z -= STEP) {
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
    // Solo se afila el extremo NORTE (Darién); el SUR nace romo dentro de la
    // plaza del portal, que lo tapa (nada de pico feo sobre la punta sur).
    const tip = n - 1 - i;
    widths.push(tip >= TAPER ? 1 : tip / TAPER);
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

  // ---- PUENTE: colliders del deck (donde se eleva sobre el suelo) + pilotes --
  const planks: Plank[] = [];
  const pillars: Pillar[] = [];
  for (let i = 1; i < n; i++) {
    const midDeck = (deck[i] + deck[i - 1]) * 0.5;
    const midGround = (groundC[i] + groundC[i - 1]) * 0.5;
    if (midDeck - midGround < BRIDGE_THRESH) continue; // en tierra: lo lleva el terreno
    const dx = pts[i].x - pts[i - 1].x;
    const dz = pts[i].z - pts[i - 1].z;
    const segLen = Math.hypot(dx, dz);
    planks.push({
      x: (pts[i].x + pts[i - 1].x) * 0.5,
      y: midDeck - DECK_HT, // tope del collider ≈ superficie del deck
      z: (pts[i].z + pts[i - 1].z) * 0.5,
      yaw: Math.atan2(dx, dz),
      hl: segLen * 0.5 + 0.06, // solape leve entre planchas
    });
    // Pilotes en pares a los costados, solo sobre agua honda de verdad
    if (i % PILLAR_EVERY === 0 && groundC[i] < WATER_LEVEL - 0.1) {
      const top = deck[i] - DECK_HT;
      const bottom = groundC[i] - 0.3;
      const h = top - bottom;
      for (const dir of [-1, 1]) {
        pillars.push({
          x: pts[i].x + sides[i].x * dir * (HALF_W * 0.7),
          y: (top + bottom) * 0.5,
          z: pts[i].z + sides[i].z * dir * (HALF_W * 0.7),
          h,
        });
      }
    }
  }

  return { asphalt, marks, planks, pillars };
}

export default function RoadRibbon() {
  const [geos, setGeos] = useState<RoadGeos | null>(null);
  const pillarMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: PILLAR_COLOR,
      roughness: 0.95,
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
    };
  }, [geos]);

  useEffect(() => () => pillarMat.dispose(), [pillarMat]);

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
      {/* Pilotes del puente (visual; la panga pasa entre ellos por el centro) */}
      {geos.pillars.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, p.y, p.z]}
          material={pillarMat}
          castShadow
        >
          <boxGeometry args={[PILLAR_HW * 2, p.h, PILLAR_HW * 2]} />
        </mesh>
      ))}
      {/* Física del deck del puente: el carro cruza por encima del canal
          abierto. Cuboides orientados al rumbo, siguiendo el arco del deck. */}
      <RigidBody type="fixed" colliders={false}>
        {geos.planks.map((p, i) => (
          <CuboidCollider
            key={i}
            args={[HALF_W, DECK_HT, p.hl]}
            position={[p.x, p.y, p.z]}
            rotation={[0, p.yaw, 0]}
          />
        ))}
      </RigidBody>
    </group>
  );
}
