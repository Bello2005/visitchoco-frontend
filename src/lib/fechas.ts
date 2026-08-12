import type { Corte } from "../content/sismoData";

const FMT = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Bogota",
});

/**
 * "11 de ago, 21:30". Siempre en hora de Colombia: la referencia temporal
 * de una emergencia colombiana no puede depender del reloj del visitante.
 *
 * Si la fecha no parsea devuelve la cadena cruda, que es preferible a
 * mostrar "Invalid Date" en una página donde el sello temporal es el
 * núcleo de la credibilidad.
 */
export function formatearCorte(corte: Corte): string {
  const d = new Date(corte);
  if (Number.isNaN(d.getTime())) return corte;
  return FMT.format(d).replace(".", "");
}
