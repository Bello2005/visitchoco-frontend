import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { MALECON_FRONT_X, MALECON_Z, MALECON_GROUND } from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";

// EL MALECÓN DE QUIBDÓ — el paseo ribereño del Atrato, el hito de la capital.
// Réplica ESTILIZADA (mismo lenguaje low-poly del diorama, todo procedural y con
// applyReveal): un largo paseo enlosado a la orilla del río con la firma visual
// del malecón real —los ARCOS BLANCOS de las cubiertas modernas—, MIRADORES que
// se asoman sobre el Atrato con baranda y banca, palmas, faroles ámbar y un
// letrero grande "MALECÓN DE QUIBDÓ" para que se reconozca al toque. Mira al
// OESTE sobre la bahía del Atrato (abierta en el terreno); la vía queda lejos.
//
// Sistema local (grupo en la línea de agua): +X = ESTE (hacia el río/miradores),
// -X = OESTE (tierra/explanada), Z = a lo largo del paseo (N-S).

const GROUND = MALECON_GROUND; // 0.42, cota de la explanada
const DECK_TOP = 0.55; // cota del enlosado del paseo
const PROM_DEPTH = 3.2; // profundidad del paseo (X, hacia el oeste)
const PROM_HL = 5.0; // medio-largo del paseo (Z)
const DECK_CX = -PROM_DEPTH / 2; // centro del paseo en X (=-1.6)
const RAIL_TOP = 0.52; // alto de la baranda sobre el deck
const ARCH_R = PROM_DEPTH / 2; // radio del arco = medio ancho del paseo
const MIR_TOP = 0.48; // cota del piso de los miradores (a ras del agua)
const MIR_OUT = 2.4; // cuánto se asoman al río (X)

const TILE = "#e2d7bd"; // enlosado cálido
const TILE_WARM = "#d0c19c";
const TEAL = "#2f9b8a"; // franja de agua (acento del río)
const STONE_DK = "#b7a988";
const WHITE = "#f4efe4"; // arcos y barandas (blanco cálido)
const WOOD = "#7c5a34";
const WOOD_DK = "#5f452a";
const METAL = "#39414a";
const PALM_TRUNK = "#7a5a34";
const PALM_LEAF = "#3f9b52";
const AMBER = "#ffb347";
const EMERALD = "#37b26a";

// Letrero "MALECÓN DE QUIBDÓ" → textura de canvas (sin fuentes remotas)
function makeSign(): THREE.CanvasTexture {
  const w = 1024;
  const h = 320;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // línea decorativa teal
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, 74);
  ctx.lineTo(w * 0.72, 74);
  ctx.stroke();
  ctx.fillStyle = "#f6ecd6";
  ctx.font = '600 148px Georgia, "Times New Roman", serif';
  ctx.fillText("MALECÓN", w / 2, h / 2 + 8);
  ctx.fillStyle = "#bfe3d6";
  ctx.font = "500 44px Georgia, serif";
  ctx.fillText("D E   Q U I B D Ó", w / 2, h - 46);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Una palma estilizada: tronco inclinado + fronda de hojas caídas */
function Palm({
  position,
  yaw = 0,
  mats,
}: {
  position: [number, number, number];
  yaw?: number;
  mats: { trunk: THREE.Material; leaf: THREE.Material };
}) {
  const fronds = 7;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 1.35, 0]} rotation={[0.06, 0, 0.05]} material={mats.trunk} castShadow>
        <cylinderGeometry args={[0.11, 0.17, 2.7, 6]} />
      </mesh>
      <group position={[0.08, 2.7, 0]}>
        {Array.from({ length: fronds }, (_, i) => {
          const a = (i / fronds) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.5, 0.02, Math.sin(a) * 0.5]}
              rotation={[Math.sin(a) * 0.5, -a, -0.75]}
              material={mats.leaf}
              castShadow
            >
              <coneGeometry args={[0.17, 1.5, 4]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** Farol del malecón: poste oscuro + cabeza ámbar que brilla */
function Lamp({
  position,
  mats,
}: {
  position: [number, number, number];
  mats: { metal: THREE.Material; farol: THREE.Material };
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} material={mats.metal} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 1.8, 6]} />
      </mesh>
      <mesh position={[0, 1.82, 0]} material={mats.metal} castShadow>
        <boxGeometry args={[0.34, 0.06, 0.34]} />
      </mesh>
      <mesh position={[0, 1.68, 0]} material={mats.farol}>
        <boxGeometry args={[0.22, 0.26, 0.22]} />
      </mesh>
    </group>
  );
}

/** Banca de madera mirando al río (+X) */
function Bench({
  position,
  mats,
}: {
  position: [number, number, number];
  mats: { wood: THREE.Material; woodDk: THREE.Material };
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.24, 0]} material={mats.wood} castShadow>
        <boxGeometry args={[0.5, 0.08, 1.3]} />
      </mesh>
      <mesh position={[-0.22, 0.5, 0]} rotation={[0, 0, 0.15]} material={mats.wood} castShadow>
        <boxGeometry args={[0.08, 0.5, 1.3]} />
      </mesh>
      <mesh position={[0.16, 0.12, -0.5]} material={mats.woodDk}>
        <boxGeometry args={[0.08, 0.24, 0.08]} />
      </mesh>
      <mesh position={[0.16, 0.12, 0.5]} material={mats.woodDk}>
        <boxGeometry args={[0.08, 0.24, 0.08]} />
      </mesh>
    </group>
  );
}

export default function MaleconQuibdo() {
  const sign = useMemo(makeSign, []);
  useEffect(() => () => sign.dispose(), [sign]);

  const mats = useMemo(() => {
    const mk = (
      color: string,
      roughness = 0.9,
      extra?: Partial<THREE.MeshStandardMaterialParameters>
    ) => {
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness,
        flatShading: true,
        ...extra,
      });
      applyReveal(m);
      return m;
    };
    return {
      tile: mk(TILE, 0.9),
      tileWarm: mk(TILE_WARM, 0.92),
      teal: mk(TEAL, 0.6),
      stoneDk: mk(STONE_DK, 0.95),
      white: mk(WHITE, 0.7),
      wood: mk(WOOD, 0.9),
      woodDk: mk(WOOD_DK, 0.95),
      metal: mk(METAL, 0.5, { metalness: 0.4 }),
      trunk: mk(PALM_TRUNK, 0.95),
      leaf: mk(PALM_LEAF, 0.85),
      farol: mk("#5b3814", 0.7, {
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 1.5,
        toneMapped: false,
      }),
      emerald: mk(EMERALD, 0.4, {
        emissive: new THREE.Color(EMERALD),
        emissiveIntensity: 0.7,
        toneMapped: false,
      }),
    };
  }, []);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const signMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: sign,
      emissive: new THREE.Color("#ffffff"),
      emissiveMap: sign,
      emissiveIntensity: 0.85,
      transparent: true,
      roughness: 0.6,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    applyReveal(m);
    return m;
  }, [sign]);
  useEffect(() => () => signMat.dispose(), [signMat]);

  // Arco de la cubierta: medio-toro en el plano XY (pie a pie sobre el ancho
  // del paseo, cúspide arriba). Un solo geo reutilizado por todos los arcos.
  const archGeo = useMemo(
    () => new THREE.TorusGeometry(ARCH_R, 0.06, 5, 20, Math.PI),
    []
  );
  useEffect(() => () => archGeo.dispose(), [archGeo]);

  // Posiciones a lo largo del paseo (Z local)
  const arches = useMemo(() => [-4, -2, 0, 2, 4], []);
  const miradores = useMemo(() => [-3, 0, 3], []);
  const lamps = useMemo(() => [-4.2, -1.4, 1.4, 4.2], []);
  const benches = useMemo(() => [-2, 2], []);
  const palms = useMemo(
    () =>
      [
        { z: -4.3, yaw: 0.3 },
        { z: 0, yaw: -0.4 },
        { z: 4.3, yaw: 0.2 },
      ] as const,
    []
  );
  // Balaustres de la baranda del malecón a lo largo de la orilla (X≈0)
  const railPosts = useMemo(() => {
    const out: number[] = [];
    for (let z = -PROM_HL + 0.4; z <= PROM_HL - 0.4; z += 0.9) out.push(z);
    return out;
  }, []);

  return (
    <group position={[MALECON_FRONT_X, 0, MALECON_Z]}>
      {/* Física: el carro sube al paseo y a los miradores; la bahía es agua */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[PROM_DEPTH / 2, 0.3, PROM_HL]}
          position={[DECK_CX, DECK_TOP - 0.3, 0]}
        />
        {miradores.map((z, i) => (
          <CuboidCollider
            key={i}
            args={[MIR_OUT / 2, 0.12, 0.9]}
            position={[MIR_OUT / 2, MIR_TOP - 0.12, z]}
          />
        ))}
      </RigidBody>

      {/* ===================== EL PASEO ===================== */}
      {/* zócalo bajo el enlosado (baja hasta el agua en el borde este) */}
      <mesh position={[DECK_CX, DECK_TOP - 0.35, 0]} material={mats.stoneDk} receiveShadow castShadow>
        <boxGeometry args={[PROM_DEPTH, 0.7, PROM_HL * 2]} />
      </mesh>
      {/* enlosado superior */}
      <mesh position={[DECK_CX, DECK_TOP, 0]} material={mats.tile} receiveShadow>
        <boxGeometry args={[PROM_DEPTH - 0.1, 0.08, PROM_HL * 2 - 0.1]} />
      </mesh>
      {/* franja teal junto a la orilla (el "río" del enlosado) */}
      <mesh position={[-0.35, DECK_TOP + 0.05, 0]} material={mats.teal}>
        <boxGeometry args={[0.5, 0.03, PROM_HL * 2 - 0.4]} />
      </mesh>
      {/* banda cálida interior (patrón de baldosas) */}
      <mesh position={[DECK_CX - 0.6, DECK_TOP + 0.05, 0]} material={mats.tileWarm}>
        <boxGeometry args={[0.7, 0.03, PROM_HL * 2 - 0.4]} />
      </mesh>

      {/* ===================== BARANDA DE LA ORILLA ===================== */}
      {/* pasamanos continuo blanco sobre la línea de agua */}
      <mesh position={[0, DECK_TOP + RAIL_TOP, 0]} material={mats.white} castShadow>
        <boxGeometry args={[0.1, 0.1, PROM_HL * 2]} />
      </mesh>
      <mesh position={[0, DECK_TOP + RAIL_TOP * 0.55, 0]} material={mats.white}>
        <boxGeometry args={[0.06, 0.06, PROM_HL * 2]} />
      </mesh>
      {railPosts.map((z, i) => (
        <mesh
          key={i}
          position={[0, DECK_TOP + RAIL_TOP / 2, z]}
          material={mats.white}
          castShadow
        >
          <boxGeometry args={[0.07, RAIL_TOP, 0.07]} />
        </mesh>
      ))}

      {/* ===================== ARCOS BLANCOS (la firma) ===================== */}
      {arches.map((z, i) => (
        <mesh
          key={i}
          geometry={archGeo}
          position={[DECK_CX, DECK_TOP, z]}
          material={mats.white}
          castShadow
        />
      ))}
      {/* viga cumbrera que une las cúspides de los arcos */}
      <mesh position={[DECK_CX, DECK_TOP + ARCH_R, 0]} material={mats.white} castShadow>
        <boxGeometry args={[0.09, 0.09, PROM_HL * 2 - 1]} />
      </mesh>

      {/* ===================== MIRADORES ===================== */}
      {miradores.map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          {/* plataforma que se asoma al río */}
          <mesh position={[MIR_OUT / 2, MIR_TOP - 0.06, 0]} material={mats.stoneDk} receiveShadow castShadow>
            <boxGeometry args={[MIR_OUT, 0.12, 1.8]} />
          </mesh>
          <mesh position={[MIR_OUT / 2, MIR_TOP + 0.01, 0]} material={mats.tileWarm} receiveShadow>
            <boxGeometry args={[MIR_OUT - 0.08, 0.04, 1.72]} />
          </mesh>
          {/* baranda en las 3 caras exteriores (N, E, S) */}
          <mesh position={[MIR_OUT, MIR_TOP + 0.42, 0]} material={mats.white} castShadow>
            <boxGeometry args={[0.08, 0.08, 1.8]} />
          </mesh>
          {[-0.9, 0.9].map((zz, k) => (
            <mesh key={k} position={[MIR_OUT / 2, MIR_TOP + 0.42, zz]} material={mats.white} castShadow>
              <boxGeometry args={[MIR_OUT, 0.08, 0.08]} />
            </mesh>
          ))}
          {/* postes de esquina */}
          {[
            [MIR_OUT, -0.9],
            [MIR_OUT, 0.9],
          ].map(([xx, zz], k) => (
            <mesh key={k} position={[xx, MIR_TOP + 0.21, zz]} material={mats.white}>
              <boxGeometry args={[0.08, 0.42, 0.08]} />
            </mesh>
          ))}
          {/* remate esmeralda en la punta del mirador */}
          <mesh position={[MIR_OUT - 0.05, MIR_TOP + 0.55, 0]} material={mats.emerald}>
            <boxGeometry args={[0.12, 0.12, 0.7]} />
          </mesh>
        </group>
      ))}

      {/* ===================== MOBILIARIO ===================== */}
      {lamps.map((z, i) => (
        <Lamp key={i} position={[-0.4, DECK_TOP, z]} mats={mats} />
      ))}
      {benches.map((z, i) => (
        <Bench key={i} position={[-0.95, DECK_TOP, z]} mats={mats} />
      ))}
      {palms.map((p, i) => (
        <Palm key={i} position={[DECK_CX - 1.1, GROUND, p.z]} yaw={p.yaw} mats={mats} />
      ))}

      {/* ===================== LETRERO DE ENTRADA (norte) ===================== */}
      {/* Pórtico legible al llegar desde el puente: "MALECÓN DE QUIBDÓ" a dos
          caras (se lee por delante y por detrás). */}
      <group position={[DECK_CX, 0, PROM_HL + 0.5]}>
        {[-PROM_DEPTH / 2 + 0.3, PROM_DEPTH / 2 - 0.3].map((x, i) => (
          <mesh key={i} position={[x, DECK_TOP + 1.25, 0]} material={mats.white} castShadow>
            <boxGeometry args={[0.18, 2.5, 0.18]} />
          </mesh>
        ))}
        <mesh position={[0, DECK_TOP + 2.15, 0]} material={mats.white} castShadow>
          <boxGeometry args={[PROM_DEPTH - 0.3, 0.9, 0.14]} />
        </mesh>
        <mesh position={[0, DECK_TOP + 2.18, 0.09]} material={signMat}>
          <planeGeometry args={[PROM_DEPTH - 0.6, 0.78]} />
        </mesh>
        <mesh position={[0, DECK_TOP + 2.18, -0.09]} rotation={[0, Math.PI, 0]} material={signMat}>
          <planeGeometry args={[PROM_DEPTH - 0.6, 0.78]} />
        </mesh>
      </group>
    </group>
  );
}
