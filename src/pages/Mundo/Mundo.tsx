import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import ChocoTerrain from "./components/ChocoTerrain";
import OceanFloor from "./components/OceanFloor";

export default function Mundo() {
  return (
    <div style={{ width: "100%", height: "100dvh", background: "#020d1a" }}>
      <Canvas>
        <color attach="background" args={["#020d1a"]} />
        <fog attach="fog" args={["#020d1a", 30, 70]} />
        <PerspectiveCamera makeDefault fov={45} position={[0, 18, 26]} />
        <OrbitControls
          enablePan={false}
          minDistance={12}
          maxDistance={45}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping
          target={[0, 0, 0]}
        />
        <directionalLight color="#ffb347" intensity={0.6} position={[10, 20, 5]} />
        <ambientLight intensity={0.15} />
        <Suspense fallback={null}>
          <ChocoTerrain />
          <OceanFloor />
        </Suspense>
      </Canvas>
    </div>
  );
}
