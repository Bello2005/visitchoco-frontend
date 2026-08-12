/**
 * S0 — Ficha del evento.
 *
 * Deliberadamente NO es `h-[100dvh]` como el resto de heroes del sitio:
 * en un teléfono, un hero a pantalla completa esconde los teléfonos de
 * emergencia bajo el pliegue. Aquí el hero cede espacio al contenido.
 *
 * Tampoco lleva titular lírico ni foto de escombros. El titular es la
 * frase más factual posible.
 */

import { motion, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import { dur, ease } from "../../../lib/motion";
import { FichaChip, FuenteTag } from "../../../components/ui/Fuente";
import { formatearCorte } from "../../../lib/fechas";
import { ALCANCE, FICHA, SISMO_META } from "../../../content/sismoData";

export function SismoHero() {
  const reduce = useReducedMotion();

  return (
    <header className="relative px-6 md:px-16 pt-24 md:pt-32 pb-12 md:pb-16 grain">
      {/* Rescoldo muy tenue: la única presencia del rojo en el hero, muy por
          debajo del 2% de presupuesto cromático de la página. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 15% 0%, rgba(196,61,35,0.10) 0%, transparent 65%)",
        }}
      />

      <motion.div
        className="relative z-[2] mx-auto max-w-5xl"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: dur.slow, ease: ease.out }}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-chirimia-400/30 bg-chirimia-500/10 px-3 py-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-chirimia-400"
              aria-hidden="true"
            />
            <span className="text-micro uppercase tracking-eyebrow text-chirimia-400">
              Emergencia en curso
            </span>
          </span>
          <span className="font-mono text-micro text-white/55">
            Página actualizada {formatearCorte(SISMO_META.paginaActualizada)}
          </span>
        </div>

        <h1 className="mt-6 font-display text-h1 text-white text-balance">
          Sismo de magnitud 7,4 con epicentro en San José del Palmar
        </h1>

        <p className="mt-5 text-body-lg text-white/75 leading-relaxed max-w-[62ch]">
          El 10 de agosto de 2026, a las 7:34 de la mañana, el mayor sismo
          registrado en Colombia en lo que va del siglo tuvo su epicentro en un
          municipio del Chocó de unos cinco mil habitantes. Esta página reúne lo
          que se sabe, con la fuente y la hora de cada dato.
        </p>

        {/* El aviso de alcance va arriba, no en el pie: quien llega buscando
            ayuda tiene que saber de inmediato qué es y qué no es esta página. */}
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 max-w-[62ch]">
          <Info size={15} className="mt-0.5 shrink-0 text-white/55" aria-hidden="true" />
          <p className="text-body-sm text-white/65 leading-relaxed">
            Recopilamos información pública verificable.{" "}
            <strong className="font-medium text-white/85">
              No somos un canal oficial de emergencias
            </strong>
            . Para reportar una emergencia, marca 123.
          </p>
        </div>

        {/* Ficha técnica: la parte estable y oficial del evento. */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FICHA.map((item) => (
            <FichaChip key={item.etiqueta} item={item} />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          {ALCANCE.map((d) => (
            <div key={d.unidad}>
              <p className="font-mono text-body-lg text-white">
                {d.valor}{" "}
                <span className="text-body-sm font-sans text-white/60">
                  {d.unidad}
                </span>
              </p>
              <FuenteTag fuente={d.fuente} corte={d.corte} className="mt-1" />
            </div>
          ))}
        </div>
      </motion.div>
    </header>
  );
}
