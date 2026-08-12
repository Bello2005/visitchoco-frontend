/**
 * S4 — Cronología de las primeras 36 horas.
 *
 * Transición de la acción a la comprensión. Aquí viven las réplicas, y con
 * ellas la discrepancia entre el conteo del SGC y el de la prensa: mostrar
 * la divergencia es el movimiento honesto, no esconderla tras un promedio.
 */

import { Seccion } from "./Seccion";
import { FuenteTag, RangoDisputa } from "../../../components/ui/Fuente";
import { CRONOLOGIA, REPLICAS_TOTAL } from "../../../content/sismoData";

export function CronologiaSection() {
  return (
    <Seccion
      id="cronologia"
      eyebrow="Qué pasó"
      titulo="Las primeras 36 horas"
      intro="Un sismo de esta magnitud no es un instante: es una secuencia. La corteza sigue reacomodándose durante semanas."
    >
      <ol className="relative border-l border-white/[0.10] pl-6 md:pl-8">
        {CRONOLOGIA.map((hito, i) => (
          <li key={`${hito.fecha}-${hito.hora}-${i}`} className="relative pb-8 last:pb-0">
            {/* Punto de la línea de tiempo. Sólo el evento principal lleva
                rojo — el resto es neutro, por presupuesto cromático. */}
            <span
              aria-hidden="true"
              className={
                i === 0
                  ? "absolute -left-[calc(1.5rem+4.5px)] md:-left-[calc(2rem+4.5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-chirimia-400 ring-4 ring-chirimia-500/15"
                  : "absolute -left-[calc(1.5rem+3.5px)] md:-left-[calc(2rem+3.5px)] top-2 h-1.5 w-1.5 rounded-full bg-white/35"
              }
            />

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-body-sm text-white/85 tabular-nums">
                {hito.hora}
              </span>
              <span className="font-mono text-micro uppercase tracking-eyebrow text-white/55">
                {hito.fecha}
              </span>
              {hito.magnitud && (
                <span className="rounded-full border border-white/[0.10] px-2 py-0.5 font-mono text-micro text-white/70">
                  M {hito.magnitud}
                </span>
              )}
            </div>

            <h3 className="mt-1.5 text-body-lg font-medium text-white">
              {hito.titulo}
            </h3>
            <p className="mt-1 text-body-sm text-white/65 leading-relaxed max-w-[62ch]">
              {hito.detalle}
            </p>
            <FuenteTag fuente={hito.fuente} corte={hito.corte} className="mt-2" />
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <RangoDisputa cifra={REPLICAS_TOTAL} />
        <p className="mt-3 text-body-sm text-white/55 leading-relaxed max-w-[62ch]">
          Las réplicas pequeñas sólo las detecta la red sismológica del SGC: los
          catálogos internacionales registran apenas dos eventos de toda esta
          secuencia. Por eso esta página no muestra un contador en vivo.
        </p>
      </div>
    </Seccion>
  );
}
