/**
 * S9 — Fuentes y método.
 *
 * Declarar la política editorial en la propia página es lo que separa
 * esto de un volcado de prensa: el lector puede juzgar el método, no
 * sólo el resultado.
 */

import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Seccion } from "./Seccion";
import { FUENTES, METODO } from "../../../content/sismoData";

const ETIQUETA_TIPO: Record<string, string> = {
  oficial: "Oficial",
  multilateral: "Internacional",
  prensa: "Prensa",
  academica: "Académica",
};

export function FuentesSismoSection() {
  return (
    <Seccion
      id="fuentes"
      eyebrow="Cómo hicimos esta página"
      titulo="Fuentes y método"
      intro="Para el dato del momento, ve directo a la fuente. Esta página se actualiza a mano y siempre irá por detrás."
    >
      <ul className="space-y-2">
        {Object.entries(FUENTES).map(([id, f]) => (
          <li key={id}>
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.05] hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chirimia-400"
            >
              <span className="min-w-0">
                <span className="block text-body-sm text-white">{f.nombre}</span>
                <span className="block text-micro text-white/55 truncate">{f.url}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="rounded-full border border-white/[0.10] px-2 py-0.5 text-micro text-white/55">
                  {ETIQUETA_TIPO[f.tipo] ?? f.tipo}
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-white/50 group-hover:text-white transition-colors"
                  aria-hidden="true"
                />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 font-display text-h3 text-white">Qué decidimos no hacer</h3>
      <dl className="mt-5 space-y-5">
        {METODO.map((m) => (
          <div key={m.titulo} className="border-l-2 border-white/[0.12] pl-4">
            <dt className="text-body font-medium text-white">{m.titulo}</dt>
            <dd className="mt-1 text-body-sm text-white/65 leading-relaxed max-w-[65ch]">
              {m.cuerpo}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 text-body-sm text-white/60 leading-relaxed max-w-[62ch]">
        Si encuentras un dato equivocado, desactualizado o una fuente mejor,
        escríbenos: preferimos corregir a tener razón. Puedes ver también las{" "}
        <Link
          to="/fuentes"
          className="text-white underline underline-offset-4 hover:text-chirimia-400 transition-colors"
        >
          fuentes de datos del resto del sitio
        </Link>
        .
      </p>
    </Seccion>
  );
}
