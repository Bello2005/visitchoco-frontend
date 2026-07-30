import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  revealState,
  INTRO_RING_RADIUS,
  TRACE_MS,
} from "../utils/revealUniforms";
import { SPAWN_POS } from "./Vehicle";
import { worldGround } from "./ChocoTerrain";

// El "despertar" de folio-2025 con colores VisitChocó: en la oscuridad solo
// existe un PUNTO de luz ámbar pulsante en el spawn; al interactuar, una línea
// dorada TRAZA el círculo a su alrededor (shader angular con cabeza brillante)
// y al completarse el territorio explota. Ambos meshes viven fuera del sistema
// de revelado (son lo único visible en el vacío).
export default function IntroBeacon() {
  const pointRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.Mesh>(null);

  const groundY = useMemo(
    () => worldGround(SPAWN_POS.x, SPAWN_POS.z),
    []
  );

  // Grid del vacío (el "piso" de la intro de folio-2025): líneas tenues que
  // se desvanecen lejos del punto de luz. Es lo único que sugiere un suelo
  // mientras el mundo duerme.
  const gridMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {},
        vertexShader: /* glsl */ `
          varying vec2 vXZ;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vXZ = wp.xz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vXZ;
          uniform vec2 uCenter;
          void main() {
            vec2 g = abs(fract(vXZ / 2.0) - 0.5) * 2.0; // 0 en la línea
            float line = 1.0 - min(1.0, min(g.x, g.y) / 0.022);
            if (line <= 0.0) discard;
            float d = distance(vXZ, uCenter);
            float fade = 1.0 - smoothstep(3.0, 15.0, d);
            if (fade <= 0.0) discard;
            gl_FragColor = vec4(vec3(0.2, 0.38, 0.5), line * fade * 0.16);
          }
        `,
      }),
    []
  );
  useMemo(() => {
    gridMaterial.uniforms.uCenter = {
      value: new THREE.Vector2(SPAWN_POS.x, SPAWN_POS.z),
    };
  }, [gridMaterial]);

  const ringMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uProgress: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vPos;
          void main() {
            vPos = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        // Barrido angular: solo se pinta el arco ya recorrido; la CABEZA del
        // trazo brilla más fuerte (empuja el Bloom) y deja una estela suave.
        fragmentShader: /* glsl */ `
          varying vec2 vPos;
          uniform float uProgress;
          const float PI2 = 6.28318530718;
          void main() {
            float angle = atan(vPos.y, vPos.x);      // -PI..PI
            float a01 = fract(angle / PI2 + 1.0);    // 0..1
            float sweep = uProgress;
            if (a01 > sweep) discard;
            float head = smoothstep(sweep - 0.06, sweep, a01);
            float trail = 0.55 + 0.45 * smoothstep(sweep - 0.5, sweep, a01);
            vec3 amber = vec3(1.0, 0.702, 0.278);
            vec3 color = mix(amber * 1.6 * trail, vec3(1.0, 0.92, 0.75) * 2.6, head);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    []
  );

  useFrame(() => {
    const point = pointRef.current;
    const ring = ringRef.current;
    const grid = gridRef.current;
    if (!point || !ring || !grid) return;

    const phase = revealState.phase;
    point.visible = phase === "asleep" || phase === "tracing";
    ring.visible = phase === "tracing";
    grid.visible = phase === "asleep" || phase === "tracing";

    if (point.visible) {
      const t = performance.now() / 1000;
      point.scale.setScalar(1 + Math.sin(t * 2.6) * 0.28);
    }
    if (phase === "tracing") {
      const t = (performance.now() - revealState.startTime) / TRACE_MS;
      ringMaterial.uniforms.uProgress.value = Math.min(1, t);
    }
  });

  return (
    <group position={[SPAWN_POS.x, 0, SPAWN_POS.z]}>
      {/* Grid del vacío (piso sugerido durante el sueño) */}
      <mesh
        ref={gridRef}
        position={[0, groundY + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={gridMaterial}
      >
        <planeGeometry args={[70, 70]} />
      </mesh>
      {/* Punto de luz: lo único que existe en la oscuridad */}
      <mesh ref={pointRef} position={[0, groundY + 0.45, 0]}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshBasicMaterial color={[1.0 * 2.4, 0.702 * 2.4, 0.278 * 2.4]} />
      </mesh>
      {/* Anillo del trazado, plano sobre el suelo */}
      <mesh
        ref={ringRef}
        visible={false}
        position={[0, groundY + 0.07, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={ringMaterial}
      >
        <ringGeometry args={[INTRO_RING_RADIUS - 0.09, INTRO_RING_RADIUS, 96]} />
      </mesh>
    </group>
  );
}
