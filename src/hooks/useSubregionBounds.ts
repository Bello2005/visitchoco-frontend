import { useMemo } from "react";
import L from "leaflet";
import type { Municipality } from "../services/municipality.service";
import type { SubregionKey } from "../utils/subregionFromMunicipio";
import { getMunicipalitiesBySubregion } from "../utils/subregionData";

export function computeSubregionBounds(
  municipalities: Municipality[],
  subregionKey: SubregionKey
): L.LatLngBounds | null {
  const members = getMunicipalitiesBySubregion(municipalities, subregionKey);
  const bounds = L.latLngBounds([]);
  for (const m of members) {
    const geom = m.geometry?.geometry;
    if (!geom) continue;
    if (geom.type === "MultiPolygon") {
      const coords = geom.coordinates as number[][][][];
      for (const poly of coords) {
        for (const ring of poly) {
          for (const pt of ring) {
            if (pt.length >= 2) bounds.extend([pt[1], pt[0]]);
          }
        }
      }
    } else if (geom.type === "Point") {
      const [lng, lat] = geom.coordinates as [number, number];
      bounds.extend([lat, lng]);
    } else if (typeof m.lat === "number" && typeof m.lon === "number") {
      bounds.extend([m.lat, m.lon]);
    }
  }
  return bounds.isValid() ? bounds : null;
}

export function useSubregionBounds(
  municipalities: Municipality[],
  subregionKey: SubregionKey | null
): L.LatLngBounds | null {
  return useMemo(() => {
    if (!subregionKey) return null;
    return computeSubregionBounds(municipalities, subregionKey);
  }, [municipalities, subregionKey]);
}
