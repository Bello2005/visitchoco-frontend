import { useEffect, useRef, useState } from "react";
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
import { useFrame } from "@react-three/fiber";
import { terrainHeight, WATER_LEVEL } from "./ChocoTerrain";

type VehicleController = ReturnType<
  RapierContext["world"]["createVehicleController"]
>;
type Mode = "car" | "boat";

// Spawn en el banco ESTE del Atrato. OJO: además de tierra firme
// (h≥0.15) el punto debe caer DENTRO del polígono del Chocó — en y=8
// el este ya es mar; en y=11 el banco x∈[4.5,7] es interior y firme.
// Recordar: world Z = -y local.
const SPAWN_X = 5.5;
const SPAWN_LOCAL_Y = 11;
const SPAWN_POS = {
  x: SPAWN_X,
  y: terrainHeight(SPAWN_X, SPAWN_LOCAL_Y) + 3,
  z: -SPAWN_LOCAL_Y,
};
// 180° en Y: el carro nace mirando al norte (-Z mundo)
const SPAWN_ROT = { x: 0, y: 1, z: 0, w: 0 };

const CHASSIS_HALF: [number, number, number] = [0.9, 0.35, 1.6];
const WHEEL_RADIUS = 0.32;
const SUSPENSION_REST = 0.35;

// Puntos de anclaje de las ruedas (esquinas del chasis). Frente = +Z local.
// Índices 0-1 delanteras (dirección), 2-3 traseras (tracción).
const WHEELS: [number, number, number][] = [
  [-0.8, -0.25, 1.2],
  [0.8, -0.25, 1.2],
  [-0.8, -0.25, -1.2],
  [0.8, -0.25, -1.2],
];

const ENGINE_FORWARD = 120;
const ENGINE_REVERSE = -70;
const MAX_STEER = 0.55;
// Por encima de estas velocidades el motor deja de empujar (coast) — a 45N
// tardaba ~9s en crucero; sin este cap, 120N acelera indefinidamente
const CAR_COAST_SPEED = 14;
const CAR_COAST_REVERSE_SPEED = 6;

// Física de panga — calibrada para masa 120 (equilibrio: centro ~0.05
// bajo el agua → casco visual ~60% sumergido, sin rozar el lecho a -0.45)
const BUOY_K = 24000; // resorte de flotación (N por unidad de profundidad)
const BUOY_C = 1400; // amortiguación vertical
const BUOY_MAX_DEPTH = 0.5; // clamp: caer al mar no catapulta
const BOAT_FORWARD = 500; // suficiente para vararse en orillas someras
const BOAT_REVERSE = -350;
const BOAT_TURN = 250;
const DRAG_XZ = 0.985; // deriva de bote
const DRAG_ANG = 0.96;
const SWITCH_COOLDOWN_MS = 400; // histéresis anti-parpadeo

// Transformación por profundidad de agua bajo el chasis (reemplaza el
// sensor de Water.tsx): el sensor exigía que la panga trepara la orilla
// por sí sola para salir de su volumen, y sin ruedas nunca lo lograba
// (deadlock permanente en la orilla). Separación de 0.12 entre umbrales.
const WATER_ENTER_DEPTH = 0.3; // car→boat: agua honda bajo el chasis
const WATER_EXIT_DEPTH = 0.18; // boat→car: banco lo bastante somero
// 0.75 y no 0.4: un carro RODANDO sobre el lecho (-0.3..-0.45) lleva el
// centro a y≈0.47-0.60 por la suspensión — con 0.4 la entrada lenta al río
// nunca disparaba (solo entrar saltando/cayendo). 0.75 sigue descartando
// saltos balísticos altos por encima del cauce.
const FLYOVER_MAX_Y = WATER_LEVEL + 0.75;
const OPEN_SEA_SAFETY_Y = WATER_LEVEL - 0.6; // fuera del polígono terrainHeight no sabe que es mar
const BOAT_BEACH_ASSIST = 400; // empuje extra a la proa para montar el banco

const _quat = new THREE.Quaternion();
const _forward = new THREE.Vector3();

interface VehicleProps {
  chassisRef: RefObject<RapierRigidBody | null>;
}

export default function Vehicle({ chassisRef }: VehicleProps) {
  const { world, rapier } = useRapier();
  const vehicleRef = useRef<VehicleController | null>(null);
  const steering = useRef(0);
  const modeRef = useRef<Mode>("car");
  const [modeVisual, setModeVisual] = useState<Mode>("car");
  const lastSwitch = useRef(0);
  const splashRef = useRef<THREE.Mesh>(null);
  const splashStart = useRef(-1);
  const [, getKeys] = useKeyboardControls();

  const triggerSplash = () => {
    const splash = splashRef.current;
    const chassis = chassisRef.current;
    if (!splash || !chassis) return;
    const t = chassis.translation();
    splash.position.set(t.x, WATER_LEVEL + 0.05, t.z);
    splash.scale.setScalar(0.5);
    splash.visible = true;
    splashStart.current = performance.now();
  };

  const trySwitch = (next: Mode) => {
    if (modeRef.current === next) return;
    const now = performance.now();
    if (now - lastSwitch.current < SWITCH_COOLDOWN_MS) return;
    lastSwitch.current = now;
    modeRef.current = next;
    setModeVisual(next);
    if (next === "boat") triggerSplash();
  };

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

    chassis.resetForces(true);
    chassis.resetTorques(true);

    // Reset manual (R) o anti-caída: SIEMPRE vuelve como carro al spawn
    if (reset || chassis.translation().y < -5) {
      chassis.setTranslation(SPAWN_POS, true);
      chassis.setRotation(SPAWN_ROT, true);
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
      steering.current = 0;
      modeRef.current = "car";
      setModeVisual("car");
      lastSwitch.current = performance.now();
    }

    // Transformación por profundidad de agua bajo el chasis (no por sensor):
    // ver comentario de los umbrales arriba.
    const t = chassis.translation();
    const ground = terrainHeight(t.x, -t.z);
    const waterDepth = WATER_LEVEL - ground; // >0 = hay agua sobre el lecho

    if (modeRef.current === "car") {
      if (
        (waterDepth > WATER_ENTER_DEPTH && t.y < FLYOVER_MAX_Y) ||
        t.y < OPEN_SEA_SAFETY_Y // red de seguridad: mar abierto fuera del polígono
      ) {
        trySwitch("boat");
      }
    } else if (waterDepth < WATER_EXIT_DEPTH && t.y > ground) {
      // t.y > ground: en mar abierto (fuera del polígono) terrainHeight
      // reporta tierra fantasma POR ENCIMA del casco que flota en y≈0;
      // sin este guard la panga oscilaba boat↔car cada 400ms en el borde
      // este. Al vararse de verdad el chasis siempre queda sobre el suelo.
      trySwitch("car");
    }

    if (modeRef.current === "car") {
      const speed = Math.hypot(chassis.linvel().x, chassis.linvel().z);
      const coasting =
        (forward && speed > CAR_COAST_SPEED) ||
        (backward && speed > CAR_COAST_REVERSE_SPEED);
      const engineForce = coasting
        ? 0
        : forward
          ? ENGINE_FORWARD
          : backward
            ? ENGINE_REVERSE
            : 0;
      // Tracción 4x4: sin ella el chasis (largo) queda varado en la cresta
      // del banco del río con las traseras sin apoyo
      vehicle.setWheelEngineForce(0, engineForce);
      vehicle.setWheelEngineForce(1, engineForce);
      vehicle.setWheelEngineForce(2, engineForce);
      vehicle.setWheelEngineForce(3, engineForce);

      // Steering pierde autoridad con la velocidad (patrón arcade) — a
      // fondo y a máxima velocidad, giro completo volcaba el chasis
      const steerScale = 1 - 0.5 * Math.min(speed / CAR_COAST_SPEED, 1);
      const targetSteer =
        (left ? MAX_STEER : right ? -MAX_STEER : 0) * steerScale;
      steering.current = THREE.MathUtils.lerp(
        steering.current,
        targetSteer,
        0.1
      );
      vehicle.setWheelSteering(0, steering.current);
      vehicle.setWheelSteering(1, steering.current);

      // EXCLUDE_SENSORS: Water.tsx ya no tiene sensor, pero sin este flag
      // las ruedas raycastearían contra cualquier volumen sensor futuro y
      // el carro "conduciría" sobre su techo — protección barata
      vehicle.updateVehicle(
        stepWorld.timestep,
        rapier.QueryFilterFlags.EXCLUDE_SENSORS
      );
      return;
    }

    // ---- modo panga: flotación + propulsión, sin raycast vehicle ----
    const depth = WATER_LEVEL - chassis.translation().y;
    if (depth > 0) {
      const clamped = Math.min(depth, BUOY_MAX_DEPTH);
      const fUp = clamped * BUOY_K - chassis.linvel().y * BUOY_C;
      chassis.addForce({ x: 0, y: fUp, z: 0 }, true);
    }

    const r = chassis.rotation();
    _quat.set(r.x, r.y, r.z, r.w);
    _forward.set(0, 0, 1).applyQuaternion(_quat); // +Z local = frente

    if (forward || backward) {
      const f = forward ? BOAT_FORWARD : BOAT_REVERSE;
      chassis.addForce({ x: _forward.x * f, y: 0, z: _forward.z * f }, true);
    }
    if (left || right) {
      chassis.addTorque({ x: 0, y: left ? BOAT_TURN : -BOAT_TURN, z: 0 }, true);
    }
    // Asistencia de orilla: empuje extra a la proa mientras llega la
    // transformación a carro (sin ruedas, la panga sola no monta el banco)
    if (forward && waterDepth < WATER_ENTER_DEPTH) {
      chassis.addForce({ x: 0, y: BOAT_BEACH_ASSIST, z: 0 }, true);
    }

    const lv = chassis.linvel();
    chassis.setLinvel({ x: lv.x * DRAG_XZ, y: lv.y, z: lv.z * DRAG_XZ }, true);
    const av = chassis.angvel();
    chassis.setAngvel(
      { x: av.x * DRAG_ANG, y: av.y * DRAG_ANG, z: av.z * DRAG_ANG },
      true
    );
  });

  // Splash: anillo reutilizable, escala 0.5→3 y opacity 0.5→0 en ~0.35s
  useFrame(() => {
    const splash = splashRef.current;
    if (!splash || splashStart.current < 0) return;
    const e = (performance.now() - splashStart.current) / 350;
    if (e >= 1) {
      splash.visible = false;
      splashStart.current = -1;
      return;
    }
    splash.scale.setScalar(0.5 + e * 2.5);
    (splash.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - e);
  });

  return (
    <>
      <RigidBody
        ref={chassisRef}
        colliders={false}
        position={[SPAWN_POS.x, SPAWN_POS.y, SPAWN_POS.z]}
        rotation={[0, Math.PI, 0]}
        canSleep={false}
      >
        <CuboidCollider args={CHASSIS_HALF} mass={120} />
        {/* Placeholder visual carro — el modelo real llega en fase posterior */}
        <group visible={modeVisual === "car"}>
          <mesh castShadow>
            <boxGeometry
              args={[
                CHASSIS_HALF[0] * 2,
                CHASSIS_HALF[1] * 2,
                CHASSIS_HALF[2] * 2,
              ]}
            />
            <meshStandardMaterial
              flatShading
              color="#d97706"
              emissive="#d97706"
              emissiveIntensity={0.15}
            />
          </mesh>
          {WHEELS.map(([x, , z], i) => (
            <mesh
              key={i}
              castShadow
              position={[x, -0.45, z]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.24, 12]} />
              <meshStandardMaterial flatShading color="#111827" />
            </mesh>
          ))}
        </group>
        {/* Placeholder panga: casco de madera + proa inclinada al frente */}
        <group visible={modeVisual === "boat"}>
          <mesh castShadow position={[0, -0.15, 0]}>
            <boxGeometry args={[1.4, 0.35, 3.4]} />
            <meshStandardMaterial flatShading color="#7c4a1e" />
          </mesh>
          {/* Proa con linterna ámbar tenue — única luz de la panga */}
          <mesh castShadow position={[0, -0.02, 1.85]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[1.2, 0.3, 0.9]} />
            <meshStandardMaterial
              flatShading
              color="#7c4a1e"
              emissive="#ffb347"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      </RigidBody>
      {/* Splash de entrada al agua (un solo anillo, se reposiciona) */}
      <mesh ref={splashRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.85, 24]} />
        <meshBasicMaterial
          transparent
          opacity={0.5}
          color="#dbeef2"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
