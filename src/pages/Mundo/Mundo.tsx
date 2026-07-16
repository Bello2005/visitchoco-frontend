import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
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

const controlsMap = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "reset", keys: ["KeyR"] },
];

export default function Mundo() {
  const chassisRef = useRef<RapierRigidBody>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  // Overlay de instrucción: visible hasta el primer doble click,
  // fade-out de 0.5s y unmount.
  const [hintVisible, setHintVisible] = useState(true);
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
              <ChocoTerrain />
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
          />
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} intensity={0.7} mipmapBlur />
            <Vignette darkness={0.65} />
            <Noise opacity={0.025} />
          </EffectComposer>
        </Canvas>
      </KeyboardControls>
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
