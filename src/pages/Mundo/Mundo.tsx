import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, PerspectiveCamera, Stars } from "@react-three/drei";
// import { OrbitControls } from "@react-three/drei"; // debug cam
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import ChocoTerrain from "./components/ChocoTerrain";
import OceanFloor from "./components/OceanFloor";
import Water from "./components/Water";
import Vehicle from "./components/Vehicle";
import FollowCamera from "./components/FollowCamera";
import MunicipalityLights from "./components/MunicipalityLights";
import RevealController from "./components/RevealController";
import MundoLoader from "./components/MundoLoader";
import { revealUniforms, REVEAL_MAX } from "./utils/revealUniforms";

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

  useEffect(() => {
    if (!(terrainReady && firstFrame)) return;
    const fadeTimer = setTimeout(() => setLoaderFading(true), 300);
    const unmountTimer = setTimeout(() => setLoaderVisible(false), 900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [terrainReady, firstFrame]);

  // Overlay de instrucción: visible hasta el primer doble click (nunca
  // con reduced-motion — el mundo nace revelado, sin ritual).
  const [hintVisible, setHintVisible] = useState(!reducedMotion);
  const [hintFading, setHintFading] = useState(false);

  useEffect(() => {
    const onReveal = () => {
      setHintFading(true);
      setTimeout(() => setHintVisible(false), 500);
      window.removeEventListener("mundo:reveal", onReveal);
    };
    window.addEventListener("mundo:reveal", onReveal);
    return () => window.removeEventListener("mundo:reveal", onReveal);
  }, []);

  // reduced-motion: nacer con el territorio revelado (las luces siguen
  // al progreso en RevealController).
  useEffect(() => {
    if (reducedMotion) revealUniforms.uRevealRadius.value = REVEAL_MAX;
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
        background: "#020d1a",
        position: "relative",
      }}
    >
      <KeyboardControls map={controlsMap}>
        <Canvas>
          <color attach="background" args={["#020d1a"]} />
          <fog attach="fog" args={["#020d1a", 22, 60]} />
          <PerspectiveCamera makeDefault fov={45} position={[0, 18, 26]} />
          {/* <OrbitControls enablePan={false} minDistance={12} maxDistance={45} maxPolarAngle={Math.PI / 2.2} enableDamping /> debug cam */}
          {/* Penumbra inicial; RevealController las sube con el progreso
              del revelado hasta 0.9 / 0.25 */}
          <directionalLight
            ref={directionalRef}
            color="#ffb347"
            intensity={0.25}
            position={[10, 20, 5]}
          />
          <ambientLight ref={ambientRef} intensity={0.08} />
          <Stars radius={100} depth={40} count={1200} factor={3} fade />
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              <ChocoTerrain onReady={handleTerrainReady} />
              <OceanFloor />
              <Water />
              <Vehicle chassisRef={chassisRef} />
            </Physics>
          </Suspense>
          <MunicipalityLights />
          <FollowCamera target={chassisRef} />
          <RevealController
            directionalRef={directionalRef}
            ambientRef={ambientRef}
            reducedMotion={reducedMotion}
          />
          <FirstFrame onFirstFrame={handleFirstFrame} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} intensity={0.7} mipmapBlur />
            <Vignette darkness={0.65} />
            <Noise opacity={0.025} />
          </EffectComposer>
        </Canvas>
      </KeyboardControls>
      {loaderVisible && <MundoLoader fading={loaderFading} />}
      {hintVisible && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-[10%] flex justify-center transition-opacity duration-500 ${
            hintFading ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="font-sans text-sm tracking-wide text-white/60 md:text-base">
            Doble click para despertar el territorio
          </p>
        </div>
      )}
    </div>
  );
}
