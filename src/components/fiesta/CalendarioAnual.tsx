import { useMemo } from "react";
import { motion } from "framer-motion";
import { useFiestas, MESES } from "../../hooks/useFiestas";
import type { Fiesta } from "../../hooks/useFiestas";
import { FALLBACK_FIESTAS } from "./fiestaFallbackData";
import {
  municipioToSubregion,
  subregionDotClass,
  subregionLabel,
  type SubregionKey,
} from "./subregionFromMunicipio";

const LEGEND: SubregionKey[] = [
  "atrato",
  "san_juan",
  "baudo",
  "pacifico_norte",
  "darien",
];

function buildPorMes(source: Fiesta[]) {
  return MESES.reduce((acc, _mes, i) => {
    acc[i + 1] = source.filter((f) => f.mes === i + 1);
    return acc;
  }, {} as Record<number, Fiesta[]>);
}

export function CalendarioAnual() {
  const { fiestas, loading, mesActual } = useFiestas();

  const porMes = useMemo(() => {
    const source =
      !loading && fiestas.length === 0 ? FALLBACK_FIESTAS : fiestas;
    return buildPorMes(source);
  }, [fiestas, loading]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0a0600] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="mb-10 text-center md:mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-amber-500/50">
            Calendario Festivo — Todo el año
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-white/90">
            Cuándo celebra el Chocó
          </h2>
        </header>

        <div className="mb-8 flex flex-wrap justify-center gap-2 md:gap-3">
          {LEGEND.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-900/30 bg-[#120a00] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${subregionDotClass(key)}`}
              />
              {subregionLabel(key)}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-px bg-amber-900/20 md:grid-cols-3">
            {MESES.map((_, i) => (
              <div
                key={i}
                className="animate-pulse space-y-3 bg-[#0a0600] p-4"
              >
                <div className="h-3 w-20 rounded bg-amber-900/10" />
                <div className="h-4 w-full rounded bg-amber-900/10" />
                <div className="h-4 w-4/5 rounded bg-amber-900/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-amber-900/20 md:grid-cols-3">
            {MESES.map((nombreMes, idx) => {
              const mesNum = idx + 1;
              const lista = porMes[mesNum] || [];
              const esEsteMes = mesNum === mesActual;

              return (
                <div
                  key={nombreMes}
                  className="min-h-[140px] bg-[#0a0600] p-4 md:p-5"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-white/70">
                      {nombreMes}
                    </h3>
                    {esEsteMes && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Este mes
                      </span>
                    )}
                  </div>

                  {lista.length === 0 ? (
                    <p className="text-xs italic text-white/20">
                      Mes tranquilo
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {lista.map((f) => {
                        const sub = municipioToSubregion(f.municipio_nombre);
                        return (
                          <li
                            key={f.id}
                            className="group rounded px-2 py-1 -mx-2 transition-colors hover:bg-amber-900/20"
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${subregionDotClass(sub)}`}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white/80">
                                  {f.nombre_fiesta}
                                </p>
                                <p className="text-xs text-white/40">
                                  {f.municipio_nombre}
                                  {f.corregimiento
                                    ? ` · ${f.corregimiento}`
                                    : ""}
                                </p>
                                <p className="font-mono text-xs text-amber-500/70">
                                  {f.fechas_texto}
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}
