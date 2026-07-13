export default function OceanFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#04121f" />
    </mesh>
  );
}
