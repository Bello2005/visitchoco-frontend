import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { loadChocoGeo } from "../utils/geo";
import { terrainHeight, WATER_LEVEL } from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";

// TODO: vendrá de la API. Coordenadas aproximadas — el diorama es estilizado.
const MUNICIPIOS: { name: string; lon: number; lat: number }[] = [
  { name: "Quibdó", lon: -76.642, lat: 5.695 },
  { name: "Istmina", lon: -76.684, lat: 5.161 },
  { name: "Tadó", lon: -76.559, lat: 5.265 },
  { name: "Condoto", lon: -76.65, lat: 5.091 },
  { name: "Nuquí", lon: -77.271, lat: 5.713 },
  { name: "Bahía Solano", lon: -77.402, lat: 6.223 },
  { name: "Acandí", lon: -77.279, lat: 8.512 },
  { name: "Riosucio", lon: -77.114, lat: 7.44 },
  { name: "Bojayá", lon: -76.942, lat: 6.557 },
  { name: "Bagadó", lon: -76.415, lat: 5.41 },
  { name: "El Carmen de Atrato", lon: -76.142, lat: 5.9 },
  { name: "Unguía", lon: -77.091, lat: 8.043 },
];

// pseudo-random determinista con seed entera (mismo diorama en cada carga)
function seeded(n: number): number {
  let h = (n * 374761393 + 1013904223) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

interface Town {
  // esferas en coords locales al grupo (el grupo vive en el centro del pueblo)
  center: [number, number, number];
  spheres: [number, number, number][];
  phase: number;
}

export default function MunicipalityLights() {
  const [towns, setTowns] = useState<Town[] | null>(null);
  const groupRefs = useRef<(THREE.Group | null)[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadChocoGeo().then((geo) => {
      if (cancelled) return;

      const lonC = (geo.bbox.minLon + geo.bbox.maxLon) / 2;
      const latC = (geo.bbox.minLat + geo.bbox.maxLat) / 2;
      const result: Town[] = [];

      for (let i = 0; i < MUNICIPIOS.length; i++) {
        const m = MUNICIPIOS[i];
        let { lon, lat } = m;

        // Los costeros pueden caer fuera por la simplificación del borde:
        // empujar hacia el interior (centro del bbox) en pasos de 0.02°
        const dLon = lonC - lon;
        const dLat = latC - lat;
        const len = Math.hypot(dLon, dLat) || 1;
        let steps = 0;
        while (!geo.isInside(lon, lat) && steps < 10) {
          lon += (dLon / len) * 0.02;
          lat += (dLat / len) * 0.02;
          steps++;
        }
        if (!geo.isInside(lon, lat)) {
          console.warn(
            `[MunicipalityLights] ${m.name} quedó fuera del polígono tras ${steps} pasos — omitido`
          );
          continue;
        }

        const { x, y } = geo.lonLatToLocal(lon, lat);
        const count = 2 + Math.floor(seeded(i * 7 + 1) * 3); // 2..4 esferas
        const spheres: [number, number, number][] = [];
        for (let s = 0; s < count; s++) {
          const ox = (seeded(i * 13 + s * 3 + 2) - 0.5) * 0.8; // ~±0.4
          const oy = (seeded(i * 17 + s * 5 + 4) - 0.5) * 0.8;
          // terrainHeight no sabe del polígono ni del cauce: si el punto cae
          // en el río (pueblos ribereños), anclar la luz justo sobre el agua
          const h = Math.max(terrainHeight(x + ox, y + oy), WATER_LEVEL + 0.05);
          spheres.push([ox, h + 0.15, -oy]); // local al grupo (grupo en x,0,-y)
        }
        result.push({
          center: [x, 0, -y],
          spheres,
          phase: seeded(i * 29 + 11) * Math.PI * 2,
        });
      }

      setTowns(result);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Un material por municipio (compartido entre sus esferas) para pulsar
  // emissiveIntensity sin recorrer meshes. PROHIBIDO pointLight por municipio.
  const materials = useMemo(
    () =>
      towns?.map(() => {
        const m = new THREE.MeshStandardMaterial({
          color: "#ffb347",
          emissive: "#ffb347",
          emissiveIntensity: 2,
        });
        applyReveal(m); // se materializan con el territorio
        return m;
      }) ?? null,
    [towns]
  );

  useEffect(() => {
    return () => {
      materials?.forEach((m) => m.dispose());
    };
  }, [materials]);

  // Un solo useFrame para todas las luces: intensidad 1.6→2.4, escala ±10%
  useFrame(({ clock }) => {
    if (!materials || !towns) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < materials.length; i++) {
      const pulse = Math.sin(t * 1.5 + towns[i].phase);
      materials[i].emissiveIntensity = 2 + pulse * 0.4;
      const g = groupRefs.current[i];
      if (g) g.scale.setScalar(1 + pulse * 0.1);
    }
  });

  if (!towns || !materials) return null;

  return (
    <>
      {towns.map((town, i) => (
        <group
          key={i}
          position={town.center}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
        >
          {town.spheres.map((p, s) => (
            <mesh key={s} position={p} material={materials[i]}>
              <sphereGeometry args={[0.06, 8, 8]} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}
