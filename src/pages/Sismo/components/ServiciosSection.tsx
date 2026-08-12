/**
 * S8 — Estado de servicios y viajes.
 *
 * El bloque que sólo tiene sentido en un sitio de turismo: la audiencia
 * propia de VisitChocó es gente con un viaje planeado, y lo más útil que
 * se le puede decir es que no llame a los prestadores locales.
 */

import { Seccion } from "./Seccion";
import { FuenteTag } from "../../../components/ui/Fuente";
import { NOTA_VIAJEROS, SERVICIOS } from "../../../content/sismoData";

export function ServiciosSection() {
  return (
    <Seccion
      id="servicios"
      eyebrow="Estado del territorio"
      titulo="Servicios, vías y viajes"
    >
      <ul className="space-y-3">
        {SERVICIOS.map((s) => (
          <li
            key={s.servicio}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-body-lg font-medium text-white">{s.servicio}</h3>
              <span className="rounded-full border border-white/[0.12] px-2.5 py-0.5 text-micro text-white/70">
                {s.estado}
              </span>
            </div>
            <p className="mt-2 text-body-sm text-white/65 leading-relaxed max-w-[62ch]">
              {s.detalle}
            </p>
            <FuenteTag fuente={s.fuente} corte={s.corte} className="mt-2.5" />
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-white/[0.12] bg-white/[0.03] p-5 md:p-6">
        <h3 className="text-body-lg font-medium text-white">
          Si tenías un viaje al Chocó
        </h3>
        <ul className="mt-3 space-y-2.5">
          {NOTA_VIAJEROS.map((n) => (
            <li key={n.slice(0, 24)} className="relative pl-4">
              <span
                aria-hidden="true"
                className="absolute left-0 top-[0.65em] h-1 w-1 rounded-full bg-white/35"
              />
              <span className="text-body text-white/70 leading-relaxed">{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </Seccion>
  );
}
