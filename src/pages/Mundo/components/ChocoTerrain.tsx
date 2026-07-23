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

// Diorama estilizado: NO es un DEM real. El plano es alargado N-S como el Chocó.
export { WIDTH, HEIGHT };
export const WATER_LEVEL = 0.0;
// Fuera del polígono del Chocó el lecho se hunde a esta cota (mar abierto).
// La malla y la física comparten esta constante — así no hay "tierra fantasma".
export const SEA_FLOOR = -2;
// FRONTERA DEL MUNDO: el terreno mide WIDTH×HEIGHT, pero la malla de agua es
// 200×200 y worldGround devuelve SEA_FLOOR fuera del polígono → sin un tope la
// panga navegaría infinitamente hacia el vacío. Dejamos un ANILLO de mar
// abierto para explorar (SEA_MARGIN) y luego un muro invisible (Vehicle clampa
// la posición al borde). Único origen de verdad del límite.
const SEA_MARGIN = 12;
export const WORLD_HALF_X = WIDTH / 2 + SEA_MARGIN; // ±42 en X
export const WORLD_HALF_Z = HEIGHT / 2 + SEA_MARGIN; // ±57 en Z
// Ancho (en unidades de mundo) de la rampa de playa a cada lado de la costa.
// El terreno baja gradual de la tierra al lecho marino en vez de caer en
// acantilado — así el carro sube a tierra manejando por la arena.
const BEACH = 3.4;
// Mundo 60×90: más segmentos para conservar la densidad de vértices
const SEG_X = 120;
const SEG_Y = 180;

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

  // Serranía del Baudó: cresta N-S cerca del borde occidental, picos ~5.5 —
  // lo bastante alta para verse como SIERRA desde la carretera del valle
  const crestX = -0.68 + (valueNoise(3.7, y * 0.12) - 0.5) * 0.16;
  const dRidge = (nx - crestX) / 0.18;
  h += Math.exp(-dRidge * dRidge) * (3.6 + 1.9 * fbm(x * 0.35, y * 0.35));

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
  const riverX = riverCenterNx(y);
  // σ 0.09: con 0.045 el canal quedaba más angosto que el propio chasis
  // del carro (lo puenteaba sin caer al agua) y el banco era un acantilado
  const dRiver = (nx - riverX) / 0.09;
  const nsMask = smoothstep(-0.55, -0.15, ny);
  const carve = Math.exp(-dRiver * dRiver) * nsMask;
  h = h * (1 - carve) + -0.45 * carve;

  // La VÍA DEL CHOCÓ: recorre el departamento de punta a punta (ver
  // roadCenterNx), aplanada a cota fija sobre la misma malla — cero geometría
  // extra, y worldGround la comparte: se CONDUCE de verdad sobre ella. 0.96:
  // calzada casi lisa (la suavidad ES la sensación premium al conducir). En
  // los tramos de sierra el aplanado TALLA el paso entre paredes verdes.
  // PERO solo aplana sobre TIERRA: donde la vía cruza agua (río/mar) deja el
  // canal ABIERTO (landness→0) para que la panga navegue por DEBAJO — ahí la
  // carretera pasa en PUENTE (deck elevado con física propia, RoadRibbon).
  const rm = roadMaskAt(nx, ny);
  const landness = smoothstep(WATER_LEVEL - 0.05, WATER_LEVEL + 0.4, h);
  const fill = rm * 0.96 * landness;
  h = h * (1 - fill) + ROAD_LEVEL * fill;

  // EXPLANADAS de las plazas: claro plano a cota de vía alrededor de cada
  // monumento (local y = -worldZ), para que no queden enterrados por la selva.
  // Aplanado TOTAL (factor 1, no 0.96): con 0.96 quedaba el 4% de la altura
  // original, y una loma de 5-8u dejaba +0.2/+0.3 — por encima del tope de la
  // plaza (0.52), así que la montaña CORTABA la plataforma.
  const gd = Math.hypot(x - GATEWAY_X, y + GATEWAY_Z);
  const gm = 1 - smoothstep(PLAZA_CLEAR_R, PLAZA_CLEAR_R + PLAZA_CLEAR_FADE, gd);
  if (gm > 0) h = h * (1 - gm) + ROAD_LEVEL * gm;

  const nd = Math.hypot(x - NORTH_X, y + NORTH_Z);
  const nm = 1 - smoothstep(NORTH_CLEAR_R, NORTH_CLEAR_R + PLAZA_CLEAR_FADE, nd);
  if (nm > 0) h = h * (1 - nm) + ROAD_LEVEL * nm;

  // EL MALECÓN DE QUIBDÓ: a lo largo de una franja en Z (el paseo), abrimos una
  // BAHÍA (agua) al ESTE de la línea de agua y aplanamos una EXPLANADA (tierra)
  // al OESTE. Gated a Z≈-9.7..0.7 → jamás toca el puente (Z≥4) ni la vía (X<-4).
  {
    const zBand =
      1 - smoothstep(MALECON_HALF_LEN, MALECON_HALF_LEN + 3, Math.abs(y + MALECON_Z));
    if (zBand > 0) {
      const bay =
        smoothstep(MALECON_FRONT_X - 0.4, MALECON_FRONT_X + 1.2, x) *
        (1 - smoothstep(MALECON_BAY_EAST - 1.5, MALECON_BAY_EAST + 1.5, x)) *
        zBand;
      if (bay > 0) h = h * (1 - bay) + MALECON_BAY_DEPTH * bay;
      const esp =
        (1 - smoothstep(MALECON_FRONT_X - 0.8, MALECON_FRONT_X + 0.2, x)) *
        smoothstep(MALECON_FRONT_X - 4.5, MALECON_FRONT_X - 3.2, x) *
        zBand;
      if (esp > 0) h = h * (1 - esp) + MALECON_GROUND * esp;
    }
  }

  return h;
}

// Centro del cauce en x normalizado (compartido por río y carretera)
function riverCenterNx(y: number): number {
  return 0.12 + (valueNoise(9.1, y * 0.1) - 0.5) * 0.1;
}

// Cota de la carretera (sobre el agua, bajo la selva del valle)
const ROAD_LEVEL = 0.34;
// PORTAL DEL CHOCÓ: la vía nace en la punta sur sobre tierra firme y plana
// (~ROAD_LEVEL). Aquí se planta la plaza-portal "VisitChocó" y el carro spawnea.
// (perfil del sur sondeado: tierra plana ~0.36 de z≈42 hacia el norte.)
export const GATEWAY_Z = 40;
// GATEWAY_X se declara MÁS ABAJO, tras ROAD_SPINE: calcularlo aquí caía en la
// zona muerta temporal del const (roadCenterNx lee ROAD_SPINE) → ReferenceError.
// Radio de la EXPLANADA del portal: el aplanado de la vía es una franja
// angosta (σ 0.042 ≈ ±1.3u), así que fuera de ella la selva sube y ENTIERRA la
// plaza. Este claro asienta el monumento en terreno plano y deja salir el
// carro en cualquier dirección.
const PLAZA_CLEAR_R = 5.5;
const PLAZA_CLEAR_FADE = 3.2;
// PLAZA DE LA CHIRIMÍA: el remate NORTE de la vía (Darién). Es el DESTINO del
// viaje, así que es bastante más grande que el portal de entrada.
// z=-22: sondeado como TIERRA FIRME (g≈0.34). Más al norte la costa se
// fragmenta en agua/islotes (agua en -32..-30.5 y en -41..-44), así que una
// plaza allá flotaba sobre el mar — la explanada no puede crear tierra donde
// la lógica de costa manda SEA_FLOOR.
export const NORTH_Z = -22;
const NORTH_CLEAR_R = 6.8;
// EL MALECÓN DE QUIBDÓ: paseo ribereño a orillas del Atrato. Va al SUR del
// puente (Z≥4), sobre la orilla — aquí la VÍA queda LEJOS al oeste (X<-4), así
// que nunca la tocamos. El río se ABRE en una bahía ancha para que el malecón
// se asome a un Atrato grande. Todo gated a esta franja compacta.
export const MALECON_Z = -4.5; // centro del paseo (worldZ)
export const MALECON_FRONT_X = 1.2; // línea de agua = borde ESTE del paseo
export const MALECON_HALF_LEN = 5.2; // medio-largo del paseo a lo largo de Z
export const MALECON_GROUND = 0.42; // cota de la explanada del paseo
const MALECON_BAY_EAST = 9.5; // la bahía del Atrato llega hasta aquí al este
const MALECON_BAY_DEPTH = -0.4; // fondo de la bahía (bajo el agua)
// σ 0.042 → calzada ancha (~2.5u de núcleo) tipo la road de folio-2025,
// cómoda para conducir y protagonista en pantalla
const ROAD_SIGMA_NX = 0.042;
// Media-meseta PLANA de la calzada (≈1.26u, algo más que el semiancho de la
// cinta): dentro de esto el terreno queda a cota fija → nada de zanja.
const ROAD_FLAT_NX = 0.042;

// Trazado de la VÍA DEL CHOCÓ: el ESPINAZO REAL del polígono, calculado
// offline (centro del segmento interior más ancho por fila de latitud,
// suavizado; verificado 0/190 puntos fuera del departamento). La vía nace en
// la punta sur del San Juan, recorre el valle del Atrato y remata en el
// Darién. Interpolación Catmull-Rom para curvas de carretera de verdad.
const ROAD_SPINE: [number, number][] = [
  [-0.97, 0.222], [-0.89, 0.027], [-0.81, 0.041], [-0.73, 0.126],
  [-0.65, 0.174], [-0.57, 0.224], [-0.49, 0.191], [-0.4, 0.178],
  [-0.32, 0.216], [-0.24, 0.268], [-0.16, 0.241], [-0.08, 0.04],
  [0.0, -0.145], [0.08, -0.163], [0.16, -0.283], [0.24, -0.332],
  [0.32, -0.227], [0.4, -0.293], [0.49, -0.31], [0.57, -0.289],
  [0.65, -0.261], [0.73, -0.153], [0.81, -0.208], [0.89, -0.338],
  [0.97, -0.438],
];

function roadCenterNx(ny: number): number {
  const s = ROAD_SPINE;
  if (ny <= s[0][0]) return s[0][1];
  if (ny >= s[s.length - 1][0]) return s[s.length - 1][1];
  let i = 0;
  while (i < s.length - 2 && ny > s[i + 1][0]) i++;
  const p0 = s[Math.max(0, i - 1)][1];
  const p1 = s[i][1];
  const p2 = s[i + 1][1];
  const p3 = s[Math.min(s.length - 1, i + 2)][1];
  const t = (ny - s[i][0]) / (s[i + 1][0] - s[i][0]);
  // Catmull-Rom: curva suave que pasa por los puntos de control
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

// La vía existe de punta a punta; solo se desvanece en los últimos metros
function roadNsMask(ny: number): number {
  return smoothstep(-0.985, -0.93, ny) * (1 - smoothstep(0.93, 0.985, ny));
}

// Perfil de MESETA: la calzada queda PLANA de verdad en todo su ancho y solo
// después cae en talud. Con la gaussiana pura el terreno ya subía DENTRO del
// ancho de la vía, así que el asfalto se veía HUNDIDO en una zanja.
function roadMaskAt(nx: number, ny: number): number {
  const dn = Math.abs(nx - roadCenterNx(ny));
  const d = Math.max(0, dn - ROAD_FLAT_NX) / ROAD_SIGMA_NX;
  return Math.exp(-d * d) * roadNsMask(ny);
}

/** Máscara de carretera en coords LOCALES del plano (x, y=-worldZ), 0..1 */
export function roadMask(x: number, y: number): number {
  return roadMaskAt(x / (WIDTH / 2), y / (HEIGHT / 2));
}

/** Centro (x de MUNDO) de la carretera a la altura worldZ dada */
export function roadCenterWorldX(z: number): number {
  return roadCenterNx(-z / (HEIGHT / 2)) * (WIDTH / 2);
}

/** x de MUNDO del PORTAL (centro de la vía en la punta sur). Declarado aquí
 *  —y no junto a GATEWAY_Z— porque necesita ROAD_SPINE ya inicializado. */
export const GATEWAY_X = roadCenterWorldX(GATEWAY_Z);
/** x de MUNDO de la PLAZA DE LA MARIMBA (remate norte). Misma razón. */
export const NORTH_X = roadCenterWorldX(NORTH_Z);

/** Centro (x de MUNDO) del cauce del Atrato a la altura worldZ dada
 *  (solo existe donde el valle: úsese con filtro de worldGround) */
export function riverCenterWorldX(z: number): number {
  return riverCenterNx(-z) * (WIDTH / 2);
}

/** Ruido de "matas" para la vegetación (coords locales): la selva crece en
 *  parches con CLAROS entre ellos — colocación con intención, no uniforme.
 *  ~0..1; sembrar solo donde supera un umbral. */
export function patchNoise(x: number, y: number): number {
  return fbm(x * 0.14 + 5.2, y * 0.14 + 9.7);
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

// Señal "heightfield publicado": la vegetación DEBE esperar esto antes de
// dispersar. Si no, worldGround cae al terrainHeight CRUDO (sin la rampa de
// playa de la malla) y los árboles costeros quedan flotando sobre la playa
// rebajada. whenHeightFieldReady() resuelve en cuanto la malla publica.
let heightFieldReadyResolve: (() => void) | null = null;
let heightFieldReady = false;
const heightFieldReadyPromise = new Promise<void>((res) => {
  heightFieldReadyResolve = res;
});
export function whenHeightFieldReady(): Promise<void> {
  return heightFieldReady ? Promise.resolve() : heightFieldReadyPromise;
}

function publishHeightField(f: Float32Array, cols: number, rows: number): void {
  heightField = f;
  fieldCols = cols;
  fieldRows = rows;
  heightFieldReady = true;
  heightFieldReadyResolve?.();
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
const C_ARENA_MOJADA = new THREE.Color("#9a8354"); // arena de playa bajo el agua
const C_ARENA = new THREE.Color("#d8be82"); // arena de playa seca (parda clara)
const C_ESPUMA = new THREE.Color("#e9f5f0"); // espuma de las olas en la orilla
const C_VALLE = new THREE.Color("#2f9b4e"); // selva baja (esmeralda vivo)
const C_LADERA = new THREE.Color("#1c6e39"); // ladera (verde selva profundo)
const C_ALTO = new THREE.Color("#245c3c"); // selva de altura (verde oscuro)
const C_BRUMA = new THREE.Color("#5f7a63"); // crestas del Baudó (verde-gris bruma)
const C_BERMA = new THREE.Color("#3f3b34"); // arcén (tierra compactada oscura)

// sd = distancia con signo a la costa; rd = máscara de carretera 0..1.
// La CALZADA NEGRA la pinta el mesh dedicado RoadRibbon; aquí solo tintamos un
// arcén oscuro bajo la vía para que cualquier filo entre el asfalto y el
// terreno lea como berma, no como pasto brillante.
function heightColor(
  h: number,
  sd: number,
  rd: number,
  out: THREE.Color
): void {
  baseHeightColor(h, sd, out);
  if (rd > 0.2) {
    out.lerp(C_BERMA, smoothstep(0.35, 0.72, rd) * 0.85);
  }
}

function baseHeightColor(h: number, sd: number, out: THREE.Color): void {
  // Playa: en la franja costera (|sd| < BEACH) y a media agua, pintar arena
  // —mojada bajo el agua, seca al emerger— para que la rampa lea como playa.
  if (sd < BEACH && h > -1.0 && h < 0.45) {
    const t = smoothstep(-0.5, 0.15, h); // mojada→seca al subir
    out.copy(C_ARENA_MOJADA).lerp(C_ARENA, t);
    // ESPUMA: banda blanca justo en la línea del agua — la orilla "rompe"
    const foam = smoothstep(-0.09, -0.02, h) * (1 - smoothstep(0.02, 0.1, h));
    if (foam > 0) out.lerp(C_ESPUMA, foam * 0.75);
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

          heightColor(h, sd, roadMask(pos.getX(i), pos.getY(i)), tmpColor);
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
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial
          flatShading
          vertexColors
          ref={(m) => {
            if (m) applyReveal(m, { groundDetail: true });
          }}
        />
      </mesh>
    </RigidBody>
  );
}
