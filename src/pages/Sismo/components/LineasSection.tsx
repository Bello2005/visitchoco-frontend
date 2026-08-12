/**
 * S2 — Líneas de emergencia.
 *
 * Va antes que "cómo ayudar" porque quien tiene familia en la zona es
 * la audiencia con el coste de error más alto, y marcar es un solo toque.
 *
 * Sólo entran números contrastados a mano contra su fuente; la fecha de
 * verificación se pinta para que el lector juzgue.
 */

import { Mail, Phone, Users } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Seccion } from "./Seccion";
import { FuenteTag } from "../../../components/ui/Fuente";
import { formatearCorte } from "../../../lib/fechas";
import { LINEAS } from "../../../content/sismoData";

export function LineasSection() {
  return (
    <Seccion
      id="lineas"
      eyebrow="Si necesitas ayuda ahora"
      titulo="Líneas de emergencia"
      intro="Usa estas líneas sólo si hay una situación que requiera atención. Cada llamada innecesaria ocupa un canal que alguien más puede necesitar con urgencia."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {LINEAS.map((linea) => {
          const destacada = linea.id === "123" || linea.id === "rcf";
          const Icon =
            linea.tipo === "contacto-familiar" ? Users : Phone;

          return (
            <li
              key={linea.id}
              className={cn(
                "rounded-2xl border p-4",
                destacada
                  ? "border-chirimia-400/25 bg-chirimia-500/[0.06] sm:col-span-1"
                  : "border-white/[0.08] bg-white/[0.02]",
              )}
            >
              <div className="flex items-start gap-3">
                <Icon
                  size={18}
                  className={cn(
                    "mt-0.5 shrink-0",
                    destacada ? "text-chirimia-400" : "text-white/60",
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  {linea.etiqueta && (
                    <p className="text-micro uppercase tracking-eyebrow text-white/55">
                      {linea.etiqueta}
                    </p>
                  )}
                  {/* Área táctil ≥48px sobre el número, que es el objetivo real. */}
                  <a
                    href={`tel:${linea.tel}`}
                    aria-label={`Llamar a ${linea.etiqueta ?? linea.nombre}, número ${linea.nombre}`}
                    className={cn(
                      "inline-flex items-center min-h-[44px] font-mono text-h3 text-white",
                      "hover:text-chirimia-400 transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chirimia-400 rounded",
                    )}
                  >
                    {linea.nombre}
                  </a>
                  <p className="text-body-sm text-white/65 leading-relaxed">
                    {linea.detalle}
                  </p>

                  {linea.email && (
                    <a
                      href={`mailto:${linea.email}`}
                      className="mt-2 inline-flex items-center gap-1.5 text-body-sm text-white/75 hover:text-white transition-colors break-all"
                    >
                      <Mail size={13} className="shrink-0" aria-hidden="true" />
                      {linea.email}
                    </a>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <FuenteTag fuente={linea.fuente} corte={linea.corte} />
                    <span className="font-mono text-micro text-white/55">
                      verificado {formatearCorte(linea.verificado)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Seccion>
  );
}
