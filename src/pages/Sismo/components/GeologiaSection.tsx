/**
 * S6 — Por qué se sintió hasta Panamá.
 *
 * La comparativa de energía cierra con el callout que desactiva la lectura
 * sensacionalista: el sismo de 1999 liberó 150 veces menos energía y mató
 * a muchas más personas.
 */

import { Seccion } from "./Seccion";
import { SlabDiagram } from "./SlabDiagram";
import { CALLOUT_ENERGIA, COMPARATIVAS, GEOLOGIA_PARRAFOS } from "../../../content/sismoData";
import { cn } from "../../../lib/cn";

export function GeologiaSection() {
  return (
    <Seccion
      id="geologia"
      eyebrow="Por qué pasó así"
      titulo="Por qué se sintió hasta Panamá y el epicentro no fue lo más destruido"
    >
      <div className="space-y-4 max-w-[65ch]">
        {GEOLOGIA_PARRAFOS.map((p) => (
          <p key={p.slice(0, 32)} className="text-body-lg text-white/75 leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      <SlabDiagram />

      {/* ── Comparativa de energía ────────────────────────────────── */}
      <h3 className="mt-12 font-display text-h3 text-white">
        Comparado con otros sismos colombianos
      </h3>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.12]">
              {["Sismo", "Magnitud", "Energía", "Profundidad", "Fallecidos"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="pb-2.5 pr-4 text-micro uppercase tracking-eyebrow text-white/55 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARATIVAS.map((c) => {
              const esActual = c.anio === 2026;
              return (
                <tr
                  key={`${c.evento}-${c.anio}`}
                  className={cn(
                    "border-b border-white/[0.06]",
                    esActual && "bg-chirimia-500/[0.06]",
                  )}
                >
                  <th
                    scope="row"
                    className="py-3 pr-4 text-body-sm font-medium text-white text-left"
                  >
                    {c.evento}{" "}
                    <span className="font-mono text-micro text-white/50">{c.anio}</span>
                  </th>
                  <td className="py-3 pr-4 font-mono text-body-sm text-white/85 tabular-nums">
                    {c.magnitud}
                  </td>
                  <td className="py-3 pr-4 text-body-sm text-white/65">{c.relacion}</td>
                  <td className="py-3 pr-4 text-body-sm text-white/65">{c.profundidad}</td>
                  <td className="py-3 text-body-sm text-white/65">{c.fallecidos}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.12] bg-white/[0.03] p-5 md:p-6">
        <h4 className="text-body-lg font-medium text-white">{CALLOUT_ENERGIA.titulo}</h4>
        <p className="mt-2 text-body text-white/70 leading-relaxed max-w-[65ch]">
          {CALLOUT_ENERGIA.cuerpo}
        </p>
      </div>
    </Seccion>
  );
}
