import { useEffect, useRef } from "react";
import { loadChocoGeo, WIDTH, HEIGHT } from "../utils/geo";
import { roadCenterWorldX, worldGround, WATER_LEVEL } from "./ChocoTerrain";
import { vehicleState } from "../utils/vehicleState";

// Minimapa premium (overlay HTML, fuera del canvas 3D): silueta real del
// Chocó + río + carretera dibujados UNA vez en un <canvas> 2D; el jugador es
// un marcador DOM actualizado por rAF a ~8fps leyendo vehicleState (cero
// re-renders de React, cero costo para la escena).
const MAP_W = 148;
const MAP_H = 222;

function worldToMap(x: number, z: number): { px: number; py: number } {
  return {
    px: ((x + WIDTH / 2) / WIDTH) * MAP_W,
    py: ((z + HEIGHT / 2) / HEIGHT) * MAP_H,
  };
}

export default function MundoMiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  // Fondo estático: polígono + agua + carretera (una sola vez)
  useEffect(() => {
    let cancelled = false;
    loadChocoGeo().then((geo) => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = MAP_W * dpr;
      canvas.height = MAP_H * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      // Silueta del departamento
      ctx.fillStyle = "rgba(47, 155, 78, 0.85)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 0.8;
      for (const { ring } of geo.polys) {
        ctx.beginPath();
        for (let i = 0; i < ring.length; i++) {
          const [lon, lat] = ring[i];
          const { x, y } = geo.lonLatToLocal(lon, lat);
          const { px, py } = worldToMap(x, -y); // world z = -y local
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Río Atrato + carretera: muestrear de sur a norte donde existen
      const drawPath = (
        offsetFn: (z: number) => number,
        style: string,
        width: number
      ) => {
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.beginPath();
        let started = false;
        // la máscara N-S del valle existe para yLocal > -0.55·(H/2)
        for (let z = 24; z >= -HEIGHT / 2 + 2; z -= 1.5) {
          const x = offsetFn(z);
          // solo donde el suelo confirma cauce/carretera: ni montañas (>1.2)
          // ni mar abierto fuera del polígono (SEA_FLOOR)
          const g = worldGround(x, z);
          if (g > 1.2 || g < -1.5) continue;
          const { px, py } = worldToMap(x, z);
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      };
      // Río (centro del cauce = carretera − offset este)
      drawPath(
        (z) => roadCenterWorldX(z) - 0.17 * (WIDTH / 2),
        "rgba(84, 150, 199, 0.95)",
        3
      );
      // Carretera
      drawPath((z) => roadCenterWorldX(z), "rgba(163, 131, 90, 0.95)", 1.6);

      // Marca de agua del nivel del mar (contexto)
      void WATER_LEVEL;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Marcador del jugador: rAF desacoplado (~8fps es suficiente para un mapa)
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 120) return;
      last = t;
      const marker = markerRef.current;
      if (!marker) return;
      const { px, py } = worldToMap(vehicleState.x, vehicleState.z);
      const deg = (-vehicleState.yaw * 180) / Math.PI;
      marker.style.transform = `translate(${px - 5}px, ${py - 5}px) rotate(${deg}deg)`;
      marker.style.color =
        vehicleState.mode === "boat" ? "#7fd8e8" : "#ffb347";
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="pointer-events-none absolute bottom-4 right-4 z-10 hidden select-none
                 overflow-hidden rounded-2xl border border-white/15 shadow-[0_8px_32px_rgba(2,13,26,0.45)]
                 backdrop-blur-md md:block"
      style={{ background: "rgba(2, 13, 26, 0.55)" }}
    >
      <div className="relative" style={{ width: MAP_W, height: MAP_H }}>
        <canvas
          ref={canvasRef}
          style={{ width: MAP_W, height: MAP_H, display: "block" }}
        />
        {/* Marcador del jugador (flecha que apunta al rumbo) */}
        <div
          ref={markerRef}
          className="absolute left-0 top-0 will-change-transform"
          style={{ width: 10, height: 10, color: "#ffb347" }}
        >
          <svg viewBox="0 0 10 10" width="10" height="10">
            <path
              d="M5 0 L8.6 8.6 L5 6.6 L1.4 8.6 Z"
              fill="currentColor"
              stroke="rgba(2,13,26,0.9)"
              strokeWidth="0.8"
            />
          </svg>
        </div>
      </div>
      <p className="px-2 pb-1.5 pt-1 text-center font-sans text-[9px] font-semibold uppercase tracking-[0.28em] text-white/45">
        Chocó
      </p>
    </div>
  );
}
