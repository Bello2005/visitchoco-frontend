import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Fiesta } from "../../../hooks/useFiestas";

const MES_COLORS: Record<number, string> = {
  1: "#0ea5e9",
  2: "#ec4899",
  3: "#10b981",
  4: "#8b5cf6",
  5: "#f97316",
  6: "#eab308",
  7: "#06b6d4",
  8: "#f59e0b",
  9: "#ef4444",
  10: "#6366f1",
  11: "#84cc16",
  12: "#14b8a6",
};

function mapaHref(f: Fiesta): string {
  const slug = f.slug || f.municipio_nombre.toLowerCase().replace(/\s+/g, "-");
  return `/mapa?m=${encodeURIComponent(slug)}`;
}

function MesSection({
  mes,
  nombre,
  fiestas,
  isOpen,
  onToggle,
  color,
}: {
  mes: number;
  nombre: string;
  fiestas: Fiesta[];
  isOpen: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-6 py-5 px-6 md:px-8 hover:bg-white/[0.02] transition-colors duration-200 text-left"
      >
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-white/20 text-xs font-mono w-4">{String(mes).padStart(2, "0")}</span>
        </div>

        <h3 className="font-serif text-white font-bold flex-1" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}>
          {nombre}
        </h3>

        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {fiestas.length} {fiestas.length === 1 ? "fiesta" : "fiestas"}
        </span>

        {isOpen ? (
          <ChevronUp size={16} className="text-white/30 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-white/30 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 px-6 md:px-8 space-y-3 pl-14 md:pl-16">
              {fiestas.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-24px" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-start gap-4 p-4 rounded-2xl border border-white/[0.06] hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 cursor-default"
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{f.es_principal ? "⭐" : "🎭"}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h4 className="text-white font-semibold text-base leading-tight">{f.nombre_fiesta}</h4>
                      {f.es_principal && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: `${color}25`, color }}
                        >
                          Principal
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <MapPin size={10} />
                        {f.municipio_nombre}
                        {f.corregimiento ? ` · ${f.corregimiento}` : ""}
                      </span>
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <Calendar size={10} />
                        {f.fechas_texto}
                      </span>
                    </div>
                  </div>

                  <a
                    href={mapaHref(f)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/60"
                    title="Ver en el mapa"
                  >
                    <MapPin size={14} />
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CalendarioAnual({
  porMes,
  mesActual,
  MESES,
  loading,
}: {
  porMes: Record<number, Fiesta[]>;
  mesActual: number;
  MESES: string[];
  loading: boolean;
}) {
  const mesesOrdenados = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ((mesActual - 1 + i) % 12) + 1).filter((m) => (porMes[m] || []).length > 0),
    [porMes, mesActual]
  );

  const [openMes, setOpenMes] = useState(mesActual);
  const [didSyncInitial, setDidSyncInitial] = useState(false);

  useEffect(() => {
    if (loading || didSyncInitial) return;
    if (mesesOrdenados.length === 0) {
      setDidSyncInitial(true);
      return;
    }
    if (!mesesOrdenados.includes(mesActual)) {
      setOpenMes(mesesOrdenados[0]);
    }
    setDidSyncInitial(true);
  }, [loading, mesesOrdenados, mesActual, didSyncInitial]);

  if (loading) {
    return (
      <div className="py-24 px-6 md:px-16 space-y-3 max-w-4xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl animate-pulse bg-white/5" />
        ))}
      </div>
    );
  }

  if (mesesOrdenados.length === 0) {
    return (
      <section id="calendario" className="py-24 bg-[#0c0800] px-6 md:px-16">
        <div className="max-w-4xl mx-auto text-center text-white/40 text-sm">
          Aún no hay fiestas en el calendario.
        </div>
      </section>
    );
  }

  return (
    <section id="calendario" className="py-24 bg-[#0c0800]">
      <div className="max-w-4xl mx-auto">
        <div className="px-6 md:px-8 mb-12">
          <p className="text-white/30 text-xs font-semibold tracking-[0.25em] uppercase mb-4">Calendario festivo completo</p>
          <h2 className="font-serif text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
            12 meses.
            <br />
            <span className="text-white/30">Ninguno en silencio.</span>
          </h2>
        </div>

        <div className="relative pl-7 md:pl-9">
          <div
            className="pointer-events-none absolute left-2 md:left-3 top-3 bottom-3 w-px rounded-full"
            style={{
              background:
                "linear-gradient(to bottom, rgba(245,158,11,0.5), rgba(255,255,255,0.12), rgba(16,185,129,0.25))",
            }}
            aria-hidden
          />
          <div
            className="border border-white/[0.06] rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.01)" }}
          >
          {mesesOrdenados.map((mes) => (
            <MesSection
              key={mes}
              mes={mes}
              nombre={MESES[mes - 1]}
              fiestas={porMes[mes] || []}
              isOpen={openMes === mes}
              onToggle={() => setOpenMes(openMes === mes ? 0 : mes)}
              color={MES_COLORS[mes]}
            />
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
