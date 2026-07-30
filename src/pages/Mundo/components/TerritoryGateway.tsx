import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import { roadCenterWorldX, GATEWAY_Z, GATEWAY_X } from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";

// EL PORTAL DEL CHOCÓ — el monumento de bienvenida en la punta sur, donde
// nace la Vía del Chocó y aparece el carro. Inspirado en la "entrada" del
// portafolio de Bruno Simon (un punto de partida con identidad): una plaza de
// piedra escalonada con el wordmark VisitChocó, un aro esmeralda que brilla, un
// ARCO por el que se conduce hacia el territorio y faroles ámbar de beacon.
// Todo se MATERIALIZA con el revelado (applyReveal) — como está en el centro
// del revelado (spawn), aparece PRIMERO y de él nace el mundo.
//
// Geometría 100% procedural low-poly (nada de modelos externos: el wordmark es
// tipografía propia sobre canvas, imposible de "encontrar" como asset, y las
// primitivas casan exacto con el estilo del diorama).

const GX = GATEWAY_X; // x de la plaza (centro de la vía)
// La explanada del terreno queda a cota de vía (~0.34); la plaza asoma como
// un escalón bajo (bordillo) — se lee como monumento y se sale conduciendo.
const PLAZA_TOP = 0.52;
const PLAZA_R = 4.6; // radio de la plaza (hex) — el carro (3.2 largo) cabe holgado
const ARCH_Z = GATEWAY_Z - 3.4; // el arco, hacia el norte de la plaza
const AX = roadCenterWorldX(ARCH_Z); // x del arco (centro de la vía ahí)
const POST_OUT = 2.1; // separación de los postes al centro de la vía
const POST_TOP = PLAZA_TOP + 3.4; // alto de los postes
// wordmark del piso DETRÁS del carro: la cámara va al sur, así que ahí queda
// en primer plano y se lee entero (delante del carro lo tapaba el chasis).
const MARK_Z = GATEWAY_Z + 2.4;

// Paleta VisitChocó
const STONE = "#5d564a"; // piedra cálida
const STONE_DARK = "#463f36"; // piedra en sombra (base)
const WOOD = "#6e4a28"; // madera de los postes
const WOOD_DARK = "#241d15"; // madera del tablero
const EMERALD = "#37b26a"; // acento esmeralda (aro)
const AMBER = "#ffb347"; // farol / beacon

// Wordmark "VisitChocó" dibujado en un canvas → textura nítida sin depender de
// @font-face del sitio (serif del sistema, siempre disponible). Fondo
// transparente: solo el texto (y su acento) queda, ideal para emissiveMap.
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
  // línea esmeralda superior
  ctx.strokeStyle = EMERALD;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, 56);
  ctx.lineTo(w * 0.7, 56);
  ctx.stroke();
  // wordmark
  ctx.fillStyle = "#f6ecd6";
  ctx.font = '600 148px Georgia, "Times New Roman", serif';
  ctx.fillText("VisitChocó", w / 2, h / 2 + 12);
  // subtítulo
  ctx.fillStyle = "#b9d9c4";
  ctx.font = '500 34px Georgia, serif';
  ctx.fillText("E L   T E R R I T O R I O", w / 2, h - 40);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export default function TerritoryGateway() {
  const wordmark = useMemo(makeWordmark, []);
  useEffect(() => () => wordmark.dispose(), [wordmark]);

  // Material del wordmark (emissiveMap → brilla en la penumbra del intro y el
  // Bloom lo prende). toneMapped false para que el crema no se apague.
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

  // Los 6 bolardos del perímetro (esquinas del hexágono de la plaza)
  const bollards = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      out.push([GX + Math.cos(a) * (PLAZA_R - 0.35), GATEWAY_Z + Math.sin(a) * (PLAZA_R - 0.35)]);
    }
    return out;
  }, []);

  return (
    <group>
      {/* ---- PLAZA: física (el carro spawnea y descansa aquí) ---- */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider
          args={[1.3, PLAZA_R]}
          position={[GX, PLAZA_TOP - 1.3, GATEWAY_Z]}
        />
      </RigidBody>

      {/* base ancha escalonada (hexagonal low-poly) */}
      <mesh position={[GX, PLAZA_TOP - 0.9, GATEWAY_Z]} receiveShadow castShadow>
        <cylinderGeometry args={[PLAZA_R, PLAZA_R + 0.35, 1.8, 6]} />
        <meshStandardMaterial
          color={STONE_DARK}
          roughness={0.98}
          flatShading
          ref={(m) => m && applyReveal(m, { groundDetail: true })}
        />
      </mesh>
      {/* tier superior (donde se pisa) */}
      <mesh position={[GX, PLAZA_TOP - 0.14, GATEWAY_Z]} receiveShadow castShadow>
        <cylinderGeometry args={[PLAZA_R - 0.45, PLAZA_R, 0.3, 6]} />
        <meshStandardMaterial
          color={STONE}
          roughness={0.95}
          flatShading
          ref={(m) => m && applyReveal(m, { groundDetail: true })}
        />
      </mesh>

      {/* aro esmeralda embutido en el piso (brilla) */}
      <mesh
        position={[GX, PLAZA_TOP + 0.02, GATEWAY_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[PLAZA_R - 1.0, 0.07, 8, 40]} />
        <meshStandardMaterial
          color={EMERALD}
          emissive={EMERALD}
          emissiveIntensity={0.9}
          roughness={0.4}
          toneMapped={false}
          ref={(m) => m && applyReveal(m)}
        />
      </mesh>

      {/* wordmark en el piso. Con -π/2 en X el "arriba" del texto cae al NORTE
          (-Z) y su derecha al ESTE (+X): justo como lo ve la cámara asentada,
          que va detrás del carro (al SUR) mirando al norte. */}
      <mesh
        position={[GX, PLAZA_TOP + 0.03, MARK_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={signMat}
      >
        <planeGeometry args={[5.4, 1.7]} />
      </mesh>

      {/* bolardos del perímetro */}
      {bollards.map(([bx, bz], i) => (
        <mesh key={i} position={[bx, PLAZA_TOP + 0.18, bz]} castShadow>
          <cylinderGeometry args={[0.13, 0.16, 0.55, 6]} />
          <meshStandardMaterial
            color={STONE}
            roughness={0.95}
            flatShading
            ref={(m) => m && applyReveal(m)}
          />
        </mesh>
      ))}

      {/* ---- ARCO DE BIENVENIDA (se conduce por debajo hacia el norte) ---- */}
      {[-1, 1].map((dir) => (
        <group key={dir}>
          {/* poste */}
          <mesh
            position={[AX + dir * POST_OUT, (PLAZA_TOP + POST_TOP) / 2, ARCH_Z]}
            castShadow
          >
            <boxGeometry args={[0.34, POST_TOP - PLAZA_TOP, 0.34]} />
            <meshStandardMaterial
              color={WOOD}
              roughness={0.9}
              flatShading
              ref={(m) => m && applyReveal(m)}
            />
          </mesh>
          {/* farol ámbar (beacon) sobre el poste */}
          <mesh position={[AX + dir * POST_OUT, POST_TOP + 0.22, ARCH_Z]}>
            <boxGeometry args={[0.26, 0.34, 0.26]} />
            <meshStandardMaterial
              color="#5b3814"
              emissive={AMBER}
              emissiveIntensity={1.6}
              toneMapped={false}
              ref={(m) => m && applyReveal(m)}
            />
          </mesh>
        </group>
      ))}
      {/* travesaño */}
      <mesh position={[AX, POST_TOP + 0.02, ARCH_Z]} castShadow>
        <boxGeometry args={[POST_OUT * 2 + 0.5, 0.42, 0.42]} />
        <meshStandardMaterial
          color={WOOD}
          roughness={0.9}
          flatShading
          ref={(m) => m && applyReveal(m)}
        />
      </mesh>
      {/* tablero oscuro del letrero (respaldo) */}
      <mesh position={[AX, POST_TOP - 0.62, ARCH_Z]} castShadow>
        <boxGeometry args={[POST_OUT * 2 + 0.1, 1.15, 0.16]} />
        <meshStandardMaterial
          color={WOOD_DARK}
          roughness={0.95}
          flatShading
          ref={(m) => m && applyReveal(m)}
        />
      </mesh>
      {/* wordmark del letrero por las DOS caras: al SUR (+z) para quien está
          en la plaza, y al NORTE (-z, girado π) para quien vuelve del
          territorio — antes esa cara era un tablón negro. */}
      <mesh
        position={[AX, POST_TOP - 0.62, ARCH_Z + 0.1]}
        material={signMat}
      >
        <planeGeometry args={[POST_OUT * 2 - 0.1, 1.02]} />
      </mesh>
      <mesh
        position={[AX, POST_TOP - 0.62, ARCH_Z - 0.1]}
        rotation={[0, Math.PI, 0]}
        material={signMat}
      >
        <planeGeometry args={[POST_OUT * 2 - 0.1, 1.02]} />
      </mesh>
    </group>
  );
}
