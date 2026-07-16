import { RigidBody } from "@react-three/rapier";
import { applyReveal } from "../utils/applyReveal";

// El carro no lo atraviesa; el comportamiento "agua" llega en fase posterior.
export default function OceanFloor() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color="#04121f"
          ref={(m) => {
            if (m) applyReveal(m);
          }}
        />
      </mesh>
    </RigidBody>
  );
}
