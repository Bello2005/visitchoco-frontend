import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import { NORTH_X, NORTH_Z } from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";

// LA PLAZA DE LA CHIRIMÍA — el remate norte de la Vía del Chocó, el DESTINO
// del viaje. Más grande y más celebratoria que el portal de entrada.
//
// La pieza central es una TARIMA DE CHIRIMÍA con techo de palma: la chirimía
// chocoana (bombo, redoblante, platillos y clarinete) es el alma de las
// fiestas de San Pacho, patrimonio del Chocó. Es la imagen más honesta del
// territorio — no la marimba de chonta, que pertenece más al Pacífico sur.
//
// Todo procedural low-poly, y todo con applyReveal para materializarse con
// el mundo.

const PLAZA_R = 6.0; // bastante mayor que el portal (4.6)
/** Radio de la plaza: ChirimiaAudio lo usa para saber cuándo suena la música */
export const CHIRIMIA_PLAZA_R = PLAZA_R;
const PLAZA_TOP = 0.52; // misma cota que el portal → se conduce parejo
const DAIS_R = 2.7; // tarima
const DAIS_TOP = PLAZA_TOP + 0.42;
const POST_R_POS = 2.3; // radio donde se plantan los parales del kiosko
// Parales ALTOS y techo CORTO: con el kiosko bajo y el alero ancho, desde la
// cámara elevada el techo tapaba por completo los instrumentos.
const POST_TOP = DAIS_TOP + 3.2;

const STONE = "#5d564a";
const STONE_DARK = "#463f36";
const GUADUA = "#c0a55d";
const PALMA = "#6b5a33"; // techo de palma seca
const PALMA_DARK = "#57492a";
const CUERO = "#e6dcc4"; // parche de cuero de los tambores
const MADERA = "#7a5230"; // casco de madera de los tambores
const BRONCE = "#d9a441"; // platillos
const EMERALD = "#37b26a";
const AMBER = "#ffb347";

// Wordmark del piso (canvas → textura, sin depender de fuentes remotas)
function makeWordmark(): THREE.CanvasTexture {
  const w = 1024;
  const h = 320;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = EMERALD;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.32, 56);
  ctx.lineTo(w * 0.68, 56);
  ctx.stroke();
  ctx.fillStyle = "#f6ecd6";
  ctx.font = '600 152px Georgia, "Times New Roman", serif';
  ctx.fillText("Chocó", w / 2, h / 2 + 14);
  ctx.fillStyle = "#b9d9c4";
  ctx.font = '500 32px Georgia, serif';
  ctx.fillText("T I E R R A   D E   C H I R I M Í A", w / 2, h - 38);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Un tambor de chirimía: casco de madera + dos parches de cuero */
function Tambor({
  position,
  radius,
  height,
  rotation = 0,
  mats,
}: {
  position: [number, number, number];
  radius: number;
  height: number;
  rotation?: number;
  mats: { madera: THREE.Material; cuero: THREE.Material };
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh material={mats.madera} castShadow>
        <cylinderGeometry args={[radius, radius * 0.92, height, 10]} />
      </mesh>
      <mesh position={[0, height / 2 + 0.01, 0]} material={mats.cuero}>
        <cylinderGeometry args={[radius * 1.04, radius * 1.04, 0.05, 10]} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.01, 0]} material={mats.cuero}>
        <cylinderGeometry args={[radius * 0.96, radius * 0.96, 0.05, 10]} />
      </mesh>
    </group>
  );
}

export default function ChirimiaPlaza() {
  const wordmark = useMemo(makeWordmark, []);
  useEffect(() => () => wordmark.dispose(), [wordmark]);

  // Materiales compartidos (un applyReveal por material)
  const mats = useMemo(() => {
    const mk = (color: string, roughness = 0.9, extra?: Partial<THREE.MeshStandardMaterialParameters>) => {
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
      stone: mk(STONE, 0.95),
      stoneDark: mk(STONE_DARK, 0.98),
      guadua: mk(GUADUA, 0.85),
      palma: mk(PALMA, 1),
      palmaDark: mk(PALMA_DARK, 1),
      madera: mk(MADERA, 0.9),
      cuero: mk(CUERO, 0.8),
      bronce: mk(BRONCE, 0.35, { metalness: 0.5 }),
      farol: mk("#5b3814", 0.8, {
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 1.6,
        toneMapped: false,
      }),
      aro: mk(EMERALD, 0.4, {
        emissive: new THREE.Color(EMERALD),
        emissiveIntensity: 0.9,
        toneMapped: false,
      }),
    };
  }, []);
  useEffect(
    () => () => Object.values(mats).forEach((m) => m.dispose()),
    [mats]
  );

  const signMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: wordmark,
      emissive: new THREE.Color("#ffffff"),
      emissiveMap: wordmark,
      emissiveIntensity: 0.85,
      transparent: true,
      roughness: 0.6,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    applyReveal(m);
    return m;
  }, [wordmark]);
  useEffect(() => () => signMat.dispose(), [signMat]);

  // Parales del kiosko + totems del perímetro
  const posts = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return [Math.cos(a) * POST_R_POS, Math.sin(a) * POST_R_POS] as const;
      }),
    []
  );
  const totems = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return [Math.cos(a) * (PLAZA_R - 0.7), Math.sin(a) * (PLAZA_R - 0.7)] as const;
      }),
    []
  );

  return (
    <group position={[NORTH_X, 0, NORTH_Z]}>
      {/* Física: el carro llega, sube a la plaza y rodea la tarima */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[1.3, PLAZA_R]} position={[0, PLAZA_TOP - 1.3, 0]} />
        {/* la tarima frena al carro (no se le atraviesa a los tambores) */}
        <CylinderCollider args={[0.42, DAIS_R]} position={[0, DAIS_TOP - 0.42, 0]} />
      </RigidBody>

      {/* --- PLAZA en dos gradas --- */}
      <mesh position={[0, PLAZA_TOP - 0.9, 0]} material={mats.stoneDark} receiveShadow castShadow>
        <cylinderGeometry args={[PLAZA_R, PLAZA_R + 0.4, 1.8, 8]} />
      </mesh>
      <mesh position={[0, PLAZA_TOP - 0.14, 0]} material={mats.stone} receiveShadow castShadow>
        <cylinderGeometry args={[PLAZA_R - 0.5, PLAZA_R, 0.3, 8]} />
      </mesh>

      {/* aro esmeralda + wordmark del piso, entre la tarima y el borde */}
      <mesh position={[0, PLAZA_TOP + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.aro}>
        <torusGeometry args={[PLAZA_R - 1.1, 0.07, 8, 48]} />
      </mesh>
      <mesh
        position={[0, PLAZA_TOP + 0.03, PLAZA_R - 2.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={signMat}
      >
        <planeGeometry args={[5.6, 1.75]} />
      </mesh>

      {/* --- TARIMA DE CHIRIMÍA --- */}
      <mesh position={[0, DAIS_TOP - 0.21, 0]} material={mats.madera} receiveShadow castShadow>
        <cylinderGeometry args={[DAIS_R, DAIS_R + 0.12, 0.42, 8]} />
      </mesh>

      {/* parales de guadua + techo de palma cónico en dos aguas */}
      {posts.map(([px, pz], i) => (
        <mesh
          key={i}
          position={[px, (DAIS_TOP + POST_TOP) / 2, pz]}
          material={mats.guadua}
          castShadow
        >
          <cylinderGeometry args={[0.1, 0.11, POST_TOP - DAIS_TOP, 6]} />
        </mesh>
      ))}
      <mesh position={[0, POST_TOP + 0.46, 0]} material={mats.palma} castShadow>
        <coneGeometry args={[POST_R_POS + 0.55, 1.15, 8]} />
      </mesh>
      <mesh position={[0, POST_TOP + 1.12, 0]} material={mats.palmaDark} castShadow>
        <coneGeometry args={[POST_R_POS * 0.5, 0.85, 8]} />
      </mesh>

      {/* --- LOS INSTRUMENTOS --- */}
      {/* bombo: el tambor grande que manda en la chirimía */}
      <Tambor
        position={[0, DAIS_TOP + 0.62, -0.35]}
        radius={0.72}
        height={0.95}
        rotation={0.3}
        mats={mats}
      />
      {/* redoblante */}
      <Tambor
        position={[1.35, DAIS_TOP + 0.35, 0.75]}
        radius={0.42}
        height={0.42}
        rotation={-0.4}
        mats={mats}
      />
      {/* cununo */}
      <Tambor
        position={[-1.4, DAIS_TOP + 0.45, 0.7]}
        radius={0.34}
        height={0.75}
        rotation={0.8}
        mats={mats}
      />
      {/* platillos sobre su pie */}
      <group position={[0.15, DAIS_TOP, 1.5]}>
        <mesh position={[0, 0.5, 0]} material={mats.guadua} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 1.0, 6]} />
        </mesh>
        <mesh position={[0, 1.02, 0]} rotation={[0.12, 0, 0.08]} material={mats.bronce} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.03, 12]} />
        </mesh>
      </group>

      {/* --- TOTEMS DE GUADUA CON FAROL ÁMBAR EN EL PERÍMETRO --- */}
      {totems.map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, PLAZA_TOP + 0.75, 0]} material={mats.guadua} castShadow>
            <cylinderGeometry args={[0.09, 0.1, 1.5, 6]} />
          </mesh>
          <mesh position={[0, PLAZA_TOP + 1.62, 0]} material={mats.farol}>
            <boxGeometry args={[0.24, 0.3, 0.24]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
