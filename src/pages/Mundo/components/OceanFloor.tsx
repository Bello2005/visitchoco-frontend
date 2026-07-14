import { RigidBody } from "@react-three/rapier";

// El carro no lo atraviesa; el comportamiento "agua" llega en fase posterior.
export default function OceanFloor() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#04121f" />
      </mesh>
    </RigidBody>
  );
}
