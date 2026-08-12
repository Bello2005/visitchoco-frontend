/**
 * S5 — Impacto humano.
 *
 * La sección difícil. Abre explicando por qué no hay una cifra única, y
 * después lista lo que reportó cada entidad y cuándo.
 *
 * Deliberadamente sin `CountUp`, sin color y sin escalonado de entrada:
 * un contador que sube desde cero fabrica todas las cifras intermedias
 * —que ninguna fuente reportó— y animar un conteo de muertos como
 * espectáculo es indefendible.
 */

import { Seccion } from "./Seccion";
import { FuenteTag, RangoDisputa } from "../../../components/ui/Fuente";
import { CIFRAS_EN_DISPUTA, IMPACTO_CIUDADES, NOTA_CIFRAS } from "../../../content/sismoData";

export function ImpactoSection() {
  return (
    <Seccion
      id="impacto"
      eyebrow="El costo humano"
      titulo="Lo que se sabe, y con qué grado de certeza"
    >
      <div className="rounded-2xl border border-white/[0.12] bg-white/[0.03] p-5 md:p-6">
        <h3 className="text-body-lg font-medium text-white">{NOTA_CIFRAS.titulo}</h3>
        <p className="mt-2 text-body text-white/70 leading-relaxed max-w-[65ch]">
          {NOTA_CIFRAS.cuerpo}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {CIFRAS_EN_DISPUTA.map((cifra) => (
          <RangoDisputa key={cifra.id} cifra={cifra} />
        ))}
      </div>

      <h3 className="mt-12 font-display text-h3 text-white">
        Dónde golpeó más fuerte
      </h3>
      <p className="mt-2 text-body-sm text-white/60 leading-relaxed max-w-[62ch]">
        El epicentro no fue lo más letal. La profundidad del sismo repartió la
        energía sobre cientos de kilómetros, y el daño se concentró donde había
        más construido.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {IMPACTO_CIUDADES.map((c) => (
          <div
            key={c.ciudad}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
          >
            <div className="flex items-baseline gap-2">
              <h4 className="text-body-lg font-medium text-white">{c.ciudad}</h4>
              <span className="text-micro text-white/50">{c.departamento}</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {c.lineas.map((l) => (
                <li
                  key={l}
                  className="text-body-sm text-white/70 leading-relaxed pl-3.5 relative"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-white/30"
                  />
                  {l}
                </li>
              ))}
            </ul>
            <FuenteTag fuente={c.fuente} corte={c.corte} className="mt-3" />
          </div>
        ))}
      </div>
    </Seccion>
  );
}
