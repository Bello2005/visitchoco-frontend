import { useEffect, useRef, useState } from "react";
import type { QualityChoice } from "../utils/qualityState";
import { qualityState, setQualityChoice } from "../utils/qualityState";
import { useQualityChoice, useQualityLevel } from "../utils/useQualityLevel";

// Menú de calidad gráfica. Calca el molde de vidrio oscuro de MundoAudio, en
// el hueco libre justo debajo del botón de mute.

const OPTIONS: { value: QualityChoice; label: string; hint: string }[] = [
  { value: "auto", label: "Automática", hint: "Según tu equipo" },
  { value: "high", label: "Alta", hint: "Sombras nítidas, más detalle" },
  { value: "medium", label: "Media", hint: "Equilibrada" },
  { value: "low", label: "Baja", hint: "Sin sombras, máximo rendimiento" },
];

const LEVEL_LABEL: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export default function MundoQuality({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false);
  const choice = useQualityChoice();
  const level = useQualityLevel();
  // Los counts de vegetación y los segmentos del agua se congelan al montar,
  // así que un cambio de nivel sólo se ve del todo tras recargar.
  const [needsReload, setNeedsReload] = useState(false);
  const initialLevel = useRef(level);
  const rootRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera, sin despertar el territorio.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  if (!visible) return null;

  const pick = (value: QualityChoice) => {
    setQualityChoice(value);
    setNeedsReload(qualityState.level !== initialLevel.current);
  };

  return (
    <div ref={rootRef} className="absolute left-4 top-[4.5rem] z-10">
      <button
        type="button"
        aria-label="Calidad gráfica"
        aria-expanded={open}
        // stopPropagation obligatorio: Mundo escucha pointerdown en window
        // para despertar el territorio; sin esto, abrir el menú lo dispararía.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 shadow-lg backdrop-blur-md transition-colors hover:text-white"
        style={{ background: "rgba(2, 13, 26, 0.55)" }}
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
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </button>

      {open && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-2 w-56 overflow-hidden rounded-2xl border border-white/15 p-1.5 shadow-[0_8px_32px_rgba(2,13,26,0.45)] backdrop-blur-md"
          style={{ background: "rgba(2, 13, 26, 0.55)" }}
        >
          <p className="px-2 pb-1.5 pt-1 font-sans text-[9px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Calidad gráfica
          </p>
          {OPTIONS.map((o) => {
            const active = choice === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  pick(o.value);
                }}
                className={`flex w-full flex-col items-start rounded-xl px-2.5 py-1.5 text-left transition-colors ${
                  active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
                }`}
              >
                <span className="font-sans text-[13px]">
                  {o.label}
                  {o.value === "auto" && choice === "auto"
                    ? ` · ${LEVEL_LABEL[level] ?? level}`
                    : ""}
                </span>
                <span className="font-sans text-[10px] text-white/40">{o.hint}</span>
              </button>
            );
          })}
          {needsReload && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.location.reload();
              }}
              className="mt-1 w-full rounded-xl px-2.5 py-1.5 text-left font-sans text-[10px] leading-snug text-[#ffb347] transition-colors hover:bg-white/10"
            >
              Algunos ajustes (densidad de vegetación, agua) se aplican al
              recargar · <span className="underline">Recargar ahora</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
