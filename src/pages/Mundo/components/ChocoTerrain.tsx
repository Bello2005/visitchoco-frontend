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

// ---------- verdad de suelo del MUNDO (compartida con la física) ----------
// terrainHeight() sola no sabe del polígono: fuera del Chocó devuelve relieve
// "fantasma". Esta función aplica el mismo test punto-en-polígono que la malla,
// así que el mar abierto vale SEA_FLOOR de verdad. Vehicle la usa para decidir
// carro↔panga por REGIÓN (tierra vs agua), no por trucos de altura del chasis.
// x,z = coordenadas de MUNDO (world Z = -y local por la rotación del mesh).
export function worldGround(x: number, z: number): number {
  const yLocal = -z;
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
const C_ARENA = new THREE.Color("#b8a06a"); // playa pacífica (arena parda)
const C_VALLE = new THREE.Color("#2f9b4e"); // selva baja (esmeralda vivo)
const C_LADERA = new THREE.Color("#1c6e39"); // ladera (verde selva profundo)
const C_ALTO = new THREE.Color("#245c3c"); // selva de altura (verde oscuro)
const C_BRUMA = new THREE.Color("#5f7a63"); // crestas del Baudó (verde-gris bruma)

function heightColor(h: number, out: THREE.Color): void {
  if (h <= -1) {
    out.copy(C_FONDO);
  } else if (h < WATER_LEVEL) {
    out.copy(C_LECHO);
  } else if (h <= 0.12) {
    // Arena SOLO en la rampa del cauce que emerge del agua (0..0.12);
    // el piso duro de 0.15 y el valle (~0.2) son selva, no playa
    out.copy(C_ARENA);
  } else if (h <= 0.18) {
    out.copy(C_ARENA).lerp(C_VALLE, (h - 0.12) / 0.06);
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

        const plane = new THREE.PlaneGeometry(WIDTH, HEIGHT, SEG_X, SEG_Y);
        const pos = plane.attributes.position;
        const colors = new Float32Array(pos.count * 3);
        const tmpColor = new THREE.Color();

        for (let i = 0; i < pos.count; i++) {
          // Coordenadas locales del plano: x oeste→este, y sur→norte
          // (la rotación -PI/2 del mesh convierte y local en -Z mundial)
          const x = pos.getX(i);
          const y = pos.getY(i);

          // Vértice → lon/lat dentro del bounding box del departamento
          const lon =
            geo.bbox.minLon +
            (x / WIDTH + 0.5) * (geo.bbox.maxLon - geo.bbox.minLon);
          const lat =
            geo.bbox.minLat +
            (y / HEIGHT + 0.5) * (geo.bbox.maxLat - geo.bbox.minLat);

          // Fuera del Chocó: hundir al lecho marino (misma cota que worldGround)
          const h = geo.isInside(lon, lat) ? terrainHeight(x, y) : SEA_FLOOR;
          pos.setZ(i, h);

          heightColor(h, tmpColor);
          colors[i * 3] = tmpColor.r;
          colors[i * 3 + 1] = tmpColor.g;
          colors[i * 3 + 2] = tmpColor.b;
        }

        pos.needsUpdate = true;
        plane.setAttribute("color", new THREE.BufferAttribute(colors, 3));
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
