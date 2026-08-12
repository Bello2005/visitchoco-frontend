/**
 * S7 — San José del Palmar: quién vive en el epicentro.
 *
 * Es el valor propio de que esta página viva en VisitChocó: ningún medio
 * nacional va a contar quién vive ahí cuando pase la noticia.
 *
 * El único número con tratamiento display de toda la página son los 32
 * millones del fondo municipal de emergencias — es estructural, es
 * estable, y no es un conteo de personas.
 *
 * El mapa se monta con `lazy` y sólo cuando entra en viewport: Leaflet
 * pesa, y esta sección está a siete secciones de scroll del inicio.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Seccion } from "./Seccion";
import { DatoChip, FuenteTag } from "../../../components/ui/Fuente";
import {
  FONDO_EMERGENCIAS,
  TERRITORIO_DATOS,
  TERRITORIO_PARRAFOS,
} from "../../../content/sismoData";

const EpicentroMapa = lazy(() => import("./EpicentroMapa"));

/** Monta el mapa sólo cuando el contenedor se acerca al viewport. */
function MapaDiferido() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <Suspense
          fallback={
            <div className="h-[320px] rounded-2xl border border-white/[0.08] bg-white/[0.02]" />
          }
        >
          <EpicentroMapa />
        </Suspense>
      ) : (
        <div className="h-[320px] rounded-2xl border border-white/[0.08] bg-white/[0.02]" />
      )}
    </div>
  );
}

export function TerritorioSection() {
  return (
    <Seccion
      id="territorio"
      eyebrow="La zona cero"
      titulo="Quién vive en el epicentro"
    >
      <div className="space-y-4 max-w-[65ch]">
        {TERRITORIO_PARRAFOS.map((p) => (
          <p key={p.slice(0, 32)} className="text-body-lg text-white/75 leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {TERRITORIO_DATOS.map((d) => (
          <DatoChip key={d.unidad} dato={d} />
        ))}
      </div>

      {/* El único display de la página. */}
      <div className="mt-8 rounded-2xl border border-white/[0.12] bg-white/[0.03] p-6 md:p-8">
        <p className="text-eyebrow uppercase text-white/55">
          Fondo municipal de emergencias
        </p>
        <p className="mt-3 font-display text-display text-white leading-none">
          $32 millones
        </p>
        <p className="mt-4 text-body-lg text-white/70 leading-relaxed max-w-[58ch]">
          Es todo lo que tenía disponible San José del Palmar para atender un
          desastre, según su alcalde. Aproximadamente el precio de un carro
          usado, para el municipio que resultó ser el epicentro del mayor sismo
          del país en este siglo.
        </p>
        <FuenteTag
          fuente={FONDO_EMERGENCIAS.fuente}
          corte={FONDO_EMERGENCIAS.corte}
          className="mt-4"
        />
      </div>

      <div className="mt-8">
        <h3 className="font-display text-h3 text-white">Dónde queda</h3>
        <p className="mt-2 mb-4 text-body-sm text-white/65 leading-relaxed max-w-[62ch]">
          El epicentro se localizó en 4,844° norte y 76,242° oeste, en el sur del
          Chocó, cerca del límite con el Valle del Cauca y Risaralda. El sismo se
          sintió con fuerza en un radio de varios cientos de kilómetros: eso
          incluye Cali, Pereira, Manizales, Quibdó y Medellín.
        </p>
        <MapaDiferido />
      </div>
    </Seccion>
  );
}
