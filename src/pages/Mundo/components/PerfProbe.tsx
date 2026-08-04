import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { shadingUniforms } from "../utils/shadingUniforms";
import { lightingProfile } from "../utils/lightingProfile";

// Sonda de rendimiento, apagada salvo que la URL lleve #perf.
//
// Va DENTRO del Canvas: mide desde el bucle de R3F. Medir con
// requestAnimationFrame desde la consola no sirve en un preview headless (con
// la pestaña en segundo plano el rAF se congela y la medición cuelga).
//
// gl.info.autoReset se apaga a propósito: con EffectComposer hay VARIOS
// render() por frame y el contador se reinicia en cada uno, así que leerlo sin
// más devuelve la última pasada del composer (calls=1, tris=1 — el triángulo a
// pantalla completa). Apagándolo, los contadores acumulan el frame entero y se
// reinician a mano justo después de leerlos.
//
// Publica en `document.documentElement[data-perf]` porque el mundo aislado de
// las herramientas de inspección no comparte `window` con la página.
export default function PerfProbe() {
  const gl = useThree((s) => s.gl);
  const frames = useRef(0);
  const last = useRef(performance.now());

  useEffect(() => {
    const prev = gl.info.autoReset;
    gl.info.autoReset = false;
    // Bajo #perf se exponen los diales para calibrar el look en vivo sin
    // recompilar (son uniformes compartidos por todos los materiales).
    const w = window as unknown as Record<string, unknown>;
    w.__mundoShading = shadingUniforms;
    w.__mundoLighting = lightingProfile;
    return () => {
      gl.info.autoReset = prev;
      delete w.__mundoShading;
      delete w.__mundoLighting;
    };
  }, [gl]);

  useFrame(() => {
    frames.current++;
    const now = performance.now();
    const dt = now - last.current;
    if (dt < 1000) return;

    const r = gl.info.render;
    // calls/tris son del ACUMULADO de `frames` frames → se promedia por frame.
    const perFrame = Math.max(1, frames.current);
    const line =
      `frames=${frames.current} en ${Math.round(dt)}ms ` +
      `calls/frame=${Math.round(r.calls / perFrame)} ` +
      `tris/frame=${Math.round(r.triangles / perFrame)} ` +
      `progs=${gl.info.programs?.length ?? -1} ` +
      `dpr=${gl.getPixelRatio().toFixed(2)}`;

    console.log("[perf]", line);
    document.documentElement.setAttribute("data-perf", line);

    gl.info.reset();
    frames.current = 0;
    last.current = now;
  });

  return null;
}
