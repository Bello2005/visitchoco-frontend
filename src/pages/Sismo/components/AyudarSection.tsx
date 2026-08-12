/**
 * S3 — Cómo ayudar.
 *
 * La advertencia antifraude va PRIMERO y es el elemento más prominente de
 * la sección, no una nota al pie: objetivamente es lo más valioso que esta
 * página puede hacer por alguien.
 *
 * El bloque "qué no donar" es doctrina humanitaria estándar que casi nadie
 * publica, y evita toneladas de ayuda que estorban más de lo que sirven.
 */

import { AlertTriangle, ArrowUpRight, Check, Droplet, HeartHandshake, X } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Seccion } from "./Seccion";
import { FuenteTag } from "../../../components/ui/Fuente";
import { formatearCorte } from "../../../lib/fechas";
import {
  ADVERTENCIA_FRAUDE,
  CANALES_AYUDA,
  DONAR_NO,
  DONAR_SI,
} from "../../../content/sismoData";

export function AyudarSection() {
  return (
    <Seccion
      id="ayudar"
      eyebrow="Si quieres ayudar"
      titulo="Cómo ayudar, sin que la ayuda se pierda"
    >
      {/* ── Antifraude: lo primero y lo más visible ────────────────── */}
      <div className="rounded-2xl border border-chirimia-400/30 bg-chirimia-500/[0.07] p-5 md:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-chirimia-400"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-body-lg font-medium text-white">
              {ADVERTENCIA_FRAUDE.titulo}
            </h3>
            <p className="mt-2 text-body text-white/75 leading-relaxed max-w-[62ch]">
              {ADVERTENCIA_FRAUDE.cuerpo}
            </p>
            <p className="mt-3 text-body-sm text-white/65 leading-relaxed max-w-[62ch] border-l-2 border-chirimia-400/40 pl-3">
              {ADVERTENCIA_FRAUDE.regla}
            </p>
            <FuenteTag
              fuente={ADVERTENCIA_FRAUDE.fuente}
              corte={ADVERTENCIA_FRAUDE.corte}
              className="mt-3"
            />
          </div>
        </div>
      </div>

      {/* ── Canales oficiales ─────────────────────────────────────── */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {CANALES_AYUDA.map((canal) => {
          const Icon = canal.tipo === "sangre" ? Droplet : HeartHandshake;
          return (
            // Patrón de enlace extendido: la tarjeta es un div y sólo el
            // título es enlace, con un ::after que cubre la tarjeta entera.
            // Meter la tarjeta dentro de un <a> anidaría anchors (el de
            // FuenteTag), que es HTML inválido y rompe el recorrido por
            // teclado y por lector de pantalla.
            <div
              key={canal.id}
              className={cn(
                "group relative flex flex-col rounded-2xl border border-white/[0.10] bg-white/[0.03] p-5",
                "transition-colors hover:bg-white/[0.06] hover:border-white/20",
                "focus-within:ring-2 focus-within:ring-chirimia-400",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <Icon size={20} className="shrink-0 text-white/70" aria-hidden="true" />
                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-white/50 group-hover:text-white transition-colors"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-3 text-body-lg font-medium text-white">
                <a
                  href={canal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
                >
                  {canal.nombre}
                </a>
              </h3>
              <p className="mt-1.5 text-body-sm text-white/65 leading-relaxed flex-1">
                {canal.detalle}
              </p>
              {/* z-10 para quedar por encima del ::after de la tarjeta. */}
              <div className="relative z-10 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <FuenteTag fuente={canal.fuente} corte={canal.corte} />
                <span className="font-mono text-micro text-white/55">
                  verificado {formatearCorte(canal.verificado)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Qué sí y qué no ───────────────────────────────────────── */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <h3 className="text-body-lg font-medium text-white">Qué sí sirve</h3>
          <ul className="mt-3 space-y-2">
            {DONAR_SI.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check
                  size={15}
                  className="mt-1 shrink-0 text-atrato-400"
                  aria-hidden="true"
                />
                <span className="text-body-sm text-white/75 leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <h3 className="text-body-lg font-medium text-white">
            Qué no, aunque parezca que sí
          </h3>
          <ul className="mt-3 space-y-3">
            {DONAR_NO.map(({ que, porque }) => (
              <li key={que} className="flex items-start gap-2.5">
                <X
                  size={15}
                  className="mt-1 shrink-0 text-white/55"
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block text-body-sm font-medium text-white/85">
                    {que}
                  </span>
                  <span className="block text-body-sm text-white/60 leading-relaxed">
                    {porque}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Seccion>
  );
}
