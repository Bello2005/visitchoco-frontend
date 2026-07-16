import { useEffect, useState } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { loadChocoGeo, WIDTH, HEIGHT } from "../utils/geo";
import { applyReveal } from "../utils/applyReveal";
import { triggerReveal } from "../utils/revealUniforms";

// Diorama estilizado: NO es un DEM real. El plano es alargado N-S como el Chocó.
export { WIDTH, HEIGHT };
export const WATER_LEVEL = 0.0;
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

// ---------- paleta por altura (vertex colors, look nocturno) ----------
const C_FONDO = new THREE.Color("#030c14"); // fuera del polígono / fondo marino
const C_LECHO = new THREE.Color("#06251d"); // lecho del río
const C_VALLE = new THREE.Color("#0d3b2e"); // valle / selva baja (esmeralda)
const C_LADERA = new THREE.Color("#071f18"); // laderas (verde-negro)
const C_ROCA = new THREE.Color("#2a3b3e"); // crestas de la Serranía

function heightColor(h: number, out: THREE.Color): void {
  if (h <= -1) {
    out.copy(C_FONDO);
  } else if (h < WATER_LEVEL) {
    out.copy(C_LECHO);
  } else if (h <= 0.9) {
    out.copy(C_VALLE);
  } else if (h <= 2.2) {
    out.copy(C_VALLE).lerp(C_LADERA, (h - 0.9) / 1.3);
  } else {
    out.copy(C_LADERA).lerp(C_ROCA, Math.min(1, (h - 2.2) / 1.6));
  }
}

export default function ChocoTerrain() {
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

          // Fuera del Chocó: hundir bajo el nivel del "mar" del diorama
          const h = geo.isInside(lon, lat) ? terrainHeight(x, y) : -2;
          pos.setZ(i, h);

          heightColor(h, tmpColor);
          colors[i * 3] = tmpColor.r;
          colors[i * 3 + 1] = tmpColor.g;
          colors[i * 3 + 2] = tmpColor.b;
        }

        pos.needsUpdate = true;
        plane.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        setGeometry(plane);
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
