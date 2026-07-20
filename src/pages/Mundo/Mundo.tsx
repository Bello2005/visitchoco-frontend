import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, PerspectiveCamera } from "@react-three/drei";
// import { OrbitControls } from "@react-three/drei"; // debug cam
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import ChocoTerrain from "./components/ChocoTerrain";
import RoadRibbon from "./components/RoadRibbon";
import OceanFloor from "./components/OceanFloor";
import Water from "./components/Water";
import Vehicle from "./components/Vehicle";
import Vegetation from "./components/Vegetation";
import FollowCamera from "./components/FollowCamera";
import MunicipalityLights from "./components/MunicipalityLights";
import RevealController from "./components/RevealController";
import IntroBeacon from "./components/IntroBeacon";
import ShadowRig from "./components/ShadowRig";
import Fauna from "./components/Fauna";
import MundoMiniMap from "./components/MundoMiniMap";
import MundoAudio from "./components/MundoAudio";
import MundoLoader from "./components/MundoLoader";
import { SPAWN_POS } from "./components/Vehicle";
import {
  startIntro,
  wakeTerritory,
  revealAll,
  setRevealCenter,
} from "./utils/revealUniforms";

const controlsMap = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "reset", keys: ["KeyR"] },
];

// Dispara el callback en el PRIMER frame renderizado del canvas —
// segunda señal real (junto a onReady del terreno) para retirar el loader.
function FirstFrame({ onFirstFrame }: { onFirstFrame: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (!fired.current) {
      fired.current = true;
      onFirstFrame();
    }
  });
  return null;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Mundo() {
  const chassisRef = useRef<RapierRigidBody>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  const [webglOk] = useState(detectWebGL);
  const [reducedMotion] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );

  // Loader: se retira con DOS señales reales — terreno construido y
  // primer frame renderizado. 300ms de gracia, fade 600ms, unmount.
  const [terrainReady, setTerrainReady] = useState(false);
  const [firstFrame, setFirstFrame] = useState(false);
  const [loaderFading, setLoaderFading] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);

  const handleTerrainReady = useCallback(() => setTerrainReady(true), []);
  const handleFirstFrame = useCallback(() => setFirstFrame(true), []);

  // Centro del revelado = spawn (xz). reduced-motion: mundo nace revelado.
  const introStarted = useRef(false);
  useEffect(() => {
    setRevealCenter(SPAWN_POS.x, SPAWN_POS.z);
    if (reducedMotion) revealAll();
  }, [reducedMotion]);

  // Loader → DESPERTAR: con las dos señales reales (terreno + primer frame)
  // se retira el loader y el mundo queda DORMIDO — oscuridad, un punto de luz
  // ámbar en el spawn y el hint. Nada más existe todavía.
  useEffect(() => {
    if (!(terrainReady && firstFrame)) return;
    const fadeTimer = setTimeout(() => setLoaderFading(true), 300);
    const unmountTimer = setTimeout(() => setLoaderVisible(false), 900);
    if (!reducedMotion && !introStarted.current) {
      introStarted.current = true;
      startIntro();
    }
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [terrainReady, firstFrame, reducedMotion]);

  // Interacción (clic, doble clic o tecla de movimiento): la línea dorada
  // traza el círculo alrededor del punto y el territorio EXPLOTA mientras
  // amanece. wakeTerritory solo actúa en fase "asleep" (una sola vez).
  const [hintVisible, setHintVisible] = useState(!reducedMotion);
  const [hintFading, setHintFading] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const onReveal = () => {
      setHintFading(true);
      setTimeout(() => setHintVisible(false), 500);
    };
    const onInteract = () => {
      if (!introStarted.current) return;
      wakeTerritory();
    };
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", "Space", "ArrowUp", "KeyW"].includes(e.code)) onInteract();
    };
    window.addEventListener("mundo:reveal", onReveal);
    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mundo:reveal", onReveal);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onKey);
    };
  }, [reducedMotion]);

  // Título del documento mientras se está en /mundo
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "El territorio — VisitChocó";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  if (!webglOk) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ width: "100%", height: "100dvh", background: "#020d1a" }}
      >
        <h1 className="font-serif text-2xl text-white md:text-3xl">
          El territorio necesita WebGL
        </h1>
        <p className="max-w-md text-sm text-white/60">
          Tu navegador no soporta la experiencia 3D. Puedes seguir
          explorando el Chocó en el mapa interactivo.
        </p>
        <a
          href="/mapa"
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white
                     px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200
                     shadow-lg shadow-emerald-900/30"
        >
          Explorar el mapa
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        background: "#a5ddf2",
        position: "relative",
      }}
    >
      <KeyboardControls map={controlsMap}>
        <Canvas shadows>
          <color attach="background" args={["#a5ddf2"]} />
          <fog attach="fog" args={["#a5ddf2", 34, 135]} />
          <PerspectiveCamera makeDefault fov={45} position={[0, 18, 26]} />
          {/* <OrbitControls enablePan={false} minDistance={12} maxDistance={45} maxPolarAngle={Math.PI / 2.2} enableDamping /> debug cam */}
          {/* Día estilo folio-2025: sol salmón #ffd2c2 con sombras reales.
              Amanecer tenue inicial; RevealController sube con el progreso
              del revelado hasta 1.35 / 0.6 */}
          {/* La cámara de sombras la gobierna ShadowRig: pequeña (±17) y
              siguiendo al carro → sombras nítidas (el "piso pixelado" era
              el shadow map estirado sobre todo el mapa) */}
          <directionalLight
            ref={directionalRef}
            color="#ffd2c2"
            intensity={0.55}
            position={[18, 28, 10]}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.001}
            shadow-normalBias={0.05}
          />
          {/* Ambiente lavanda: en sombra solo queda esta luz → sombras
              violetas, el truco del shadowColor #6d3fff de Bruno */}
          <ambientLight ref={ambientRef} color="#b9c3f5" intensity={0.3} />
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              <ChocoTerrain onReady={handleTerrainReady} />
              <OceanFloor />
              <Water />
              <Vehicle chassisRef={chassisRef} />
            </Physics>
          </Suspense>
          {/* La Vía del Chocó: mesh dedicado de asfalto negro (no pintura sobre
              el terreno). Fuera de Physics — solo visual; el suelo bajo la vía
              ya está aplanado en worldGround, que gobierna la conducción. */}
          <RoadRibbon />
          {/* Vegetación en su PROPIO Suspense: la carga de los GLB de árboles
              no debe retrasar la señal "terreno listo" del loader */}
          <Suspense fallback={null}>
            <Vegetation />
          </Suspense>
          <MunicipalityLights />
          <Fauna />
          {!reducedMotion && <IntroBeacon />}
          <ShadowRig directionalRef={directionalRef} />
          <FollowCamera target={chassisRef} />
          <RevealController
            directionalRef={directionalRef}
            ambientRef={ambientRef}
            reducedMotion={reducedMotion}
          />
          <FirstFrame onFirstFrame={handleFirstFrame} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} intensity={0.7} mipmapBlur />
            <Vignette darkness={0.4} />
            <Noise opacity={0.025} />
          </EffectComposer>
        </Canvas>
      </KeyboardControls>
      <MundoMiniMap />
      <MundoAudio />
      {loaderVisible && <MundoLoader fading={loaderFading} />}
      {hintVisible && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-[10%] flex justify-center transition-opacity duration-500 ${
            hintFading ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="font-sans text-sm tracking-[0.18em] text-white/80 drop-shadow-[0_1px_6px_rgba(255,179,71,0.25)] md:text-base">
            Un territorio duerme — haz clic para despertarlo
          </p>
        </div>
      )}
    </div>
  );
}
