// Util geográfico compartido del diorama: polígono del Chocó, conversión
// lon/lat ↔ espacio local del plano, y test punto-en-polígono.
// Dimensiones del plano del diorama (alargado N-S como el Chocó).
// 60×90: mundo 1.5× — todo lo mapeado por polígono (municipios, spawn
// relativo, río) escala proporcionalmente sin re-layout.
export const WIDTH = 60;
export const HEIGHT = 90;

export type Ring = number[][]; // [[lon, lat], ...]

export interface PolyEntry {
  ring: Ring;
  bbox: [number, number, number, number]; // minLon, minLat, maxLon, maxLat
}

export interface ChocoGeo {
  polys: PolyEntry[];
  bbox: { minLon: number; maxLon: number; minLat: number; maxLat: number };
  /** lon/lat → coords locales del plano (x oeste→este, y sur→norte).
   *  Recordar: la rotación -PI/2 del mesh hace world Z = -y local. */
  lonLatToLocal(lon: number, lat: number): { x: number; y: number };
  /** bbox precheck + ray casting sobre los anillos exteriores */
  isInside(lon: number, lat: number): boolean;
}

export function pointInRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

async function fetchGeo(): Promise<ChocoGeo> {
  const res = await fetch("/data/chocoRegion.geojson");
  const geojson = await res.json();

  const polys: PolyEntry[] = [];
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const feature of geojson.features) {
    const geom = feature.geometry;
    const multi: Ring[][] =
      geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
    for (const polygon of multi) {
      const ring = polygon[0];
      let bMinLon = Infinity;
      let bMaxLon = -Infinity;
      let bMinLat = Infinity;
      let bMaxLat = -Infinity;
      for (const [lon, lat] of ring) {
        if (lon < bMinLon) bMinLon = lon;
        if (lon > bMaxLon) bMaxLon = lon;
        if (lat < bMinLat) bMinLat = lat;
        if (lat > bMaxLat) bMaxLat = lat;
      }
      polys.push({ ring, bbox: [bMinLon, bMinLat, bMaxLon, bMaxLat] });
      if (bMinLon < minLon) minLon = bMinLon;
      if (bMaxLon > maxLon) maxLon = bMaxLon;
      if (bMinLat < minLat) minLat = bMinLat;
      if (bMaxLat > maxLat) maxLat = bMaxLat;
    }
  }

  const lonLatToLocal = (lon: number, lat: number) => ({
    x: ((lon - minLon) / (maxLon - minLon) - 0.5) * WIDTH,
    y: ((lat - minLat) / (maxLat - minLat) - 0.5) * HEIGHT,
  });

  const isInside = (lon: number, lat: number) =>
    polys.some(
      ({ ring, bbox }) =>
        lon >= bbox[0] &&
        lon <= bbox[2] &&
        lat >= bbox[1] &&
        lat <= bbox[3] &&
        pointInRing(lon, lat, ring)
    );

  return { polys, bbox: { minLon, maxLon, minLat, maxLat }, lonLatToLocal, isInside };
}

// Caché a nivel de módulo: una sola promesa reutilizada por todos los consumidores
let cache: Promise<ChocoGeo> | null = null;
// Referencia SÍNCRONA al geo ya resuelto — la física (useBeforePhysicsStep)
// corre síncrona y no puede await; en cuanto el fetch termina, este singleton
// deja que Vehicle consulte el mismo polígono que usó la malla del terreno.
let resolved: ChocoGeo | null = null;

export function loadChocoGeo(): Promise<ChocoGeo> {
  if (!cache) cache = fetchGeo().then((geo) => (resolved = geo));
  return cache;
}

/** Geo ya resuelto, o null si el fetch aún no termina. Para consumidores
 *  síncronos (física). Los async deben usar loadChocoGeo(). */
export function getChocoGeoSync(): ChocoGeo | null {
  return resolved;
}

/** Coords locales del plano → lon/lat (inverso de lonLatToLocal). Es el mismo
 *  mapeo que ChocoTerrain usa al construir la malla vértice por vértice. */
export function localToLonLat(
  geo: ChocoGeo,
  x: number,
  y: number
): { lon: number; lat: number } {
  const { minLon, maxLon, minLat, maxLat } = geo.bbox;
  return {
    lon: minLon + (x / WIDTH + 0.5) * (maxLon - minLon),
    lat: minLat + (y / HEIGHT + 0.5) * (maxLat - minLat),
  };
}
