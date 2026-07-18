import { useEffect, useState } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import {
  loadChocoGeo,
  getChocoGeoSync,
  localToLonLat,
  WIDTH,
  HEIGHT,
} from "../utils/geo";
import { applyReveal } from "../utils/applyReveal";
import { triggerReveal } from "../utils/revealUniforms";

// Diorama estilizado: NO es un DEM real. El plano es alargado N-S como el Chocó.
export { WIDTH, HEIGHT };
export const WATER_LEVEL = 0.0;
// Fuera del polígono del Chocó el lecho se hunde a esta cota (mar abierto).
// La malla y la física comparten esta constante — así no hay "tierra fantasma".
export const SEA_FLOOR = -2;
// Ancho (en unidades de mundo) de la rampa de playa a cada lado de la costa.
// El terreno baja gradual de la tierra al lecho marino en vez de caer en
// acantilado — así el carro sube a tierra manejando por la arena.
const BEACH = 3.4;
const SEG_X = 96;
const SEG_Y = 144;

// ---------- value noise 2D determinista (seed fija, sin librerías) ----------
function hash2(ix: number, iy: number): number {
  let h = (ix * 374761393 + iy * 668265263 + 1013904223) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

// fbm de 3 octavas, rango aprox [0,1]
function fbm(x: number, y: number): number {
  return (
    (valueNoise(x, y) * 0.5 +
      valueNoise(x * 2.1 + 17.3, y * 2.1 + 31.7) * 0.3 +
      valueNoise(x * 4.3 + 53.1, y * 4.3 + 11.9) * 0.2)
  );
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ---------- función de altura estilizada (x: oeste→este, y: sur→norte) ----------
// En coordenadas de mundo: altura del terreno en (X, Z) = terrainHeight(X, -Z)
export function terrainHeight(x: number, y: number): number {
  const nx = x / (WIDTH / 2); // -1 oeste .. 1 este
  const ny = y / (HEIGHT / 2); // -1 sur .. 1 norte

  let h = 0;

  // Serranía del Baudó: cresta N-S cerca del borde occidental, pico ~4
  const crestX = -0.68 + (valueNoise(3.7, y * 0.12) - 0.5) * 0.16;
  const dRidge = (nx - crestX) / 0.16;
  h += Math.exp(-dRidge * dRidge) * (2.6 + 1.4 * fbm(x * 0.35, y * 0.35));

  // Estribaciones de la cordillera Occidental: sube suave hacia el este, ~2.5
  h += smoothstep(0.25, 1, nx) * (1.6 + 0.9 * fbm(x * 0.3 + 41, y * 0.3 + 7));

  // Cuenca del San Juan: relieve medio al sur
  h += smoothstep(0.3, 1, -ny) * (0.7 + 0.8 * fbm(x * 0.4 + 91, y * 0.4 + 63));

  // Ondulación base suave en todo el territorio
  h += 0.35 * fbm(x * 0.22 + 7.7, y * 0.22 + 3.3);

  // Valle del Atrato: franja central-este casi plana (~0.2) donde correrá el río
  const dValley = (nx - 0.12) / 0.24;
  const valley =
    Math.exp(-dValley * dValley) * smoothstep(-0.55, -0.15, ny);
  h = h * (1 - valley * 0.95) + 0.2 * valley;

  // Piso duro de la tierra firme — ANTES de cavar el cauce
  h = Math.max(h, 0.15);

  // Cauce del Atrato: cinta serpenteante cavada bajo WATER_LEVEL,
  // con la misma máscara N-S del valle (el río existe donde existe el valle)
  const riverX = 0.12 + (valueNoise(9.1, y * 0.1) - 0.5) * 0.1;
  // σ 0.09: con 0.045 el canal quedaba más angosto que el propio chasis
  // del carro (lo puenteaba sin caer al agua) y el banco era un acantilado
  const dRiver = (nx - riverX) / 0.09;
  const carve = Math.exp(-dRiver * dRiver) * smoothstep(-0.55, -0.15, ny);
  h = h * (1 - carve) + -0.45 * carve;

  return h;
}

// ---------- distance transform (chamfer 3-4, dos pasadas) ----------
// Distancia en celdas de cada punto de la grilla a la semilla más cercana.
// La usamos para saber a qué distancia de la costa está cada vértice y trazar
// la rampa de playa. O(grilla), sin llamadas extra a isInside.
function chamferDT(
  cols: number,
  rows: number,
  isSeed: (i: number) => boolean
): Float32Array {
  const INF = 1e9;
  const d = new Float32Array(cols * rows);
  for (let i = 0; i < d.length; i++) d[i] = isSeed(i) ? 0 : INF;
  const D1 = 1;
  const D2 = Math.SQRT2;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + D1);
      if (y > 0) v = Math.min(v, d[i - cols] + D1);
      if (x > 0 && y > 0) v = Math.min(v, d[i - cols - 1] + D2);
      if (x < cols - 1 && y > 0) v = Math.min(v, d[i - cols + 1] + D2);
      d[i] = v;
    }
  }
  for (let y = rows - 1; y >= 0; y--) {
    for (let x = cols - 1; x >= 0; x--) {
      const i = y * cols + x;
      let v = d[i];
      if (x < cols - 1) v = Math.min(v, d[i + 1] + D1);
      if (y < rows - 1) v = Math.min(v, d[i + cols] + D1);
      if (x < cols - 1 && y < rows - 1) v = Math.min(v, d[i + cols + 1] + D2);
      if (x > 0 && y < rows - 1) v = Math.min(v, d[i + cols - 1] + D2);
      d[i] = v;
    }
  }
  return d;
}

// ---------- verdad de suelo del MUNDO (compartida con la física) ----------
// La malla del terreno YA es una playa suavizada (rampa a la costa). Publicamos
// ese mismo grid de alturas y worldGround lo muestrea bilinealmente — así la
// física (colisión trimesh) y la decisión carro↔panga usan EXACTAMENTE la
// superficie que se ve, sin discontinuidades tierra/mar.
let heightField: Float32Array | null = null;
let fieldCols = 0;
let fieldRows = 0;

function publishHeightField(f: Float32Array, cols: number, rows: number): void {
  heightField = f;
  fieldCols = cols;
  fieldRows = rows;
}

// x,z = coordenadas de MUNDO (world Z = -y local por la rotación del mesh).
export function worldGround(x: number, z: number): number {
  const yLocal = -z;

  if (heightField) {
    // Mapeo world → grilla (mismo orden que PlaneGeometry: iy crece al bajar y)
    const fx = (x / WIDTH + 0.5) * (fieldCols - 1);
    const fy = (0.5 - yLocal / HEIGHT) * (fieldRows - 1);
    const x0 = Math.max(0, Math.min(fieldCols - 1, Math.floor(fx)));
    const y0 = Math.max(0, Math.min(fieldRows - 1, Math.floor(fy)));
    const x1 = Math.min(fieldCols - 1, x0 + 1);
    const y1 = Math.min(fieldRows - 1, y0 + 1);
    const tx = fx - x0;
    const ty = fy - y0;
    const h00 = heightField[y0 * fieldCols + x0];
    const h10 = heightField[y0 * fieldCols + x1];
    const h01 = heightField[y1 * fieldCols + x0];
    const h11 = heightField[y1 * fieldCols + x1];
    const a = h00 + (h10 - h00) * tx;
    const b = h01 + (h11 - h01) * tx;
    return a + (b - a) * ty;
  }

  // Fallback antes de que la malla publique el campo (polígono + terrainHeight)
  const geo = getChocoGeoSync();
  if (geo) {
    const { lon, lat } = localToLonLat(geo, x, yLocal);
    if (!geo.isInside(lon, lat)) return SEA_FLOOR;
  }
  return terrainHeight(x, yLocal);
}

// ---------- paleta por altura del Chocó (vertex colors) ----------
// Selva húmeda del Pacífico: verdes intensos y saturados, arena oscura del
// litoral, el Atrato lodoso, y la Serranía del Baudó velada en bruma verde-gris
// (no roca desnuda — en el Chocó la montaña también es selva).
const C_FONDO = new THREE.Color("#12564d"); // fuera del polígono / lecho marino
const C_LECHO = new THREE.Color("#6e5a34"); // cauce del Atrato (agua lodosa)
const C_ARENA_MOJADA = new THREE.Color("#8a7444"); // arena de playa bajo el agua
const C_ARENA = new THREE.Color("#c4ac74"); // arena de playa seca (parda pacífica)
const C_VALLE = new THREE.Color("#2f9b4e"); // selva baja (esmeralda vivo)
const C_LADERA = new THREE.Color("#1c6e39"); // ladera (verde selva profundo)
const C_ALTO = new THREE.Color("#245c3c"); // selva de altura (verde oscuro)
const C_BRUMA = new THREE.Color("#5f7a63"); // crestas del Baudó (verde-gris bruma)

// sd = distancia con signo a la costa (unidades de mundo; + tierra, - mar).
function heightColor(h: number, sd: number, out: THREE.Color): void {
  // Playa: en la franja costera (|sd| < BEACH) y a media agua, pintar arena
  // —mojada bajo el agua, seca al emerger— para que la rampa lea como playa.
  if (sd < BEACH && h > -1.0 && h < 0.45) {
    const t = smoothstep(-0.5, 0.15, h); // mojada→seca al subir
    out.copy(C_ARENA_MOJADA).lerp(C_ARENA, t);
    // borde selva: al tope de la playa, fundir a valle
    if (h > 0.25) out.lerp(C_VALLE, (h - 0.25) / 0.2);
    return;
  }

  if (h <= -1) {
    out.copy(C_FONDO);
  } else if (h < WATER_LEVEL) {
    out.copy(C_LECHO);
  } else if (h <= 0.18) {
    out.copy(C_ARENA).lerp(C_VALLE, h / 0.18);
  } else if (h <= 0.9) {
    out.copy(C_VALLE);
  } else if (h <= 2.2) {
    out.copy(C_VALLE).lerp(C_LADERA, (h - 0.9) / 1.3);
  } else if (h <= 3.2) {
    out.copy(C_LADERA).lerp(C_ALTO, (h - 2.2) / 1.0);
  } else {
    // Solo las cimas más altas se velan de bruma verde-gris
    out.copy(C_ALTO).lerp(C_BRUMA, Math.min(1, (h - 3.2) / 1.2));
  }
}

interface ChocoTerrainProps {
  /** Señal real de "terreno listo" (geometría construida) para el loader */
  onReady?: () => void;
}

export default function ChocoTerrain({ onReady }: ChocoTerrainProps) {
  const [geometry, setGeometry] = useState<THREE.PlaneGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadChocoGeo()
      .then((geo) => {
        if (cancelled) return;

        const cols = SEG_X + 1;
        const rows = SEG_Y + 1;
        const plane = new THREE.PlaneGeometry(WIDTH, HEIGHT, SEG_X, SEG_Y);
        const pos = plane.attributes.position;
        const N = pos.count; // = cols * rows
        const colors = new Float32Array(N * 3);
        const tmpColor = new THREE.Color();

        // Pasada 1: dentro/fuera del polígono + altura "de tierra" por vértice
        const inside = new Uint8Array(N);
        const landH = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const lon =
            geo.bbox.minLon +
            (x / WIDTH + 0.5) * (geo.bbox.maxLon - geo.bbox.minLon);
          const lat =
            geo.bbox.minLat +
            (y / HEIGHT + 0.5) * (geo.bbox.maxLat - geo.bbox.minLat);
          inside[i] = geo.isInside(lon, lat) ? 1 : 0;
          landH[i] = terrainHeight(x, y);
        }

        // Distancia con signo a la costa: fuera de la tierra → al vértice
        // interior más cercano; dentro → al vértice exterior más cercano.
        const dOut = chamferDT(cols, rows, (i) => inside[i] === 0);
        const dIn = chamferDT(cols, rows, (i) => inside[i] === 1);
        const cellSize = (WIDTH / SEG_X + HEIGHT / SEG_Y) / 2;

        // Pasada 2: rampa de playa (tierra → lecho marino gradual) + color.
        // Publicamos el grid de alturas para que la física muestree lo mismo.
        const heights = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          const sd = (inside[i] ? dOut[i] : -dIn[i]) * cellSize;

          let h: number;
          if (sd >= BEACH) {
            h = landH[i]; // tierra adentro: relieve pleno (incluye el cauce)
          } else if (sd <= -BEACH) {
            h = SEA_FLOOR; // mar afuera: lecho marino
          } else {
            // Rampa suave de SEA_FLOOR (mar) a la tierra sobre 2·BEACH
            const t = smoothstep(-BEACH, BEACH, sd);
            h = SEA_FLOOR + (landH[i] - SEA_FLOOR) * t;
          }

          heights[i] = h;
          pos.setZ(i, h);

          heightColor(h, sd, tmpColor);
          colors[i * 3] = tmpColor.r;
          colors[i * 3 + 1] = tmpColor.g;
          colors[i * 3 + 2] = tmpColor.b;
        }

        pos.needsUpdate = true;
        plane.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        publishHeightField(heights, cols, rows);
        setGeometry(plane);
        onReady?.();
      })
      .catch((err) => {
        console.error("[ChocoTerrain] no se pudo cargar chocoRegion.geojson", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  if (!geometry) return null;

  // La geometría ya es final aquí (retornamos null antes), así que el trimesh
  // se genera correcto en el primer montaje del RigidBody.
  // TODO: si FPS sufre, migrar a heightfield collider desde terrainHeight.
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onDoubleClick={(e) => {
          e.stopPropagation();
          triggerReveal(e.point);
        }}
      >
        <meshStandardMaterial
          flatShading
          vertexColors
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </mesh>
    </RigidBody>
  );
}
