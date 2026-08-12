import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RigidBody, ConvexHullCollider } from "@react-three/rapier";
import {
  roadCenterWorldX,
  GATEWAY_Z,
  GATEWAY_X,
  GATEWAY_PLAZA_R,
  GATEWAY_PLAZA_TOP,
  GATEWAY_PLAZA_APOTHEM,
  SLIPWAY_YAW,
  SLIPWAY_U0,
  slipwayPoint,
} from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";
import { makeBrandCanvasTexture, fitText, tracked } from "../utils/brandTexture";

// EL PORTAL DEL CHOCÓ — plaza-muelle de la punta sur, donde nace la Vía del
// Chocó, aparece el carro y EMPIEZA EL AGUA.
//
// La versión anterior era un hexágono con un vértice apuntando al sur: un pico
// contra la bahía, sin salida legible. Ahora el hexágono va GIRADO 30° para
// presentar una CARA PLANA al sur — esa cara es la BOCA DEL VARADERO, y de ella
// arranca la rampa por la que el carro baja al agua y se vuelve panga.
//
// La forma tiene que hacer el trabajo que antes no hacía nadie: decir "por aquí
// se navega" sin una sola línea de texto. Por eso el hueco en la barandilla, los
// galones que laten hacia el agua y la piedra que se prolonga cuesta abajo.
//
// Geometría 100% procedural low-poly. El wordmark es tipografía de marca
// (Fraunces) sobre canvas — ver utils/brandTexture.
//
// REGLAS APRENDIDAS A GOLPES (no deshacer sin leer esto):
//  · La piedra de la rampa es LA MISMA que la de la plaza, solo más clara. Lo
//    que separa dos piezas contiguas es el VALOR, no un material nuevo: un
//    hormigón frío o una madera distinta rompen el diorama.
//  · En la losa de la rampa NADA más fino que ~20 px de textura y CERO grano:
//    vista casi de canto hierve el mipmap y "parpadea negro".
//  · Emisivas lejos de 1.0 (el umbral del Bloom): justo ahí titilan.
//  · Todo material pasa por applyReveal o se ve durante la intro a oscuras.

const GX = GATEWAY_X;
const PLAZA_TOP = GATEWAY_PLAZA_TOP;
const PLAZA_R = GATEWAY_PLAZA_R; // circunradio (a los vértices)
const APOTHEM = GATEWAY_PLAZA_APOTHEM; // a las caras — la cara sur va aquí
// Giro que pone una CARA (no un vértice) enfrentada al varadero. El +π/6 pasa
// de "vértice al frente" a "cara al frente"; el SLIPWAY_YAW la alinea con el
// rumbo real de la rampa, para que la boca sea una cara entera y no una esquina.
const HEX_THETA = Math.PI / 6 + SLIPWAY_YAW;

const ARCH_Z = GATEWAY_Z - 4.6; // el arco, hacia el norte de la plaza
const AX = roadCenterWorldX(ARCH_Z);
const POST_OUT = 2.4;
const POST_TOP = PLAZA_TOP + 3.6;

// Paleta VisitChocó — piedra cálida en tres valores, madera del arco, y los dos
// acentos con papeles FIJOS: ámbar = monumento, esmeralda = "por aquí se va".
// UNA SOLA PIEDRA EN CUATRO VALORES. El portal y el varadero son la misma
// cantera: zócalo → cornisa → tarima → calzada de la rampa → bordillo forman
// UNA escalera de valor continua (46 → 5d → 6f → 7e → 94). Cuando la rampa se
// pintó de un beige claro aparte, plaza y varadero se leían como dos obras
// distintas pegadas. Lo que separa piezas contiguas es el VALOR, nunca un
// material nuevo. Los valores de la rampa se exportan para que Slipway no los
// vuelva a inventar.
const STONE = "#5d564a"; // piedra cálida (cornisa)
const STONE_DARK = "#463f36"; // zócalo en sombra
const STONE_DECK = "#6f6757"; // la cara que se pisa
export const STONE_RAMP = "#7e7563"; // calzada del varadero (un paso al sol)
export const STONE_KERB = "#948977"; // bordillo (el valor más alto)
export const STONE_SKIRT = "#554e42"; // falda exterior, en sombra
export const STONE_WET = "#46554e"; // piedra bajo el agua
const WOOD = "#6e4a28"; // madera de los postes
const WOOD_DARK = "#241d15"; // madera del tablero
const EMERALD = "#37b26a";
const AMBER = "#ffb347";

/** Vértices del hexágono a un radio dado (mismo giro que la geometría). */
function hexPoints(r: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = HEX_THETA + (i / 6) * Math.PI * 2;
    out.push([Math.sin(a) * r, Math.cos(a) * r]);
  }
  return out;
}

/**
 * Textura del piso de la plaza: wordmark + rosa de los vientos.
 *
 * Todo se dibuja GRANDE a propósito. Un adoquinado de juntas finas es
 * justo lo que hierve cuando la cámara mira el suelo de canto, así que el
 * despiece de la piedra lo dan los tres escalones, no una textura.
 */
function drawDeck(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cx = w / 2;

  // ---- rosa de los vientos, al NORTE del centro (arriba en la textura) ----
  const rcy = h * 0.3;
  const rr = w * 0.088;
  ctx.strokeStyle = "rgba(246,236,214,0.5)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, rcy, rr, 0, Math.PI * 2);
  ctx.stroke();
  // aguja: la punta al norte en esmeralda, la cola en crema
  ctx.beginPath();
  ctx.moveTo(cx, rcy - rr * 1.35);
  ctx.lineTo(cx - rr * 0.3, rcy);
  ctx.lineTo(cx + rr * 0.3, rcy);
  ctx.closePath();
  ctx.fillStyle = EMERALD;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, rcy + rr * 1.35);
  ctx.lineTo(cx - rr * 0.3, rcy);
  ctx.lineTo(cx + rr * 0.3, rcy);
  ctx.closePath();
  ctx.fillStyle = "rgba(246,236,214,0.72)";
  ctx.fill();
  ctx.fillStyle = "rgba(246,236,214,0.8)";
  fitText(ctx, "N", 700, 60, w);
  ctx.fillText("N", cx, rcy - rr * 1.75);

  // ---- wordmark, en el tercio sur (queda en primer plano para la cámara) ----
  ctx.strokeStyle = EMERALD;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.16, h * 0.545);
  ctx.lineTo(cx + w * 0.16, h * 0.545);
  ctx.stroke();

  ctx.fillStyle = "#f6ecd6";
  fitText(ctx, "VisitChocó", 600, 190, w * 0.62);
  ctx.fillText("VisitChocó", cx, h * 0.63);

  ctx.fillStyle = "#b9d9c4";
  const sub = tracked("EL TERRITORIO");
  fitText(ctx, sub, 500, 48, w * 0.5);
  ctx.fillText(sub, cx, h * 0.712);
}

/**
 * Pictograma del embarcadero: carro → panga. Un icono explica la
 * transformación mucho antes que una frase, y funciona en cualquier idioma.
 * Trazo grueso a propósito (mismo motivo que el resto: nada fino).
 */
function drawFerrySign(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cream = "#f6ecd6";
  const y = h * 0.36; // línea de los iconos
  const u = w / 1024; // 1 unidad = 1 px a 1024 de ancho

  // --- carro (izquierda) ---
  ctx.fillStyle = cream;
  const carX = w * 0.2;
  ctx.beginPath();
  ctx.roundRect(carX - 78 * u, y - 18 * u, 156 * u, 32 * u, 7 * u);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(carX - 44 * u, y - 42 * u, 88 * u, 26 * u, 7 * u);
  ctx.fill();
  for (const dx of [-46, 46]) {
    ctx.beginPath();
    ctx.arc(carX + dx * u, y + 18 * u, 15 * u, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- flecha (centro) ---
  ctx.strokeStyle = EMERALD;
  ctx.lineWidth = 13 * u;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(w * 0.4, y);
  ctx.lineTo(w * 0.52, y);
  ctx.stroke();
  ctx.fillStyle = EMERALD;
  ctx.beginPath();
  ctx.moveTo(w * 0.575, y);
  ctx.lineTo(w * 0.515, y - 24 * u);
  ctx.lineTo(w * 0.515, y + 24 * u);
  ctx.closePath();
  ctx.fill();

  // --- panga (derecha): casco de canoa, proa y popa levantadas ---
  ctx.fillStyle = cream;
  const boatX = w * 0.79;
  ctx.beginPath();
  ctx.moveTo(boatX - 88 * u, y - 14 * u);
  ctx.quadraticCurveTo(boatX, y + 42 * u, boatX + 88 * u, y - 14 * u);
  ctx.quadraticCurveTo(boatX, y + 10 * u, boatX - 88 * u, y - 14 * u);
  ctx.closePath();
  ctx.fill();
  // línea de agua bajo la panga
  ctx.strokeStyle = "#7fd8e8";
  ctx.lineWidth = 10 * u;
  ctx.beginPath();
  ctx.moveTo(boatX - 100 * u, y + 36 * u);
  ctx.lineTo(boatX + 100 * u, y + 36 * u);
  ctx.stroke();

  // --- texto ---
  ctx.fillStyle = cream;
  fitText(ctx, "EMBARCADERO", 600, 96, w * 0.84);
  ctx.fillText("EMBARCADERO", w / 2, h * 0.66);
  ctx.fillStyle = "#b9d9c4";
  const sub = "baja al agua y navega";
  fitText(ctx, sub, 500, 52, w * 0.82);
  ctx.fillText(sub, w / 2, h * 0.83);
}

export default function TerritoryGateway() {
  // ---- texturas ----
  const deckTex = useMemo(() => makeBrandCanvasTexture(2048, 2048, drawDeck), []);
  useEffect(() => () => deckTex.dispose(), [deckTex]);

  const signTex = useMemo(
    () =>
      makeBrandCanvasTexture(1024, 640, (c, w, h) => {
        c.clearRect(0, 0, w, h);
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.strokeStyle = EMERALD;
        c.lineWidth = 6;
        c.beginPath();
        c.moveTo(w * 0.3, h * 0.16);
        c.lineTo(w * 0.7, h * 0.16);
        c.stroke();
        c.fillStyle = "#f6ecd6";
        fitText(c, "VisitChocó", 600, 190, w * 0.84);
        c.fillText("VisitChocó", w / 2, h * 0.46);
        c.fillStyle = "#b9d9c4";
        const sub = tracked("EL TERRITORIO");
        fitText(c, sub, 500, 44, w * 0.8);
        c.fillText(sub, w / 2, h * 0.74);
      }),
    []
  );
  useEffect(() => () => signTex.dispose(), [signTex]);

  const ferryTex = useMemo(() => makeBrandCanvasTexture(1024, 768, drawFerrySign), []);
  useEffect(() => () => ferryTex.dispose(), [ferryTex]);

  // ---- materiales de texto (emisivos: brillan en la penumbra del intro) ----
  const deckMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: deckTex,
      emissive: new THREE.Color("#ffffff"),
      emissiveMap: deckTex,
      emissiveIntensity: 0.55,
      transparent: true,
      roughness: 0.75,
      depthWrite: false,
      toneMapped: false,
    });
    applyReveal(m);
    return m;
  }, [deckTex]);
  useEffect(() => () => deckMat.dispose(), [deckMat]);

  const signMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: new THREE.Color("#ffffff"),
      emissiveMap: signTex,
      emissiveIntensity: 0.85,
      transparent: true,
      roughness: 0.6,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    applyReveal(m);
    return m;
  }, [signTex]);
  useEffect(() => () => signMat.dispose(), [signMat]);

  const ferryMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: ferryTex,
      emissive: new THREE.Color("#ffffff"),
      emissiveMap: ferryTex,
      emissiveIntensity: 0.8,
      transparent: true,
      roughness: 0.6,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    applyReveal(m);
    return m;
  }, [ferryTex]);
  useEffect(() => () => ferryMat.dispose(), [ferryMat]);

  // ---- casco de colisión: el PRISMA hexagonal de verdad ----
  // Con un CylinderCollider al circunradio el carro rodaba ~0.8u más allá del
  // canto visible (iba sobre el aire); con uno al apotema se caía en los
  // vértices. El casco convexo de los 12 puntos es exacto en los dos sitios.
  const hullPoints = useMemo(() => {
    const pts: number[] = [];
    for (const [x, z] of hexPoints(PLAZA_R)) {
      pts.push(x, PLAZA_TOP, z);
      pts.push(x, PLAZA_TOP - 2.4, z);
    }
    return new Float32Array(pts);
  }, []);

  // ---- bolardos: en las 5 caras que NO son la boca del agua ----
  // El hueco del sur es el signifier: una barandilla continua diría "aquí se
  // acaba"; el vano dice "por aquí se sale".
  const bollards = useMemo(() => {
    const out: [number, number][] = [];
    // rumbo de la boca (hacia el varadero), en el plano XZ
    const mouthX = Math.sin(SLIPWAY_YAW);
    const mouthZ = Math.cos(SLIPWAY_YAW);
    for (let i = 0; i < 6; i++) {
      // punto medio de cada cara = apotema en el ángulo entre dos vértices
      const a = HEX_THETA + ((i + 0.5) / 6) * Math.PI * 2;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      // la cara que mira al varadero queda ABIERTA: el vano es el signifier
      if (dx * mouthX + dz * mouthZ > 0.8) continue;
      out.push([GX + dx * APOTHEM * 0.94, GATEWAY_Z + dz * APOTHEM * 0.94]);
    }
    return out;
  }, []);

  // Cartel del embarcadero: al OESTE de la boca. Con la cámara del spawn
  // (screen-right ≈ (0.921,-0.389)·(dx,dz)) el lado este se va del cuadro por
  // abajo-derecha; el oeste entra por el borde izquierdo, que es donde se lee.
  const signPos = useMemo(() => slipwayPoint(SLIPWAY_U0 - 2.6, 5.0), []);

  return (
    <group>
      {/* ---- PLAZA: física ---- */}
      <RigidBody type="fixed" colliders={false} position={[GX, 0, GATEWAY_Z]}>
        <ConvexHullCollider args={[hullPoints]} />
      </RigidBody>

      {/* Zócalo (el valor más oscuro: asienta la pieza).
          Baja hasta -2.35, POR DEBAJO del lecho marino (-2). El cuadrante
          suroeste de la plaza vuela sobre agua honda, y con el zócalo acabando
          en -1.5 se veía POR DEBAJO del monumento: la base parecía hueca y el
          carro que se salía por ahí caía al vacío. Del lado de tierra el exceso
          queda enterrado, así que no cuesta nada. */}
      <mesh position={[GX, PLAZA_TOP - 1.78, GATEWAY_Z]} receiveShadow castShadow>
        <cylinderGeometry
          args={[PLAZA_R + 0.3, PLAZA_R + 0.6, 2.2, 6, 1, false, HEX_THETA]}
        />
        <meshStandardMaterial
          color={STONE_DARK}
          roughness={0.98}
          flatShading
          ref={(m) => m && applyReveal(m, { groundDetail: true })}
        />
      </mesh>

      {/* cornisa biselada: el escalón intermedio que da sombra propia */}
      <mesh position={[GX, PLAZA_TOP - 0.49, GATEWAY_Z]} receiveShadow castShadow>
        <cylinderGeometry
          args={[PLAZA_R, PLAZA_R + 0.34, 0.42, 6, 1, false, HEX_THETA]}
        />
        <meshStandardMaterial
          color={STONE}
          roughness={0.96}
          flatShading
          ref={(m) => m && applyReveal(m, { groundDetail: true })}
        />
      </mesh>

      {/* tarima: la cara que se pisa */}
      <mesh position={[GX, PLAZA_TOP - 0.14, GATEWAY_Z]} receiveShadow>
        <cylinderGeometry
          args={[PLAZA_R - 0.05, PLAZA_R, 0.28, 6, 1, false, HEX_THETA]}
        />
        <meshStandardMaterial
          color={STONE_DECK}
          roughness={0.94}
          flatShading
          ref={(m) => m && applyReveal(m, { groundDetail: true })}
        />
      </mesh>

      {/* grafismo del piso (wordmark + rosa de los vientos) */}
      <mesh
        position={[GX, PLAZA_TOP + 0.05, GATEWAY_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={deckMat}
        renderOrder={2}
      >
        <planeGeometry args={[APOTHEM * 1.92, APOTHEM * 1.92]} />
      </mesh>

      {/* aro esmeralda embutido */}
      <mesh position={[GX, PLAZA_TOP + 0.03, GATEWAY_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[PLAZA_R - 1.5, 0.08, 8, 48]} />
        <meshStandardMaterial
          color={EMERALD}
          emissive={EMERALD}
          emissiveIntensity={0.9}
          roughness={0.4}
          toneMapped={false}
          ref={(m) => m && applyReveal(m)}
        />
      </mesh>

      {/* Los galones de dirección viven en Slipway: son de la rampa, no de la
          plaza. Aquí cruzaban el aro esmeralda y el wordmark. */}

      {/* bolardos (5 caras; la de la boca queda abierta) */}
      {bollards.map(([bx, bz], i) => (
        <mesh key={i} position={[bx, PLAZA_TOP + 0.28, bz]} castShadow>
          <cylinderGeometry args={[0.15, 0.19, 0.72, 6]} />
          <meshStandardMaterial
            color={STONE}
            roughness={0.95}
            flatShading
            ref={(m) => m && applyReveal(m)}
          />
        </mesh>
      ))}

      {/* PILOTES: las esquinas sur de la plaza vuelan sobre la bahía. Se apoyan
          en pilotes de madera —palafito chocoano— y la línea de flotación los
          marca: el efecto solo funciona en superficies VERTICALES, y aquí sí. */}
      {[-1, 1].map((dir) => {
        const [px, pz] = slipwayPoint(APOTHEM * 0.72, dir * PLAZA_R * 0.52);
        return (
          <mesh key={dir} position={[px, PLAZA_TOP - 1.9, pz]} castShadow>
            <cylinderGeometry args={[0.2, 0.24, 2.6, 7]} />
            <meshStandardMaterial
              color={WOOD}
              roughness={0.92}
              flatShading
              ref={(m) => m && applyReveal(m, { waterline: true })}
            />
          </mesh>
        );
      })}

      {/* ---- ARCO DE BIENVENIDA (se conduce por debajo hacia el norte) ---- */}
      {[-1, 1].map((dir) => (
        <group key={dir}>
          <mesh
            position={[AX + dir * POST_OUT, (PLAZA_TOP + POST_TOP) / 2, ARCH_Z]}
            castShadow
          >
            <boxGeometry args={[0.36, POST_TOP - PLAZA_TOP, 0.36]} />
            <meshStandardMaterial
              color={WOOD}
              roughness={0.9}
              flatShading
              ref={(m) => m && applyReveal(m)}
            />
          </mesh>
          <mesh position={[AX + dir * POST_OUT, POST_TOP + 0.24, ARCH_Z]}>
            <boxGeometry args={[0.28, 0.36, 0.28]} />
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
      <mesh position={[AX, POST_TOP + 0.02, ARCH_Z]} castShadow>
        <boxGeometry args={[POST_OUT * 2 + 0.55, 0.44, 0.44]} />
        <meshStandardMaterial
          color={WOOD}
          roughness={0.9}
          flatShading
          ref={(m) => m && applyReveal(m)}
        />
      </mesh>
      <mesh position={[AX, POST_TOP - 0.68, ARCH_Z]} castShadow>
        <boxGeometry args={[POST_OUT * 2 + 0.1, 1.25, 0.16]} />
        <meshStandardMaterial
          color={WOOD_DARK}
          roughness={0.95}
          flatShading
          ref={(m) => m && applyReveal(m)}
        />
      </mesh>
      <mesh position={[AX, POST_TOP - 0.68, ARCH_Z + 0.1]} material={signMat}>
        <planeGeometry args={[POST_OUT * 2 - 0.1, 1.12]} />
      </mesh>
      <mesh
        position={[AX, POST_TOP - 0.68, ARCH_Z - 0.1]}
        rotation={[0, Math.PI, 0]}
        material={signMat}
      >
        <planeGeometry args={[POST_OUT * 2 - 0.1, 1.12]} />
      </mesh>

      {/* ---- CARTEL DEL EMBARCADERO ----
          Plantado al costado de la boca, girado hacia quien está en la plaza.
          Encima de la rampa quedaría de canto desde la cámara del spawn
          (ángulo fijo (0.3,0.64,0.71)) y sería ilegible. */}
      {/* Plantado al COSTADO de la rampa, ya dentro del encuadre del spawn
          gracias al giro del varadero. Sobre la calzada quedaría de canto e
          ilegible desde el ángulo fijo de la cámara. */}
      <group
        position={[signPos[0], 0, signPos[1]]}
        rotation={[0, SLIPWAY_YAW + 0.75, 0]}
      >
        {[-1, 1].map((dir) => (
          <mesh key={dir} position={[dir * 1.24, PLAZA_TOP + 0.5, 0]} castShadow>
            <boxGeometry args={[0.19, 2.9, 0.19]} />
            <meshStandardMaterial
              color={WOOD}
              roughness={0.9}
              flatShading
              ref={(m) => m && applyReveal(m, { waterline: true })}
            />
          </mesh>
        ))}
        <mesh position={[0, PLAZA_TOP + 1.62, 0]} castShadow>
          <boxGeometry args={[2.92, 2.05, 0.13]} />
          <meshStandardMaterial
            color={WOOD_DARK}
            roughness={0.95}
            flatShading
            ref={(m) => m && applyReveal(m)}
          />
        </mesh>
        <mesh position={[0, PLAZA_TOP + 1.62, 0.09]} material={ferryMat}>
          <planeGeometry args={[2.74, 1.92]} />
        </mesh>
      </group>
    </group>
  );
}
