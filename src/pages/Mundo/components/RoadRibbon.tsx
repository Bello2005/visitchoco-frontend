import { useEffect, useState } from "react";
import * as THREE from "three";
import { loadChocoGeo, HEIGHT } from "../utils/geo";
import { roadCenterWorldX, worldGround } from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";

// La calzada como GEOMETRÍA PROPIA (el secreto de la road de folio-2025:
// Scenery.js usa un mesh dedicado con asfalto oscuro + glitter, no pintura
// sobre el terreno). Una cinta extruida a lo largo del espinazo, drapeada
// sobre el terreno ya aplanado. ASFALTO NEGRO tipo carretera pavimentada /
// pista, con líneas de carril pintadas (borde continuo + eje discontinuo).
// Bordes nítidos garantizados a cualquier resolución de malla.
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

const ASPHALT = "#232228"; // asfalto negro-carbón (tipo pavimento/pista)
const MARK = new THREE.Color("#e9dfc6"); // pintura crema cálida (VisitChocó)

interface RoadGeos {
  asphalt: THREE.BufferGeometry;
  marks: THREE.BufferGeometry;
}

function buildRoad(): RoadGeos {
  const up = new THREE.Vector3(0, 1, 0);
  // Espinazo drapeado: y = MAX del suelo bajo centro y ambos filos → la cinta
  // queda plana a lo ancho y SIEMPRE por encima del terreno (sin asomos de
  // pasto verde en los bordes donde el aplanado gaussiano decae).
  const pts: THREE.Vector3[] = [];
  const sides: THREE.Vector3[] = [];
  const zs: number[] = [];
  for (let z = HEIGHT / 2 - 2; z >= -HEIGHT / 2 + 2; z -= STEP) {
    const x = roadCenterWorldX(z);
    zs.push(z);
    pts.push(new THREE.Vector3(x, 0, z)); // y se fija tras conocer los lados
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
  const widths: number[] = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const s = sides[i];
    const gC = worldGround(p.x, zs[i]);
    const gL = worldGround(p.x - s.x * HALF_W, zs[i] - s.z * HALF_W);
    const gR = worldGround(p.x + s.x * HALF_W, zs[i] + s.z * HALF_W);
    p.y = Math.max(gC, gL, gR) + LIFT;
    const tip = Math.min(i, n - 1 - i);
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
  // añade el segmento i-1→i de una banda a offset lateral `off`, semiancho `hw`
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
    // líneas de borde continuas a ambos lados
    band(i, HALF_W - EDGE_INSET, EDGE_HW);
    band(i, -(HALF_W - EDGE_INSET), EDGE_HW);
    // eje discontinuo
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

  return { asphalt, marks };
}

export default function RoadRibbon() {
  const [geos, setGeos] = useState<RoadGeos | null>(null);

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

  if (!geos) return null;

  return (
    <group>
      {/* asfalto negro-carbón con textura de árido (moteado) + glitter vivo */}
      <mesh geometry={geos.asphalt} receiveShadow>
        <meshStandardMaterial
          color={ASPHALT}
          roughness={0.82}
          metalness={0.0}
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
    </group>
  );
}
