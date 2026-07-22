// Adaptado de World/Controls.js de folio-2019 (Bruno Simon, MIT).
// Ver src/pages/Mundo/CREDITS.md para la atribución y la licencia.
import { useEffect, useRef, useState } from "react";

// CONTROLES TÁCTILES estilo folio-2019 de Bruno Simon (MIT): joystick abajo a
// la IZQUIERDA para el volante y botones apilados abajo a la DERECHA para
// acelerar / reversa. Él mismo contó que quería "cero interfaz", pero no
// encontró nada más intuitivo en móvil que esto.
//
// INTEGRACIÓN: en vez de duplicar el estado de input, estos controles
// DESPACHAN KeyboardEvent sintéticos con los mismos `code` que el mapa de
// KeyboardControls (drei). Así Vehicle.tsx sigue leyendo getKeys() sin
// enterarse de nada — cero riesgo de desincronizar la física.
const KEY = {
  forward: "KeyW",
  backward: "KeyS",
  left: "KeyA",
  right: "KeyD",
} as const;

function press(code: string, down: boolean) {
  window.dispatchEvent(
    new KeyboardEvent(down ? "keydown" : "keyup", { code, bubbles: true })
  );
}

const JOY_SIZE = 150; // el de Bruno mide 170; algo menor va mejor en pantallas chicas
const JOY_LIMIT = 42; // tope del cursor (Bruno: 43)
const DEADZONE = 0.28; // a partir de aquí cuenta como giro

export default function MundoTouchControls() {
  // Solo en dispositivos táctiles (puntero grueso): en desktop estorbarían
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const joyRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const steerRef = useRef<"left" | "right" | null>(null);
  const touchIdRef = useRef<number | null>(null);

  // Suelta todo al desmontar (que no quede una tecla "pegada")
  useEffect(() => {
    return () => {
      Object.values(KEY).forEach((c) => press(c, false));
    };
  }, []);

  const setSteer = (next: "left" | "right" | null) => {
    if (steerRef.current === next) return;
    if (steerRef.current) press(KEY[steerRef.current], false);
    if (next) press(KEY[next], true);
    steerRef.current = next;
  };

  const moveCursor = (dx: number, dy: number) => {
    const c = cursorRef.current;
    if (c) c.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onJoyMove = (clientX: number, clientY: number) => {
    const el = joyRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > JOY_LIMIT) {
      dx = (dx / dist) * JOY_LIMIT;
      dy = (dy / dist) * JOY_LIMIT;
    }
    moveCursor(dx, dy);
    const nx = dx / JOY_LIMIT; // -1 (izq) .. 1 (der)
    setSteer(nx < -DEADZONE ? "left" : nx > DEADZONE ? "right" : null);
  };

  const endJoy = () => {
    touchIdRef.current = null;
    moveCursor(0, 0);
    setSteer(null);
  };

  if (!isTouch) return null;

  const btn =
    "pointer-events-auto select-none touch-none flex items-center justify-center " +
    "rounded-xl border border-white/25 bg-black/35 backdrop-blur-sm " +
    "text-white/90 active:bg-white/25 transition-colors";

  return (
    <div className="pointer-events-none absolute inset-0 z-20 md:hidden">
      {/* ---- JOYSTICK (volante) ---- */}
      <div
        ref={joyRef}
        className="pointer-events-auto absolute bottom-3 left-3 touch-none rounded-full
                   border border-white/20 bg-black/25 backdrop-blur-sm"
        style={{ width: JOY_SIZE, height: JOY_SIZE }}
        onTouchStart={(e) => {
          const t = e.changedTouches[0];
          touchIdRef.current = t.identifier;
          onJoyMove(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          for (const t of Array.from(e.changedTouches)) {
            if (t.identifier === touchIdRef.current) onJoyMove(t.clientX, t.clientY);
          }
        }}
        onTouchEnd={endJoy}
        onTouchCancel={endJoy}
      >
        {/* anillo de tope */}
        <div
          className="absolute rounded-full border border-white/25"
          style={{
            width: JOY_LIMIT * 2,
            height: JOY_LIMIT * 2,
            left: JOY_SIZE / 2 - JOY_LIMIT,
            top: JOY_SIZE / 2 - JOY_LIMIT,
          }}
        />
        {/* cursor */}
        <div
          ref={cursorRef}
          className="absolute rounded-full bg-white/85 will-change-transform"
          style={{
            width: 46,
            height: 46,
            left: JOY_SIZE / 2 - 23,
            top: JOY_SIZE / 2 - 23,
          }}
        />
        <span className="absolute inset-x-0 -top-6 text-center font-sans text-[10px] uppercase tracking-[0.25em] text-white/50">
          Timón
        </span>
      </div>

      {/* ---- BOTONES (acelerador / reversa) ---- */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2.5">
        <button
          aria-label="Acelerar"
          className={`${btn} h-[74px] w-[96px]`}
          onTouchStart={(e) => {
            e.preventDefault();
            press(KEY.forward, true);
          }}
          onTouchEnd={() => press(KEY.forward, false)}
          onTouchCancel={() => press(KEY.forward, false)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 4 L20 18 L4 18 Z" fill="currentColor" />
          </svg>
        </button>
        <button
          aria-label="Frenar y retroceder"
          className={`${btn} h-[74px] w-[96px]`}
          onTouchStart={(e) => {
            e.preventDefault();
            press(KEY.backward, true);
          }}
          onTouchEnd={() => press(KEY.backward, false)}
          onTouchCancel={() => press(KEY.backward, false)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 20 L4 6 L20 6 Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
