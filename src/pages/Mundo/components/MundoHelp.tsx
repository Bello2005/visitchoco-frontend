import { useEffect, useRef, useState } from "react";

// AYUDA DEL MUNDO — la leyenda de teclas que hasta ahora NO existía.
//
// Se podía conducir, reiniciar, enderezar el carro y transformarlo en panga, y
// en ningún sitio se decía. El panel se abre SOLO la primera visita (divulgación
// progresiva: al que ya sabe no se le repite) y después arranca plegado.
//
// Vive fuera del <Canvas>, como el resto del HUD, y usa el mismo vidrio oscuro
// que los botones de sonido y calidad para leerse como parte del mismo riel.

const SEEN_KEY = "mundo:ayuda-vista";

/** ¿Es la primera vez que este navegador entra al mundo? */
function firstVisit(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    // Safari en privado revienta al tocar localStorage: que no abra sola, pero
    // que el botón siga funcionando.
    return false;
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* sin persistencia, se abrirá otra vez: es el fallo benigno */
  }
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.6rem] items-center justify-center rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white/85">
      {children}
    </kbd>
  );
}

function Row({ keys, children }: { keys: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2">
      <div className="flex shrink-0 items-center gap-1 pt-px">{keys}</div>
      <p className="text-[12px] leading-snug text-white/70">{children}</p>
    </div>
  );
}

interface MundoHelpProps {
  visible?: boolean;
}

export default function MundoHelp({ visible = true }: MundoHelpProps) {
  const [open, setOpen] = useState(false);
  const opened = useRef(false);

  // Primera visita: se abre sola tras un respiro, para que no compita con el
  // "haz clic para despertarlo" ni con la explosión del revelado.
  useEffect(() => {
    if (!visible || opened.current) return;
    if (!firstVisit()) return;
    opened.current = true;
    const t = setTimeout(() => {
      setOpen(true);
      markSeen();
    }, 2600);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="absolute left-4 top-[8rem] z-10">
      <button
        type="button"
        aria-label="Cómo se juega"
        aria-expanded={open}
        // stopPropagation obligatorio: Mundo escucha pointerdown en window para
        // despertar el territorio; sin esto, abrir el panel lo dispararía.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          markSeen();
          setOpen((v) => !v);
        }}
        // Estado ABIERTO visible: el botón es el interruptor del panel, y sin
        // marcarlo no se adivina que el mismo "?" vuelve a ocultarlo.
        className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-colors ${
          open
            ? "border-white/35 text-white"
            : "border-white/15 text-white/80 hover:text-white"
        }`}
        style={{ background: open ? "rgba(12, 32, 48, 0.8)" : "rgba(2, 13, 26, 0.55)" }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9.5" />
          <path d="M9.2 9.2a2.9 2.9 0 1 1 3.6 2.85c-.5.14-.8.6-.8 1.12v.58" />
          <line x1="12" y1="17.2" x2="12" y2="17.3" />
        </svg>
      </button>

      {open && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-2 w-[17.5rem] overflow-hidden rounded-2xl border border-white/15 shadow-[0_8px_32px_rgba(2,13,26,0.45)] backdrop-blur-md"
          style={{ background: "rgba(2, 13, 26, 0.62)" }}
        >
          <div className="flex items-center justify-between px-3 pb-1 pt-2.5">
            <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/45">
              Cómo se recorre
            </span>
            {/* Cierre explícito y con área de toque de verdad: el aspa fina de
                12 px no se leía como "esto se puede ocultar". */}
            <button
              type="button"
              aria-label="Ocultar los controles"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              className="-mr-1 flex h-7 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-2.5 text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
              <span className="text-[10px] font-medium tracking-wide">Ocultar</span>
            </button>
          </div>

          <div className="divide-y divide-white/[0.07]">
            <Row
              keys={
                <>
                  <Key>W</Key>
                  <Key>A</Key>
                  <Key>S</Key>
                  <Key>D</Key>
                </>
              }
            >
              Conducir. También con las flechas.
            </Row>
            <Row keys={<Key>Espacio</Key>}>Enderezar el carro si vuelca.</Row>
            <Row keys={<Key>R</Key>}>Volver al portal.</Row>
          </div>

          {/* El bloque que de verdad importa: la transformación */}
          <div className="border-t border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "#37b26a" }}
              />
              <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/45">
                Carro y panga
              </span>
            </div>
            <p className="text-[12px] leading-snug text-white/70">
              Baja por el <strong className="font-semibold text-white/85">varadero</strong>,
              al sur del portal: al entrar al agua el carro se vuelve{" "}
              <strong className="font-semibold text-white/85">panga</strong>, y al
              volver a tierra vuelve a ser carro. No hay que pulsar nada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
