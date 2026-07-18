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
import { terrainHeight, worldGround, WATER_LEVEL } from "./ChocoTerrain";

type VehicleController = ReturnType<
  RapierContext["world"]["createVehicleController"]
>;
type Mode = "car" | "boat";

// Spawn en la ESTRIBACIÓN ESTE, tierra firme clara y ANCHA (suelo ~0.56,
// muy por encima del agua) con pendiente suave hacia el oeste — el carro
// nace en tierra y maneja cuesta abajo al Atrato para transformarse en panga.
// El valle central es apenas +0.2 (parece "dentro del agua"); esta cota alta
// evita esa sensación. Recordar: terrainHeight toma (x, yLocal=-z).
const SPAWN_X = 9;
const SPAWN_Z = 7;
const SPAWN_POS = {
  x: SPAWN_X,
  y: terrainHeight(SPAWN_X, -SPAWN_Z) + 1.2,
  z: SPAWN_Z,
};
// -90° en Y: el carro nace mirando al OESTE (-X), de frente al río
const SPAWN_ROT = { x: 0, y: -0.7071068, z: 0, w: 0.7071068 };

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

// Transformación carro↔panga por REGIÓN de suelo (worldGround = polígono +
// cauce, la misma verdad que la malla del terreno). Antes usábamos la altura
// del chasis con guards frágiles (t.y > ground): una panga flota en y≈0 y NUNCA
// podía cumplir ese guard cuando la orilla subía → deadlock, no desembarcaba.
// Ahora: agua honda bajo el chasis = panga; suelo somero/tierra = carro.
const WATER_ENTER_DEPTH = 0.32; // car→boat: agua honda de verdad bajo el chasis
// boat→car: se transforma en agua aún somera (0.24) para que el CARRO —con
// tracción 4x4 y motor— haga el tramo final de trepada, mucho más capaz que un
// casco flotando. Banda de histéresis 0.32→0.24 = 0.08 (con cooldown 400ms
// basta contra el parpadeo).
const WATER_EXIT_DEPTH = 0.24;
// Evita que un carro en salto balístico sobre el cauce se vuelva panga en el
// aire: solo transformar si el chasis está cerca del agua.
const FLYOVER_MAX_Y = WATER_LEVEL + 0.75;
// Ariete de playa: la panga es LARGA (casco 3.4), su proa vara en el banco
// mientras el centro sigue sobre agua honda — y el umbral de transformación
// mira el centro. Sin ayuda queda clavada ahí. Cuando la PROA toca banco/tierra
// empujamos arriba (1150N < peso 1177N: aligera sin volar) + adelante (extra)
// para montar el casco hasta que el CENTRO llegue a agua somera y transforme.
const BOAT_BEACH_ASSIST = 1150; // componente vertical (aligera el casco)
const BOAT_BEACH_PUSH = 850; // componente hacia adelante (monta el banco)
// La panga es larga: sondeamos el suelo a esta distancia de la proa.
const BOW_REACH = 1.7;

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

  // Devuelve true si el cambio se aplicó (respeta el cooldown anti-parpadeo).
  const trySwitch = (next: Mode): boolean => {
    if (modeRef.current === next) return false;
    const now = performance.now();
    if (now - lastSwitch.current < SWITCH_COOLDOWN_MS) return false;
    lastSwitch.current = now;
    modeRef.current = next;
    setModeVisual(next);
    if (next === "boat") triggerSplash();
    return true;
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

    // Transformación por REGIÓN de suelo (worldGround conoce el polígono):
    // ver comentario de los umbrales arriba.
    const t = chassis.translation();
    const ground = worldGround(t.x, t.z);
    const waterDepth = WATER_LEVEL - ground; // >0 = hay agua sobre el lecho

    if (modeRef.current === "car") {
      // Carro → panga: agua honda bajo el chasis y el chasis cerca del agua.
      // En mar abierto worldGround = SEA_FLOOR (-2) → waterDepth≫ENTER, entra
      // en modo panga de forma natural, sin red de seguridad por altura.
      if (waterDepth > WATER_ENTER_DEPTH && t.y < FLYOVER_MAX_Y) {
        trySwitch("boat");
      }
    } else if (waterDepth < WATER_EXIT_DEPTH && trySwitch("car")) {
      // Panga → carro: llegó a agua somera / orilla. Snap de desembarco: si la
      // orilla sube por encima del casco (que flota en y≈0), el carro naciente
      // quedaría clavado bajo el terreno — lo apoyamos sobre el suelo.
      const restY = ground + 0.5;
      if (t.y < restY) chassis.setTranslation({ x: t.x, y: restY, z: t.z }, true);
      // Amortiguar el impulso del ariete: sin esto el carro sale volando (el
      // empuje de playa acumula velocidad vertical). Matar el vertical y limitar
      // el horizontal a velocidad de conducción — aterriza suave y sigue rodando.
      const lv = chassis.linvel();
      const horiz = Math.hypot(lv.x, lv.z);
      const cap = horiz > 6 ? 6 / horiz : 1;
      chassis.setLinvel({ x: lv.x * cap * 0.6, y: 0, z: lv.z * cap * 0.6 }, true);
      const av = chassis.angvel();
      chassis.setAngvel({ x: 0, y: av.y * 0.5, z: 0 }, true);
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
    // Ariete de playa: mira el suelo bajo la PROA (la panga vara de proa antes
    // que de centro). Si la proa toca banco/tierra, empuja arriba + adelante
    // para montar el casco hasta que el centro entre en agua somera.
    const tp = chassis.translation();
    const bowGround = worldGround(
      tp.x + _forward.x * BOW_REACH,
      tp.z + _forward.z * BOW_REACH
    );
    const bowShallow = WATER_LEVEL - bowGround < WATER_ENTER_DEPTH;
    if (forward && (bowShallow || waterDepth < WATER_ENTER_DEPTH)) {
      chassis.addForce(
        {
          x: _forward.x * BOAT_BEACH_PUSH,
          y: BOAT_BEACH_ASSIST,
          z: _forward.z * BOAT_BEACH_PUSH,
        },
        true
      );
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
        rotation={[0, -Math.PI / 2, 0]}
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
