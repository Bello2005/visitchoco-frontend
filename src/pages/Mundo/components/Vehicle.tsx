// Motor del vehículo adaptado de PhysicsVehicle.js de folio-2025
// (Bruno Simon, MIT). Ver src/pages/Mundo/CREDITS.md para atribución y licencia.
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  worldGround,
  roadCenterWorldX,
  WATER_LEVEL,
  GATEWAY_Z,
  WORLD_HALF_X,
  WORLD_HALF_Z,
} from "./ChocoTerrain";
import { applyReveal } from "../utils/applyReveal";
import { vehicleState } from "../utils/vehicleState";

type VehicleController = ReturnType<
  RapierContext["world"]["createVehicleController"]
>;
type Mode = "car" | "boat";

// Spawn EN EL PORTAL DEL CHOCÓ (plaza VisitChocó de la punta sur): el carro
// nace sobre la plaza (cae sobre su collider, tope ~0.44) mirando al NORTE, a
// lo largo de la vía — atraviesa el arco de bienvenida y entra al territorio.
export const SPAWN_POS = {
  x: roadCenterWorldX(GATEWAY_Z),
  y: 1.6,
  z: GATEWAY_Z,
};
// 180° en Y: mirando al NORTE (-Z mundo), a lo largo de la carretera
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

// Motor estilo folio-2025 (PhysicsVehicle.js, MIT): en vez de "coast" duro
// (cortar el motor sobre una velocidad), la fuerza decae suave con el exceso:
// force = ENGINE / (1 + exceso). Y frenos por intención: S con el carro andando
// hacia adelante = FRENAR (no reversa); al ralentí, freno suave (no rueda solo).
const ENGINE_FORWARD = 130;
const ENGINE_REVERSE = -80;
const MAX_STEER = 0.55;
const CAR_TOP_SPEED = 16;
const CAR_TOP_REVERSE = 7;
const IDLE_BRAKE = 6; // ralentí: quieto en pendiente
const REVERSE_BRAKE = 40; // S en marcha = frenada de verdad

// Flotación kinemática (patrón arcade): la altura del casco se fija por lerp
// al nivel de flotación y la orientación se nivela por slerp — la física solo
// gobierna el plano XZ (propulsión, deriva, choques). El fondo del collider
// (half 0.35) queda en -0.40, con holgura sobre el lecho del cauce (-0.45).
const FLOAT_DEPTH = 0.05; // centro del casco bajo el nivel del agua
const FLOAT_LERP = 0.18; // sube de una entrada clavada en ~6 steps
// Holgura del fondo del casco (half 0.35) sobre el suelo cuando la flotación
// sigue la rampa de la playa: bottom = suelo + 0.05.
const HULL_CLEARANCE = 0.4;
const WATER_LIN_DAMP = 1.1; // deriva de bote (el agua frena)
const WATER_ANG_DAMP = 2.0;
// Auto-enderezado del casco: slerp kinemático de la rotación hacia "solo yaw"
// (pitch/roll → 0) cada step. Con torques el enderezado era demasiado lento
// (inercia + damping); el slerp garantiza casco horizontal en ~0.5s sin tocar
// el rumbo. Patrón arcade estándar de juegos de botes.
const RIGHT_SLERP = 0.2;
const BOAT_FORWARD = 520;
const BOAT_REVERSE = -360;
const BOAT_TURN = 420;
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
// empujamos hacia adelante (la flotación por gravityScale ya aligera el casco;
// un empuje vertical aquí lo catapultaría) hasta que el centro llegue a agua
// somera y transforme a carro, que termina la trepada con ruedas.
const BOAT_BEACH_PUSH = 900;
// La panga es larga: sondeamos el suelo a esta distancia de la proa.
const BOW_REACH = 1.7;

// CHOQUE (para el audio): una caída de rapidez mayor a esto EN UN SOLO step es
// un impacto (chocar contra pared/monumento/puente o el muro del mundo). El
// frenado sangra la velocidad de a poco (<1/step con la masa del chasis), así
// que el umbral no confunde una frenada con un golpe. Se suprime unos ms tras
// reset / cambio de modo / desembarco (ahí la velocidad cambia a propósito).
const IMPACT_DELTA = 4;
const IMPACT_SUPPRESS_MS = 300;

const _quat = new THREE.Quaternion();
const _yawQuat = new THREE.Quaternion();
const _forward = new THREE.Vector3();
const _up = new THREE.Vector3();
const _WORLD_UP = new THREE.Vector3(0, 1, 0);

// Auto-enderezado del CARRO (barra espaciadora): si vuelca, el "arriba" local
// cae por debajo de este umbral (~60° de inclinación) y una pulsación lo pone
// derecho conservando el rumbo — como el flip de GTA / folio de Bruno.
const FLIP_UP_THRESHOLD = 0.5;

// Casco de panga (canoa de madera del Atrato): parte de una caja y la deforma —
// puntas afinadas en proa/popa, borde superior elevado (sheer) y quilla curvada
// (rocker). Low-poly, flat-shaded. Frente = +Z local. Exportada para las
// pangas varadas decorativas de las playas (Vegetation).
export function makeCanoeGeometry(): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(0.95, 0.5, 3.4, 3, 3, 14);
  const pos = g.attributes.position;
  const halfLen = 1.7;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = Math.min(1, Math.abs(z) / halfLen); // 0 centro .. 1 puntas
    const taper = 1 - Math.pow(t, 1.5) * 0.95; // afinar ancho hacia las puntas
    let ny = y;
    if (y > 0) ny += Math.pow(t, 2.2) * 0.6; // sheer: borde superior sube
    else ny += Math.pow(t, 2.4) * 0.3; // rocker: quilla sube en las puntas
    pos.setX(i, x * taper);
    pos.setY(i, ny);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

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
  // Señales de audio (VehicleAudio las lee vía vehicleState)
  const throttleRef = useRef(0);
  const brakingRef = useRef(false);
  const prevSpeed = useRef(0);
  const impactSuppressUntil = useRef(0);
  const splashRef = useRef<THREE.Mesh>(null);
  const splashStart = useRef(-1);
  const [, getKeys] = useKeyboardControls();

  const canoeGeo = useMemo(makeCanoeGeometry, []);
  useEffect(() => () => canoeGeo.dispose(), [canoeGeo]);

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
    // El desembarco/embarque toca la velocidad (cap, damping, flotación): que
    // no lo lea el detector de choque como un golpe.
    impactSuppressUntil.current = now + IMPACT_SUPPRESS_MS;
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
      // Grip lateral estilo folio-2025 (sideFrictionStiffness 3): el carro se
      // siente plantado en las curvas en vez de patinar de lado.
      vehicle.setWheelSideFrictionStiffness(i, 3);
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

    const { forward, backward, left, right, reset, flip } = getKeys();

    chassis.resetForces(true);
    chassis.resetTorques(true);

    // DETECCIÓN DE CHOQUE (para VehicleAudio): la rapidez que dejó el step
    // anterior, comparada con la de este. Una caída brusca = impacto. El
    // frenado NO cae de golpe, así que no dispara falsos. Se publica en
    // vehicleState.impact; VehicleAudio lo consume y suena el golpe escalado.
    const nowMs = performance.now();
    const curSpeed = Math.hypot(chassis.linvel().x, chassis.linvel().z);
    if (nowMs > impactSuppressUntil.current) {
      const drop = prevSpeed.current - curSpeed;
      if (drop > IMPACT_DELTA) {
        vehicleState.impact = Math.max(vehicleState.impact, drop);
      }
    }
    prevSpeed.current = curSpeed;

    // Física de tierra: deshace lo que el modo panga cambia en el body.
    // Dampings 0.1/0.1 como folio-2025 (suaviza microtemblor del chasis).
    const landPhysics = () => {
      chassis.setGravityScale(1, true);
      chassis.setLinearDamping(0.1);
      chassis.setAngularDamping(0.1);
    };

    // Reset manual (R) o anti-caída: SIEMPRE vuelve como carro al spawn
    if (reset || chassis.translation().y < -5) {
      chassis.setTranslation(SPAWN_POS, true);
      chassis.setRotation(SPAWN_ROT, true);
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
      steering.current = 0;
      landPhysics();
      modeRef.current = "car";
      setModeVisual("car");
      lastSwitch.current = performance.now();
      // El teletransporte pone la velocidad en cero de golpe: que no cuente
      // como choque.
      impactSuppressUntil.current = nowMs + IMPACT_SUPPRESS_MS;
      prevSpeed.current = 0;
    }

    // LÍMITE DEL MUNDO: muro invisible en el borde del rectángulo navegable
    // (terreno + anillo de mar). Fuera de él el agua sigue infinita y
    // worldGround = SEA_FLOOR → la panga navegaría sin fin. Clampa la posición
    // al borde y mata la velocidad SOLO en el eje que topa. Vale carro y panga.
    {
      const p = chassis.translation();
      let cx = p.x;
      let cz = p.z;
      if (p.x > WORLD_HALF_X) cx = WORLD_HALF_X;
      else if (p.x < -WORLD_HALF_X) cx = -WORLD_HALF_X;
      if (p.z > WORLD_HALF_Z) cz = WORLD_HALF_Z;
      else if (p.z < -WORLD_HALF_Z) cz = -WORLD_HALF_Z;
      if (cx !== p.x || cz !== p.z) {
        chassis.setTranslation({ x: cx, y: p.y, z: cz }, true);
        const v = chassis.linvel();
        chassis.setLinvel(
          { x: cx !== p.x ? 0 : v.x, y: v.y, z: cz !== p.z ? 0 : v.z },
          true
        );
      }
    }

    // ENDEREZAR CON ESPACIO: si el carro volcó, una pulsación lo pone derecho
    // en su sitio conservando el rumbo (no un reset al spawn). Solo en modo
    // carro y solo si de verdad está tumbado (la panga ya se autonivela).
    if (flip && modeRef.current === "car") {
      const r = chassis.rotation();
      _quat.set(r.x, r.y, r.z, r.w);
      _up.set(0, 1, 0).applyQuaternion(_quat);
      if (_up.y < FLIP_UP_THRESHOLD) {
        _forward.set(0, 0, 1).applyQuaternion(_quat);
        const yaw = Math.atan2(_forward.x, _forward.z);
        _yawQuat.setFromAxisAngle(_WORLD_UP, yaw);
        chassis.setRotation(
          { x: _yawQuat.x, y: _yawQuat.y, z: _yawQuat.z, w: _yawQuat.w },
          true
        );
        const p = chassis.translation();
        const restY = worldGround(p.x, p.z) + 1.0; // levanta sobre las ruedas
        chassis.setTranslation({ x: p.x, y: Math.max(p.y, restY), z: p.z }, true);
        chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
        const lv = chassis.linvel();
        chassis.setLinvel({ x: lv.x, y: Math.min(lv.y, 0), z: lv.z }, true);
      }
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
      // Amortiguar el impulso del ariete: matar vertical y limitar horizontal
      // a velocidad de conducción — aterriza suave y sigue rodando.
      const lv = chassis.linvel();
      const horiz = Math.hypot(lv.x, lv.z);
      const cap = horiz > 6 ? 6 / horiz : 1;
      chassis.setLinvel({ x: lv.x * cap * 0.6, y: 0, z: lv.z * cap * 0.6 }, true);
      const av = chassis.angvel();
      chassis.setAngvel({ x: 0, y: av.y * 0.5, z: 0 }, true);
      landPhysics();
    }

    if (modeRef.current === "car") {
      const speed = Math.hypot(chassis.linvel().x, chassis.linvel().z);

      // Motor estilo folio-2025: decae suave con el exceso sobre el tope
      // (sin corte duro) — force = ENGINE / (1 + exceso).
      const topSpeed = forward ? CAR_TOP_SPEED : CAR_TOP_REVERSE;
      const overflow = Math.max(0, speed - topSpeed);
      let engineForce = forward
        ? ENGINE_FORWARD / (1 + overflow)
        : backward
          ? ENGINE_REVERSE / (1 + overflow)
          : 0;

      // Frenos por intención (folio-2025): S con el carro andando hacia
      // adelante = FRENAR (no reversa); sin acelerador = freno de ralentí.
      const vel = chassis.linvel();
      const r0 = chassis.rotation();
      _quat.set(r0.x, r0.y, r0.z, r0.w);
      _forward.set(0, 0, 1).applyQuaternion(_quat);
      const forwardSpeed = vel.x * _forward.x + vel.z * _forward.z;
      let brake = 0;
      if (!forward && !backward) {
        brake = IDLE_BRAKE;
      } else if (backward && forwardSpeed > 0.8) {
        brake = REVERSE_BRAKE;
        engineForce = 0;
      } else if (forward && forwardSpeed < -0.8) {
        brake = REVERSE_BRAKE;
        engineForce = 0;
      }

      // Tracción 4x4: sin ella el chasis (largo) queda varado en la cresta
      // del banco del río con las traseras sin apoyo
      vehicle.setWheelEngineForce(0, engineForce);
      vehicle.setWheelEngineForce(1, engineForce);
      vehicle.setWheelEngineForce(2, engineForce);
      vehicle.setWheelEngineForce(3, engineForce);
      vehicle.setWheelBrake(0, brake);
      vehicle.setWheelBrake(1, brake);
      vehicle.setWheelBrake(2, brake);
      vehicle.setWheelBrake(3, brake);

      // Señales para VehicleAudio: gas y frenada FUERTE (chirrido de llantas)
      throttleRef.current = forward ? 1 : backward ? -1 : 0;
      brakingRef.current = brake >= REVERSE_BRAKE;

      // Steering pierde autoridad con la velocidad (patrón arcade) — a
      // fondo y a máxima velocidad, giro completo volcaba el chasis
      const steerScale = 1 - 0.5 * Math.min(speed / CAR_TOP_SPEED, 1);
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

    // ---- modo panga: vertical y orientación KINEMÁTICOS, física solo en XZ --
    // La flotación por fuerzas (resorte o gravityScale) fallaba en los bordes:
    // el casco entraba clavado por el barranco, los contactos con el lecho lo
    // dejaban de punta y ninguna fuerza ganaba esa pelea. Patrón arcade
    // definitivo: cada step se FIJA la altura de flotación (lerp al nivel del
    // agua) y se nivela el casco (slerp fuerte a "solo yaw"); la propulsión y
    // la deriva siguen siendo físicas en el plano XZ. Cero atascos posibles.
    chassis.setGravityScale(0, true);
    chassis.setLinearDamping(WATER_LIN_DAMP);
    chassis.setAngularDamping(WATER_ANG_DAMP);

    const tb = chassis.translation();

    // Nivelar el casco primero (slerp a "solo yaw" conservando rumbo)
    const r = chassis.rotation();
    _quat.set(r.x, r.y, r.z, r.w);
    _forward.set(0, 0, 1).applyQuaternion(_quat);
    const yaw = Math.atan2(_forward.x, _forward.z);
    _yawQuat.setFromAxisAngle(_WORLD_UP, yaw);
    _quat.slerp(_yawQuat, RIGHT_SLERP);
    chassis.setRotation(
      { x: _quat.x, y: _quat.y, z: _quat.z, w: _quat.w },
      true
    );
    _forward.set(0, 0, 1).applyQuaternion(_quat); // frente ya nivelado

    // La flotación SIGUE EL SUELO cuando este sube — y mira TAMBIÉN bajo la
    // PROA: el casco es largo y vara de proa antes que de centro; sin el
    // sondeo de proa, el frente chocaba contra la rampa del banco (el centro
    // seguía hondo y no levantaba) y la panga quedaba clavada empujando.
    // Con el max(centro, proa) el casco SUBE la rampa deslizándose hasta que
    // el centro llega a agua somera y transforma a carro.
    const bowGround = worldGround(
      tb.x + _forward.x * BOW_REACH,
      tb.z + _forward.z * BOW_REACH
    );
    const underHull = Math.max(worldGround(tb.x, tb.z), bowGround);
    const targetY = Math.max(
      WATER_LEVEL - FLOAT_DEPTH,
      underHull + HULL_CLEARANCE
    );
    chassis.setTranslation(
      { x: tb.x, y: tb.y + (targetY - tb.y) * FLOAT_LERP, z: tb.z },
      true
    );
    const lvB = chassis.linvel();
    chassis.setLinvel({ x: lvB.x, y: 0, z: lvB.z }, true);

    if (forward || backward) {
      const f = forward ? BOAT_FORWARD : BOAT_REVERSE;
      chassis.addForce({ x: _forward.x * f, y: 0, z: _forward.z * f }, true);
    }
    if (left || right) {
      chassis.addTorque({ x: 0, y: left ? BOAT_TURN : -BOAT_TURN, z: 0 }, true);
    }
    // Ariete de playa: empuje extra hacia adelante mientras la proa está en
    // los bajos, para montar la rampa contra la fricción del casco.
    const bowShallow = WATER_LEVEL - bowGround < WATER_ENTER_DEPTH;
    if (forward && (bowShallow || waterDepth < WATER_ENTER_DEPTH)) {
      chassis.addForce(
        { x: _forward.x * BOAT_BEACH_PUSH, y: 0, z: _forward.z * BOAT_BEACH_PUSH },
        true
      );
    }

    // Señales para VehicleAudio: en la panga solo hay gas (no chirrido)
    throttleRef.current = forward ? 1 : backward ? -1 : 0;
    brakingRef.current = false;
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

  // Estado vivo para la UI HTML (minimapa): posición, rumbo y modo
  useFrame(() => {
    const chassis = chassisRef.current;
    if (!chassis) return;
    const t = chassis.translation();
    const r = chassis.rotation();
    _quat.set(r.x, r.y, r.z, r.w);
    _forward.set(0, 0, 1).applyQuaternion(_quat);
    vehicleState.x = t.x;
    vehicleState.z = t.z;
    vehicleState.yaw = Math.atan2(_forward.x, _forward.z);
    vehicleState.mode = modeRef.current;
    const lv = chassis.linvel();
    vehicleState.speed = Math.hypot(lv.x, lv.z);
    vehicleState.throttle = throttleRef.current;
    vehicleState.braking = brakingRef.current;
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
        {/* Todos los materiales del vehículo llevan applyReveal: en la
            oscuridad del intro el carro también está sin materializar y
            aparece con el territorio en la explosión. */}
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
              ref={(m) => {
                if (m) applyReveal(m);
              }}
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
              <meshStandardMaterial
                flatShading
                color="#111827"
                ref={(m) => {
                  if (m) applyReveal(m);
                }}
              />
            </mesh>
          ))}
        </group>
        {/* Panga: canoa de madera del Atrato (casco afinado en las puntas) */}
        <group visible={modeVisual === "boat"} position={[0, -0.12, 0]}>
          <mesh castShadow geometry={canoeGeo}>
            <meshStandardMaterial
              flatShading
              color="#7c4a1e"
              roughness={0.9}
              ref={(m) => {
                if (m) applyReveal(m);
              }}
            />
          </mesh>
          {/* Interior oscuro: sensación de bote hueco */}
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.5, 0.05, 2.5]} />
            <meshStandardMaterial
              flatShading
              color="#3a2712"
              roughness={1}
              ref={(m) => {
                if (m) applyReveal(m);
              }}
            />
          </mesh>
          {/* Banco central */}
          <mesh castShadow position={[0, 0.24, -0.1]}>
            <boxGeometry args={[0.62, 0.07, 0.28]} />
            <meshStandardMaterial
              flatShading
              color="#8a5a2b"
              ref={(m) => {
                if (m) applyReveal(m);
              }}
            />
          </mesh>
          {/* Farol de proa ámbar — única luz de la panga */}
          <mesh castShadow position={[0, 0.42, 1.35]}>
            <boxGeometry args={[0.16, 0.28, 0.16]} />
            <meshStandardMaterial
              color="#5b3814"
              emissive="#ffb347"
              emissiveIntensity={0.7}
              ref={(m) => {
                if (m) applyReveal(m);
              }}
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
