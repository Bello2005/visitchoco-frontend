import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import {
  CuboidCollider,
  RigidBody,
  useBeforePhysicsStep,
  useRapier,
} from "@react-three/rapier";
import type { RapierRigidBody, RapierContext } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import { terrainHeight, WIDTH } from "./ChocoTerrain";

type VehicleController = ReturnType<
  RapierContext["world"]["createVehicleController"]
>;

// Spawn en el valle del Atrato (centro-norte). Recordar: world Z = -y local.
const SPAWN_X = 0.12 * (WIDTH / 2);
const SPAWN_LOCAL_Y = 8;
const SPAWN_POS = {
  x: SPAWN_X,
  y: terrainHeight(SPAWN_X, SPAWN_LOCAL_Y) + 3,
  z: -SPAWN_LOCAL_Y,
};

const CHASSIS_HALF: [number, number, number] = [0.9, 0.35, 1.6];
const WHEEL_RADIUS = 0.32;
const SUSPENSION_REST = 0.35;

// Puntos de anclaje de las ruedas (esquinas del chasis). Frente = +Z.
// Índices 0-1 delanteras (dirección), 2-3 traseras (tracción).
const WHEELS: [number, number, number][] = [
  [-0.8, -0.25, 1.2],
  [0.8, -0.25, 1.2],
  [-0.8, -0.25, -1.2],
  [0.8, -0.25, -1.2],
];

const ENGINE_FORWARD = 45;
const ENGINE_REVERSE = -30;
const MAX_STEER = 0.55;

interface VehicleProps {
  chassisRef: RefObject<RapierRigidBody | null>;
}

export default function Vehicle({ chassisRef }: VehicleProps) {
  const { world } = useRapier();
  const vehicleRef = useRef<VehicleController | null>(null);
  const steering = useRef(0);
  const [, getKeys] = useKeyboardControls();

  useEffect(() => {
    const chassis = chassisRef.current;
    if (!chassis) return;

    const vehicle = world.createVehicleController(chassis);
    for (const [x, y, z] of WHEELS) {
      vehicle.addWheel(
        { x, y, z },
        { x: 0, y: -1, z: 0 },
        { x: -1, y: 0, z: 0 },
        SUSPENSION_REST,
        WHEEL_RADIUS
      );
    }
    for (let i = 0; i < WHEELS.length; i++) {
      vehicle.setWheelSuspensionStiffness(i, 24);
      vehicle.setWheelMaxSuspensionTravel(i, 0.5);
      vehicle.setWheelSuspensionCompression(i, 1.4);
      vehicle.setWheelSuspensionRelaxation(i, 2.3);
    }
    vehicleRef.current = vehicle;

    return () => {
      world.removeVehicleController(vehicle);
      vehicleRef.current = null;
    };
  }, [world, chassisRef]);

  useBeforePhysicsStep((stepWorld) => {
    const vehicle = vehicleRef.current;
    const chassis = chassisRef.current;
    if (!vehicle || !chassis) return;

    const { forward, backward, left, right, reset } = getKeys();

    // Reset manual (R) o anti-caída fuera del diorama
    if (reset || chassis.translation().y < -5) {
      chassis.setTranslation(SPAWN_POS, true);
      chassis.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
      steering.current = 0;
    }

    const engineForce = forward ? ENGINE_FORWARD : backward ? ENGINE_REVERSE : 0;
    vehicle.setWheelEngineForce(2, engineForce);
    vehicle.setWheelEngineForce(3, engineForce);

    const targetSteer = left ? MAX_STEER : right ? -MAX_STEER : 0;
    steering.current = THREE.MathUtils.lerp(steering.current, targetSteer, 0.1);
    vehicle.setWheelSteering(0, steering.current);
    vehicle.setWheelSteering(1, steering.current);

    vehicle.updateVehicle(stepWorld.timestep);
  });

  return (
    <RigidBody
      ref={chassisRef}
      colliders={false}
      position={[SPAWN_POS.x, SPAWN_POS.y, SPAWN_POS.z]}
      canSleep={false}
    >
      <CuboidCollider args={CHASSIS_HALF} mass={120} />
      {/* Placeholder visual — el modelo real llega en fase posterior */}
      <mesh>
        <boxGeometry
          args={[CHASSIS_HALF[0] * 2, CHASSIS_HALF[1] * 2, CHASSIS_HALF[2] * 2]}
        />
        <meshStandardMaterial flatShading color="#d97706" />
      </mesh>
      {WHEELS.map(([x, , z], i) => (
        <mesh key={i} position={[x, -0.45, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.24, 12]} />
          <meshStandardMaterial flatShading color="#111827" />
        </mesh>
      ))}
    </RigidBody>
  );
}
