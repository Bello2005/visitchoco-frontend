import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, PerspectiveCamera } from "@react-three/drei";
// import { OrbitControls } from "@react-three/drei"; // debug cam
import { Physics } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import ChocoTerrain from "./components/ChocoTerrain";
import RoadRibbon from "./components/RoadRibbon";
import TerritoryGateway from "./components/TerritoryGateway";
import ChirimiaPlaza from "./components/ChirimiaPlaza";
import MaleconQuibdo from "./components/MaleconQuibdo";
import MundoTouchControls from "./components/MundoTouchControls";
import ChirimiaAudio from "./components/ChirimiaAudio";
import VehicleAudio from "./components/VehicleAudio";
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
import AmbientDetail from "./components/AmbientDetail";
import PostFX from "./components/PostFX";
import QualityRuntime from "./components/QualityRuntime";
import { initQuality, probeRenderer, qualityState } from "./utils/qualityState";
import MundoQuality from "./components/MundoQuality";
import PerfProbe from "./components/PerfProbe";
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
  { name: "flip", keys: ["Space"] }, // enderezar el carro si vuelca
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

// Sondea WebGL Y, de paso, el nombre de la GPU, reutilizando el MISMO
// contexto: los navegadores limitan a ~16 contextos WebGL vivos, así que crear
// uno aparte sólo para clasificar la máquina sería un desperdicio.
function probeWebGL(): { ok: boolean; renderer: string | null } {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return { ok: false, renderer: null };
    return { ok: true, renderer: probeRenderer(gl) };
  } catch {
    return { ok: false, renderer: null };
  }
}

export default function Mundo() {
  const chassisRef = useRef<RapierRigidBody>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  // Sonda de rendimiento: sólo con #perf en la URL. Se lee una vez al montar.
  const [perfProbe] = useState(
    () => typeof location !== "undefined" && location.hash === "#perf"
  );
  // Sonda de GPU + nivel de calidad, resueltos UNA vez antes de montar el
  // Canvas (initQuality respeta lo que el usuario haya guardado).
  const [probe] = useState(probeWebGL);
  const [webglOk] = useState(() => probe.ok);
  const [initialDpr] = useState(() => {
    initQuality(probe.renderer);
    const [lo, hi] = qualityState.profile.dpr;
    return Math.min(hi, Math.max(lo, window.devicePixelRatio || 1));
  });
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
        {/* antialias:false a propósito y en TODOS los niveles: el
            EffectComposer renderiza a su propio target HalfFloat, así que el
            buffer MSAA del contexto WebGL nunca llega a la imagen final — es
            ancho de banda tirado. El AA que cuenta es `multisampling` del
            composer (o SMAA en gama baja). Como ni antialias ni
            powerPreference son diales, ningún cambio de calidad obliga a
            recrear el contexto WebGL. */}
        {/* dpr: valor INICIAL estable, calculado una vez desde el perfil
            resuelto. NO se puede pasar un literal `[1,1.5]`: sería un array
            nuevo en cada render de Mundo y R3F re-aplicaría la prop, pisando
            lo que QualityRuntime haya puesto. A partir del montaje,
            QualityRuntime es el ÚNICO dueño del dpr. */}
        <Canvas
          shadows
          dpr={initialDpr}
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#a5ddf2"]} />
          <fog attach="fog" args={["#a5ddf2", 34, 135]} />
          {/* Arranca YA detrás del carro (en el portal): con la posición fija
              vieja quedaba a ~23u de su destino y el lerp 0.06 tardaba una
              eternidad en llegar, con el portal visto de frente y desde el norte. */}
          <PerspectiveCamera
            makeDefault
            fov={45}
            position={[SPAWN_POS.x, 12, SPAWN_POS.z + 16]}
          />
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
          {/* Frío neutro, ya no lavanda: el violeta de la sombra ahora lo pone
              el shader (uShadowColor). Con el ambiente lavanda además, teñía
              dos veces. La intensidad la gobierna RevealController vía
              lightingProfile — el valor de acá es solo el inicial. */}
          <ambientLight ref={ambientRef} color="#93a7c4" intensity={0.18} />
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              <ChocoTerrain onReady={handleTerrainReady} />
              <OceanFloor />
              <Water />
              <Vehicle chassisRef={chassisRef} />
              {/* La Vía del Chocó: mesh dedicado de asfalto negro (no pintura
                  sobre el terreno). Dentro de Physics porque donde cruza agua
                  se vuelve PUENTE con colliders de deck propios; el carro pasa
                  por encima y la panga navega por debajo del canal abierto. */}
              <RoadRibbon />
              {/* EL PORTAL DEL CHOCÓ: plaza + arco de bienvenida en la punta
                  sur, donde nace la vía y spawnea el carro. Dentro de Physics
                  porque la plaza tiene collider (el carro cae sobre ella). */}
              <TerritoryGateway />
              {/* El DESTINO: plaza de la chirimía en el remate norte */}
              <ChirimiaPlaza />
              {/* QUIBDÓ: el Malecón del Atrato, a orillas del río */}
              <MaleconQuibdo />
            </Physics>
          </Suspense>
          {/* Vegetación en su PROPIO Suspense: la carga de los GLB de árboles
              no debe retrasar la señal "terreno listo" del loader */}
          <Suspense fallback={null}>
            <Vegetation />
          </Suspense>
          <MunicipalityLights />
          <Fauna />
          <AmbientDetail />
          {!reducedMotion && <IntroBeacon />}
          <ShadowRig directionalRef={directionalRef} />
          <FollowCamera target={chassisRef} />
          <RevealController
            directionalRef={directionalRef}
            ambientRef={ambientRef}
            reducedMotion={reducedMotion}
          />
          <FirstFrame onFirstFrame={handleFirstFrame} />
          {perfProbe && <PerfProbe />}
          <QualityRuntime />
          <PostFX />
        </Canvas>
      </KeyboardControls>
      <MundoMiniMap />
      <MundoAudio />
      {/* Oculto mientras el loader tapa la escena, igual que el botón de mute */}
      <MundoQuality visible={!loaderVisible} />
      {/* La chirimía arranca sola al pisar la plaza del norte */}
      <ChirimiaAudio />
      {/* Motor, rodadura, chapoteo y golpes — sintetizados en vivo */}
      <VehicleAudio />
      <MundoTouchControls />
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
