import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  WATER_LEVEL,
  SLIPWAY_U0,
  SLIPWAY_U1,
  SLIPWAY_UW,
  SLIPWAY_YAW,
  SLIPWAY_HALF_W,
  slipwayHeightAt,
  slipwayPoint,
  worldGround,
  whenHeightFieldReady,
} from "./ChocoTerrain";
import { makeCanoeGeometry } from "./Vehicle";
import {
  STONE_RAMP,
  STONE_KERB,
  STONE_SKIRT,
  STONE_WET,
} from "./TerritoryGateway";
import { applyReveal } from "../utils/applyReveal";

// EL VARADERO — la rampa de botadura del portal.
//
// La pendiente REAL ya está tallada en el terreno (ChocoTerrain.slipwayCarve):
// el heightfield, el collider trimesh y el umbral carro↔panga ven todos la misma
// cota. Esto de aquí es la OBRA que se ve encima: la losa, los bordillos, las
// bitas y la panga varada. Por eso no lleva colliders — el suelo ya está.
//
// DIRECCIÓN DE ARTE (dos intentos fallidos antes de esta):
//  · Todo madera café → se leía vieja al lado de una plaza que ya es madera.
//  · Hormigón claro + acero frío → "se ve horrible": en un diorama de verdes
//    saturados un gris frío no dice obra nueva, dice lona tendida.
//  · La que funciona: LA PLAZA QUE SIGUE HASTA EL AGUA. Misma piedra cálida,
//    subida de valor porque está al sol y mojada abajo. Lo que separa dos
//    piezas contiguas es el VALOR, no un material nuevo.
//
// Y la regla de oro de esta losa: NADA fino. Vista casi de canto, cualquier
// junta, grano o filete de menos de ~20 px hierve en el mipmap y "parpadea
// negro". Todo el despiece lo dan el bordillo y el color, cero textura.

// Los valores VIENEN DEL PORTAL: son la misma cantera, un paso más al sol. No
// declarar aquí una paleta propia — así fue como plaza y rampa acabaron
// leyéndose como dos obras distintas pegadas la una a la otra.
//
// OJO al calibrar: el renderer trabaja en LINEAL. De #8a7d68 a #a2937a hay 1.6×
// de luz y a ojo parecen el mismo beige — se pierde muchísimo tiempo adivinando.
// Truco: poner el albedo en #ffffff y mirar. Si sale claro es cuestión de valor
// y se interpola; si sale oscuro, el problema es la NORMAL, no el color.
const CALZADA = new THREE.Color(STONE_RAMP);
const BORDILLO = new THREE.Color(STONE_KERB);
const FALDA = new THREE.Color(STONE_SKIRT);
const MOJADO = new THREE.Color(STONE_WET);
const HIERRO = "#39414a"; // bitas
const WOOD = "#6e4a28"; // madera del arco, la misma
const EMERALD = "#37b26a";

const HALF = SLIPWAY_HALF_W;

/**
 * Perfil transversal del varadero, en (dx, dy) respecto al eje y a la cota
 * tallada. Se barre a lo largo de Z.
 *
 * Los bordillos van EN EL MISMO barrido que la calzada, no como cajas sueltas:
 * una fila de cajas inclinadas se lee como una escalera negra bajando al agua,
 * y además cada junta es una arista fina más que puede hervir.
 */
const PROFILE: [number, number][] = [
  [-(HALF + 0.55), -0.45], // falda exterior, enterrada en la arena
  [-(HALF + 0.55), 0.26], // alto del bordillo
  [-(HALF + 0.14), 0.26], // huella del bordillo
  [-(HALF + 0.14), 0.05], // canto interior
  [HALF + 0.14, 0.05], // calzada
  [HALF + 0.14, 0.26],
  [HALF + 0.55, 0.26],
  [HALF + 0.55, -0.45],
];

/** Color de cada tramo del perfil (uno por par de puntos consecutivos). */
const SEGMENT_COLORS = [FALDA, BORDILLO, BORDILLO, CALZADA, BORDILLO, BORDILLO, FALDA];

/**
 * Barrido del perfil a lo largo de la rampa.
 *
 * Cada tramo del perfil recibe SUS PROPIAS filas de vértices (duplicadas en las
 * fronteras). Con un solo anillo compartido, computeVertexNormals promedia la
 * normal de la calzada con la del bordillo y la losa entera queda mal iluminada
 * — oscura y muerta por más que se le suba el albedo. Suave a lo largo, arista
 * viva a lo ancho.
 */
function buildSlipwayGeometry(): THREE.BufferGeometry {
  const STATIONS = 30;
  const u0 = SLIPWAY_U0 - 0.35; // se mete bajo el labio de la plaza
  const u1 = SLIPWAY_U1;

  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const c = new THREE.Color();

  for (let s = 0; s < PROFILE.length - 1; s++) {
    const [ax, ay] = PROFILE[s];
    const [bx, by] = PROFILE[s + 1];
    const base = pos.length / 3;

    for (let i = 0; i <= STATIONS; i++) {
      const t = i / STATIONS;
      const u = u0 + (u1 - u0) * t;
      const ground = slipwayHeightAt(u);

      for (const [dv, dy] of [
        [ax, ay],
        [bx, by],
      ]) {
        const y = ground + dy;
        const [px, pz] = slipwayPoint(u, dv);
        pos.push(px, y, pz);
        // La piedra se apaga y enfría bajo la línea de agua. Es un degradado
        // por VÉRTICE: cero textura, cero riesgo de hervor.
        const wet = 1 - THREE.MathUtils.clamp((y - WATER_LEVEL + 0.35) / 0.7, 0, 1);
        c.copy(SEGMENT_COLORS[s]).lerp(MOJADO, wet);
        col.push(c.r, c.g, c.b);
      }
    }

    // Winding: mirando desde +Y, el orden tiene que ser antihorario o three
    // descarta la cara buena y solo se ve el envés (losa invisible, sin un solo
    // error en consola). Estación LEJANA primero, luego la cercana.
    for (let i = 0; i < STATIONS; i++) {
      const a = base + i * 2; // borde A, estación i
      const b = base + i * 2 + 1; // borde B, estación i
      const a2 = base + (i + 1) * 2; // borde A, estación i+1
      const b2 = base + (i + 1) * 2 + 1;
      idx.push(a2, b2, a);
      idx.push(b2, b, a);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export default function Slipway() {
  const geo = useMemo(buildSlipwayGeometry, []);
  useEffect(() => () => geo.dispose(), [geo]);

  const canoeGeo = useMemo(makeCanoeGeometry, []);
  useEffect(() => () => canoeGeo.dispose(), [canoeGeo]);

  // La panga varada se apoya en el suelo REAL, así que hay que esperar a que la
  // malla publique el heightfield: worldGround cae al terrainHeight crudo (sin
  // rampa de playa) si se pregunta antes, y la canoa queda flotando.
  const [canoe, setCanoe] = useState<{ x: number; y: number; z: number } | null>(null);
  useEffect(() => {
    let alive = true;
    whenHeightFieldReady().then(() => {
      if (!alive) return;
      const [x, z] = slipwayPoint(SLIPWAY_U0 + 1.8, -(HALF + 2.6));
      setCanoe({ x, y: worldGround(x, z) - 0.24, z });
    });
    return () => {
      alive = false;
    };
  }, []);

  // ---- GALONES de dirección ----
  // Viven en la RAMPA, entre la boca y la línea de agua: fuera del aro
  // esmeralda de la plaza, que es donde se leían como barras verdes encima del
  // wordmark. Pulsan en secuencia hacia el agua — el ojo sigue el movimiento y
  // encuentra el varadero sin leer una palabra. Es GEOMETRÍA emisiva, no
  // textura animada: cero riesgo de hervor en una losa vista de canto.
  const chevronGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.62, 0);
    s.lineTo(0, 0.4);
    s.lineTo(0.62, 0);
    s.lineTo(0.62, -0.15);
    s.lineTo(0, 0.25);
    s.lineTo(-0.62, -0.15);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useEffect(() => () => chevronGeo.dispose(), [chevronGeo]);

  // Repartidos por el tramo SECO (boca → línea de agua). Cada uno se asienta a
  // la cota de la losa y se INCLINA con la pendiente: planos y horizontales
  // sobre una rampa se ven despegados por el canto de abajo.
  const chevrons = useMemo(() => {
    const out: { x: number; y: number; z: number; pitch: number }[] = [];
    const n = 3;
    const from = SLIPWAY_U0 + 0.45;
    const to = SLIPWAY_UW - 0.2;
    for (let i = 0; i < n; i++) {
      const u = from + ((to - from) * i) / (n - 1);
      const [x, z] = slipwayPoint(u, 0);
      const slope = slipwayHeightAt(u + 0.4) - slipwayHeightAt(u - 0.4);
      out.push({
        x,
        // +0.05 de la losa (dy de la calzada) + 0.02 para no pelear con ella
        y: slipwayHeightAt(u) + 0.07,
        z,
        pitch: Math.atan(slope / 0.8),
      });
    }
    return out;
  }, []);

  const chevronMats = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < chevronMats.current.length; i++) {
      const m = chevronMats.current[i];
      if (!m) continue;
      // onda que viaja hacia el agua; nunca toca 1.0 (umbral del Bloom)
      const phase = (t * 1.15 - i * 0.42) % 2.4;
      const pulse = phase < 1 ? Math.sin(phase * Math.PI) : 0;
      m.emissiveIntensity = 0.14 + pulse * 0.42;
    }
  });

  // Bitas de amarre: en la huella del bordillo, a la cabecera.
  const bitas = useMemo(() => {
    const out: { x: number; y: number; z: number }[] = [];
    for (const side of [-1, 1]) {
      for (const du of [0.9, 3.4]) {
        const u = SLIPWAY_U0 + du;
        const [x, z] = slipwayPoint(u, side * (HALF + 0.34));
        out.push({ x, y: slipwayHeightAt(u) + 0.42, z });
      }
    }
    return out;
  }, []);

  return (
    <group>
      {/* LOSA: solo receiveShadow. Con castShadow se sombrea a sí misma y las
          bandas titilan cuando ShadowRig mueve la cámara de sombras con el
          carro. Sin flatShading por el mismo motivo. */}
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.95}
          // El MISMO groundDetail que la meseta de la plaza: sin él la losa
          // queda lisa al lado de una piedra moteada y se leen como materiales
          // distintos aunque el color sea idéntico.
          ref={(m) => m && applyReveal(m, { groundDetail: true })}
        />
      </mesh>

      {/* GALONES: el grupo lleva el rumbo (yaw sobre Y de mundo) y la malla
          interior el cabeceo (X local, ya cruzado a la rampa). Compuesto en un
          solo Euler el orden importa y sale torcido. */}
      {chevrons.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} rotation={[0, Math.PI + SLIPWAY_YAW, 0]}>
          <mesh geometry={chevronGeo} rotation={[c.pitch, 0, 0]}>
            <meshStandardMaterial
              color={EMERALD}
              emissive={EMERALD}
              emissiveIntensity={0.3}
              roughness={0.45}
              toneMapped={false}
              ref={(m) => {
                if (!m) return;
                chevronMats.current[i] = m;
                applyReveal(m);
              }}
            />
          </mesh>
        </group>
      ))}

      {/* BITAS de hierro */}
      {bitas.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.34, 8]} />
          <meshStandardMaterial
            color={HIERRO}
            roughness={0.6}
            metalness={0.35}
            flatShading
            ref={(m) => m && applyReveal(m, { waterline: true })}
          />
        </mesh>
      ))}

      {/* BALIZAS del canal: dos pilotes al pie, con capirote esmeralda. Marcan
          por dónde se sale a navegar cuando ya se está en el agua. */}
      {[-1, 1].map((side) => {
        const u = SLIPWAY_U1 - 2.6;
        const [bx, bz] = slipwayPoint(u, side * (HALF + 0.45));
        const g = slipwayHeightAt(u);
        return (
          <group key={side} position={[bx, 0, bz]}>
            <mesh position={[0, (g + WATER_LEVEL + 1.1) / 2, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.16, WATER_LEVEL + 1.1 - g, 7]} />
              <meshStandardMaterial
                color={WOOD}
                roughness={0.92}
                flatShading
                ref={(m) => m && applyReveal(m, { waterline: true })}
              />
            </mesh>
            <mesh position={[0, WATER_LEVEL + 1.24, 0]}>
              <coneGeometry args={[0.19, 0.34, 7]} />
              <meshStandardMaterial
                color={EMERALD}
                emissive={EMERALD}
                emissiveIntensity={0.85}
                roughness={0.45}
                toneMapped={false}
                ref={(m) => m && applyReveal(m)}
              />
            </mesh>
          </group>
        );
      })}

      {/* PANGA VARADA al costado: dice "aquí se botan las canoas" sin una letra */}
      {canoe && (
        <mesh
          geometry={canoeGeo}
          position={[canoe.x, canoe.y, canoe.z]}
          rotation={[0.05, SLIPWAY_YAW + 1.15, 0.07]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#7c4a1e"
            roughness={0.9}
            flatShading
            ref={(m) => m && applyReveal(m, { waterline: true })}
          />
        </mesh>
      )}
    </group>
  );
}
