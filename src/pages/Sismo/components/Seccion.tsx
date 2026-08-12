/**
 * Envoltorio de sección para /sismo.
 *
 * El sitio no tiene un `<Section>` genérico — el patrón es convencional y
 * cada página repite su propio `<section>`. Aquí sí compensa uno local:
 * son diez secciones en una misma página que se van a editar bajo presión
 * de tiempo, y el `scroll-mt` (necesario para que el nav fijo no tape el
 * encabezado al saltar desde un enlace con hash) es exactamente el detalle
 * que se olvida cuando se copia y pega.
 */

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../../lib/cn";
import { dur, ease } from "../../../lib/motion";

interface SeccionProps {
  id: string;
  eyebrow?: string;
  titulo: string;
  /** Párrafo introductorio bajo el titular. */
  intro?: string;
  children: ReactNode;
  className?: string;
  /** Ancho del contenido. `ancho` para tablas y rejillas. */
  ancho?: "lectura" | "ancho";
}

export function Seccion({
  id,
  eyebrow,
  titulo,
  intro,
  children,
  className,
  ancho = "ancho",
}: SeccionProps) {
  const reduce = useReducedMotion();
  const tituloId = `${id}-titulo`;

  return (
    <section
      id={id}
      aria-labelledby={tituloId}
      // scroll-mt: sin esto, saltar a #ayudar deja el encabezado bajo el nav fijo.
      className={cn(
        "scroll-mt-24 md:scroll-mt-28 px-6 md:px-16 py-16 md:py-24",
        className,
      )}
    >
      <div className={cn("mx-auto", ancho === "lectura" ? "max-w-3xl" : "max-w-5xl")}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={reduce ? { duration: 0 } : { duration: dur.slow, ease: ease.out }}
        >
          {eyebrow && (
            <p className="text-eyebrow uppercase text-white/55 mb-3">{eyebrow}</p>
          )}
          <h2
            id={tituloId}
            className="font-display text-h2 text-white text-balance"
          >
            {titulo}
          </h2>
          {intro && (
            <p className="mt-4 text-body-lg text-white/70 leading-relaxed max-w-[65ch]">
              {intro}
            </p>
          )}
        </motion.div>

        <div className="mt-8 md:mt-10">{children}</div>
      </div>
    </section>
  );
}
