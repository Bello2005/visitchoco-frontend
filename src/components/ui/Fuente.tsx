/**
 * Primitivos de render con procedencia obligatoria.
 *
 * Ninguno de estos componentes acepta un `number` o un `string` pelado:
 * todos reciben el envoltorio (`Dato`, `CifraEnDisputa`) definido en
 * `src/content/sismoData.ts`, que exige `fuente` y `corte`. Como además
 * son la forma más cómoda de pintar un dato, el camino correcto es
 * también el camino fácil.
 *
 * Usados por la página /sismo.
 */

import { ExternalLink } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatearCorte } from "../../lib/fechas";
import {
  FUENTES,
  type CifraEnDisputa,
  type Corte,
  type Dato,
  type FichaItem,
  type Fuente,
  type FuenteId,
} from "../../content/sismoData";

/* ── Etiqueta de fuente ────────────────────────────────────────── */

interface FuenteTagProps {
  fuente: FuenteId;
  corte: Corte;
  className?: string;
}

/**
 * Sigla de la fuente + hora de corte, enlazando a la publicación.
 * Va SIEMPRE en la línea inmediatamente bajo el dato, nunca al final
 * de la sección.
 */
export function FuenteTag({ fuente, corte, className }: FuenteTagProps) {
  // FUENTES es `as const satisfies`, así que conserva los tipos literales y
  // `sigla` sólo existe en las entradas que la declaran. Se ensancha aquí.
  const f: Fuente = FUENTES[fuente];
  return (
    <a
      href={f.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-1.5 font-mono text-micro",
        // /55 es el mínimo que pasa AA sobre carbon-950; esta microcopia
        // es texto esencial, no decorativa.
        "text-white/55 hover:text-white/85 transition-colors",
        className,
      )}
      title={`${f.nombre} — abrir en una pestaña nueva`}
    >
      <span>{f.sigla ?? f.nombre}</span>
      <span aria-hidden="true">·</span>
      <span>{formatearCorte(corte)}</span>
      <ExternalLink
        size={10}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      />
    </a>
  );
}

/* ── Dato suelto ───────────────────────────────────────────────── */

interface DatoChipProps {
  dato: Dato;
  /** Etiqueta encima del valor. `FichaItem` la trae incorporada. */
  etiqueta?: string;
  className?: string;
}

/** Una medición: etiqueta, valor en mono, fuente, y nota metodológica. */
export function DatoChip({ dato, etiqueta, className }: DatoChipProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4",
        className,
      )}
    >
      {etiqueta && (
        <p className="text-micro uppercase tracking-eyebrow text-white/55 mb-2">
          {etiqueta}
        </p>
      )}
      <p className="font-mono text-h3 text-white leading-none">
        {dato.valor}
        {dato.unidad && (
          <span className="ml-1.5 text-body-sm font-sans text-white/60">
            {dato.unidad}
          </span>
        )}
      </p>
      <div className="mt-2.5">
        <FuenteTag fuente={dato.fuente} corte={dato.corte} />
      </div>
      {dato.nota && (
        <p className="mt-2 text-body-sm text-white/60 leading-relaxed">
          {dato.nota}
        </p>
      )}
    </div>
  );
}

/** Variante para los items de la ficha, que ya traen `etiqueta`. */
export function FichaChip({ item, className }: { item: FichaItem; className?: string }) {
  return <DatoChip dato={item} etiqueta={item.etiqueta} className={className} />;
}

/* ── Cifra en disputa ──────────────────────────────────────────── */

const NUM = new Intl.NumberFormat("es-CO");

/**
 * Cifra humana sin valor único: se listan todos los reportes con su
 * fuente y su corte, en orden cronológico.
 *
 * Deliberadamente sin animación de entrada escalonada: escalonar filas
 * de víctimas las convierte en una revelación.
 */
export function RangoDisputa({ cifra }: { cifra: CifraEnDisputa }) {
  const ordenados = [...cifra.reportes].sort(
    (a, b) => new Date(a.corte).getTime() - new Date(b.corte).getTime(),
  );

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 md:p-6">
      <h3 className="text-body-lg font-medium text-white">{cifra.etiqueta}</h3>
      <p className="mt-1.5 text-body-sm text-white/60 leading-relaxed max-w-[60ch]">
        {cifra.advertencia}
      </p>

      <ul className="mt-4 divide-y divide-white/[0.06]">
        {ordenados.map((r, i) => (
          <li
            key={`${r.fuente}-${r.corte}-${i}`}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5"
          >
            <span className="font-mono text-body-lg text-white tabular-nums">
              {NUM.format(r.cifra)}
            </span>
            <FuenteTag fuente={r.fuente} corte={r.corte} />
            {r.alcance && (
              <span className="text-micro text-white/50 basis-full sm:basis-auto">
                {r.alcance}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
