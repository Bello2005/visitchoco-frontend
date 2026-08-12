import { useEffect, useRef } from "react";
import { vehicleState } from "../utils/vehicleState";
import { slipwayPoint, SLIPWAY_U0 } from "./ChocoTerrain";

// INDICADOR DE MODO + PISTA DEL VARADERO.
//
// Hasta ahora la única señal de que ibas en panga era el COLOR de un punto de
// 10 px en el minimapa. La transformación es la mecánica más bonita del mundo
// 3D y pasaba desapercibida: aquí se nombra.
//
// Todo se actualiza por rAF leyendo `vehicleState` y escribiendo en el DOM a
// mano — cero re-renders de React, igual que MundoMiniMap. Un setState por
// frame en una página con física a 60fps es exactamente lo que no queremos.

const NAVIGATED_KEY = "mundo:ha-navegado";
/** Radio alrededor de la cabecera del varadero donde se ofrece la pista. */
const HINT_RADIUS = 11;

function hasNavigated(): boolean {
  try {
    return localStorage.getItem(NAVIGATED_KEY) === "1";
  } catch {
    return false;
  }
}
function markNavigated(): void {
  try {
    localStorage.setItem(NAVIGATED_KEY, "1");
  } catch {
    /* sin persistencia la pista reaparecerá: fallo benigno */
  }
}

interface Props {
  visible?: boolean;
}

export default function MundoModeBadge({ visible = true }: Props) {
  const badgeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const carIconRef = useRef<SVGSVGElement>(null);
  const boatIconRef = useRef<SVGSVGElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;

    const [hx, hz] = slipwayPoint(SLIPWAY_U0, 0);
    let prevMode = vehicleState.mode;
    let changedAt = -Infinity;
    let navigated = hasNavigated();
    let hintShown = false;
    let raf = 0;
    // El territorio arranca dormido y el spawn está PEGADO al varadero: sin
    // esta puerta la pista salía durante la intro, encima del "haz clic para
    // despertarlo". Solo se ofrece con el mundo ya despierto.
    let awake = false;
    const onReveal = () => {
      awake = true;
    };
    window.addEventListener("mundo:reveal", onReveal);
    // El badge arranca oculto: sin haberse movido nadie necesita que le digan
    // que va en carro. Aparece la primera vez que cambia algo.
    let everShown = false;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const mode = vehicleState.mode;

      if (mode !== prevMode) {
        prevMode = mode;
        changedAt = now;
        everShown = true;
        if (mode === "boat" && !navigated) {
          navigated = true;
          markNavigated();
        }
        const isBoat = mode === "boat";
        if (labelRef.current) labelRef.current.textContent = isBoat ? "PANGA" : "CARRO";
        if (carIconRef.current) carIconRef.current.style.display = isBoat ? "none" : "";
        if (boatIconRef.current) boatIconRef.current.style.display = isBoat ? "" : "none";
      }

      // Badge: destaca ~2.6 s tras el cambio y luego se queda tenue.
      const badge = badgeRef.current;
      if (badge) {
        const age = now - changedAt;
        let opacity = 0;
        let scale = 1;
        if (everShown) {
          if (age < 2600) {
            const inT = Math.min(1, age / 180); // entrada rápida
            const outT = age > 2000 ? 1 - (age - 2000) / 600 : 1;
            opacity = 0.35 + 0.65 * Math.min(inT, outT);
            scale = 1 + 0.12 * Math.max(0, 1 - age / 320);
          } else {
            opacity = 0.35;
          }
        }
        badge.style.opacity = String(opacity);
        badge.style.transform = `translateX(-50%) scale(${scale.toFixed(3)})`;
      }

      // Pista contextual: solo a quien nunca ha navegado, y solo cerca de la
      // rampa. En cuanto se transforma una vez, no vuelve a aparecer jamás.
      const hint = hintRef.current;
      if (hint) {
        const near =
          awake &&
          !navigated &&
          mode === "car" &&
          Math.hypot(vehicleState.x - hx, vehicleState.z - hz) < HINT_RADIUS;
        if (near !== hintShown) {
          hintShown = near;
          hint.style.opacity = near ? "1" : "0";
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mundo:reveal", onReveal);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div
        ref={badgeRef}
        className="pointer-events-none absolute left-1/2 top-4 z-10 flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 shadow-lg backdrop-blur-md"
        style={{
          background: "rgba(2, 13, 26, 0.55)",
          opacity: 0,
          transform: "translateX(-50%)",
          transition: "none",
        }}
      >
        <svg
          ref={carIconRef}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffb347"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 13.5h18M5 13.5l1.6-4.2A2 2 0 0 1 8.5 8h7a2 2 0 0 1 1.9 1.3l1.6 4.2" />
          <path d="M4 13.5v3.2M20 13.5v3.2" />
          <circle cx="7.5" cy="17" r="1.6" />
          <circle cx="16.5" cy="17" r="1.6" />
        </svg>
        <svg
          ref={boatIconRef}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7fd8e8"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "none" }}
          aria-hidden
        >
          <path d="M3 12.5c3.4 5.5 14.6 5.5 18 0" />
          <path d="M3 12.5c3-1 15-1 18 0" />
          <path d="M3.5 18.5c2 1.4 4 1.4 6 0s4-1.4 6 0 4 1.4 5 .4" />
        </svg>
        <span
          ref={labelRef}
          className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80"
        >
          CARRO
        </span>
      </div>

      <div
        ref={hintRef}
        // En móvil el timón y los botones ocupan el ~27% inferior: ahí abajo la
        // pista quedaba debajo del joystick y no se leía.
        className="pointer-events-none absolute inset-x-0 bottom-[32%] z-10 flex justify-center px-4 md:bottom-[13%]"
        style={{ opacity: 0, transition: "opacity 420ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div
          className="flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2 shadow-lg backdrop-blur-md"
          style={{ background: "rgba(2, 13, 26, 0.6)" }}
        >
          <span
            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: "#37b26a" }}
          />
          <p className="font-sans text-[11px] leading-snug tracking-[0.06em] text-white/80 md:text-[12px]">
            Baja por el varadero — en el agua el carro se vuelve panga
          </p>
        </div>
      </div>
    </>
  );
}
