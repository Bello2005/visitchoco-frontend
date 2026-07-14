import { Suspense, useRef } from "react";
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

const controlsMap = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "reset", keys: ["KeyR"] },
];

export default function Mundo() {
  const chassisRef = useRef<RapierRigidBody>(null);

  return (
    <div style={{ width: "100%", height: "100dvh", background: "#020d1a" }}>
      <KeyboardControls map={controlsMap}>
        <Canvas>
          <color attach="background" args={["#020d1a"]} />
          <fog attach="fog" args={["#020d1a", 22, 60]} />
          <PerspectiveCamera makeDefault fov={45} position={[0, 18, 26]} />
          {/* <OrbitControls enablePan={false} minDistance={12} maxDistance={45} maxPolarAngle={Math.PI / 2.2} enableDamping /> debug cam */}
          <directionalLight color="#ffb347" intensity={0.9} position={[10, 20, 5]} />
          <ambientLight intensity={0.25} />
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
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} intensity={0.7} mipmapBlur />
            <Vignette darkness={0.65} />
            <Noise opacity={0.025} />
          </EffectComposer>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
