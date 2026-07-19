import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { loadChocoGeo } from "../utils/geo";
import { terrainHeight, worldGround, WATER_LEVEL } from "./ChocoTerrain";
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
      <Caserios towns={towns} />
    </>
  );
}

// Caseríos: casitas low-poly instanciadas alrededor de cada municipio
// (paredes + techos = 2 draw calls). El pueblo deja de ser solo un puntito.
function Caserios({ towns }: { towns: Town[] }) {
  const wallGeo = useMemo(() => new THREE.BoxGeometry(0.34, 0.22, 0.28), []);
  const roofGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.26, 0.16, 4);
    g.rotateY(Math.PI / 4);
    return g;
  }, []);
  useEffect(
    () => () => {
      wallGeo.dispose();
      roofGeo.dispose();
    },
    [wallGeo, roofGeo]
  );

  const placements = useMemo(() => {
    const out: { x: number; y: number; z: number; rotY: number; s: number }[] =
      [];
    for (let i = 0; i < towns.length; i++) {
      const t = towns[i];
      const n = 3 + Math.floor(seeded(i * 91 + 5) * 3); // 3..5 casas
      for (let k = 0; k < n; k++) {
        const ox = (seeded(i * 131 + k * 17 + 3) - 0.5) * 2.4;
        const oz = (seeded(i * 151 + k * 19 + 8) - 0.5) * 2.4;
        const wx = t.center[0] + ox;
        const wz = t.center[2] + oz;
        const g = worldGround(wx, wz);
        if (g < 0.1) continue; // ni en el agua ni en la playa mojada
        out.push({
          x: wx,
          y: g + 0.1,
          z: wz,
          rotY: seeded(i * 171 + k * 23) * Math.PI * 2,
          s: 0.85 + seeded(i * 191 + k * 29) * 0.5,
        });
      }
    }
    return out;
  }, [towns]);

  const wallsRef = useRef<THREE.InstancedMesh>(null);
  const roofsRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!placements.length) return;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();
    for (let i = 0; i < placements.length; i++) {
      const p = placements[i];
      euler.set(0, p.rotY, 0);
      quat.setFromEuler(euler);
      scl.setScalar(p.s);
      pos.set(p.x, p.y, p.z);
      m.compose(pos, quat, scl);
      wallsRef.current?.setMatrixAt(i, m);
      pos.y += 0.19 * p.s;
      m.compose(pos, quat, scl);
      roofsRef.current?.setMatrixAt(i, m);
    }
    if (wallsRef.current) wallsRef.current.instanceMatrix.needsUpdate = true;
    if (roofsRef.current) roofsRef.current.instanceMatrix.needsUpdate = true;
  }, [placements]);

  if (!placements.length) return null;

  return (
    <>
      <instancedMesh
        ref={wallsRef}
        args={[wallGeo, undefined, placements.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#e6d7bd"
          flatShading
          roughness={0.9}
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </instancedMesh>
      <instancedMesh
        ref={roofsRef}
        args={[roofGeo, undefined, placements.length]}
        castShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#b0562f"
          flatShading
          roughness={0.85}
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </instancedMesh>
    </>
  );
}
