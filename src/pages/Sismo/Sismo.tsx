/**
 * /sismo — Sismo Mw 7,4 del 10 de agosto de 2026, San José del Palmar.
 *
 * El orden de las secciones se deriva del coste de error de cada
 * audiencia, no del interés del material: primero los teléfonos (quien
 * tiene familia en la zona no puede esperar), luego cómo ayudar, y sólo
 * después el contexto. La geología, que es lo más interesante, va sexta.
 *
 * Todos los datos vienen de `src/content/sismoData.ts`. Este archivo no
 * contiene ni una sola cifra.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { MainNav } from "../../components/layout/MainNav";
import { AccionRail, CierreSismo } from "./components/AccionRail";
import { AyudarSection } from "./components/AyudarSection";
import { CronologiaSection } from "./components/CronologiaSection";
import { FuentesSismoSection } from "./components/FuentesSismoSection";
import { GeologiaSection } from "./components/GeologiaSection";
import { ImpactoSection } from "./components/ImpactoSection";
import { LineasSection } from "./components/LineasSection";
import { ServiciosSection } from "./components/ServiciosSection";
import { SismoHero } from "./components/SismoHero";
import { TerritorioSection } from "./components/TerritorioSection";
import { HORAS_FRESCURA, SISMO_META } from "../../content/sismoData";

/**
 * Autodenuncia de frescura. `ALERTA_GLOBAL.hasta` apaga el banner solo,
 * pero nada protegía a la página de quedarse congelada con aire de
 * autoridad. Si el contenido lleva más de HORAS_FRESCURA sin tocarse,
 * la página lo dice ella misma.
 */
function useEstaVieja(): number | null {
  const actualizada = new Date(SISMO_META.paginaActualizada).getTime();
  if (Number.isNaN(actualizada)) return null;
  const horas = (Date.now() - actualizada) / 3_600_000;
  if (SISMO_META.estado !== "emergencia-activa") return null;
  return horas > HORAS_FRESCURA ? Math.floor(horas) : null;
}

export default function Sismo() {
  const { hash } = useLocation();
  const horasSinActualizar = useEstaVieja();

  useEffect(() => {
    document.title = "Sismo del 10 de agosto de 2026 — VisitChocó";
    return () => {
      document.title = "VisitChocó";
    };
  }, []);

  // react-router no restaura el scroll a los anchors por sí solo: el CTA del
  // banner apunta a /sismo#ayudar y sin esto aterrizaría arriba del todo.
  //
  // Un solo requestAnimationFrame no basta. En carga directa compiten con
  // nosotros la restauración de scroll del navegador y el reflow que provocan
  // las fuentes al terminar de cargar, así que el primer intento se pierde.
  // Reintentamos unas cuantas veces y paramos en cuanto aterriza.
  useEffect(() => {
    if (!hash) return;
    let cancelado = false;
    const temporizadores: number[] = [];

    const intentar = () => {
      if (cancelado) return;
      let el: Element | null = null;
      try {
        el = document.querySelector(hash);
      } catch {
        return; // hash no es un selector válido
      }
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      // Ya está colocada: no volvemos a tocar el scroll (si no, pelearíamos
      // con el usuario que haya empezado a desplazarse por su cuenta).
      if (Math.abs(top) < 140) {
        cancelado = true;
        return;
      }
      el.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    };

    [0, 120, 350, 700].forEach((ms) => {
      temporizadores.push(window.setTimeout(intentar, ms));
    });

    return () => {
      cancelado = true;
      temporizadores.forEach(clearTimeout);
    };
  }, [hash]);

  return (
    <div className="min-h-screen bg-carbon-950 text-white pb-20 md:pb-0">
      {/* El sitio no tiene ningún skip link. En una página de emergencia,
          llegar a los teléfonos con el teclado sin atravesar el nav importa. */}
      <a
        href="#lineas"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[2500] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-body-sm focus:font-medium focus:text-carbon-950"
      >
        Saltar a líneas de emergencia
      </a>

      <MainNav />

      <main>
        {horasSinActualizar !== null && (
          <div className="px-6 md:px-16 pt-20 md:pt-24">
            <div className="mx-auto flex max-w-5xl items-start gap-2.5 rounded-xl border border-condoto-400/30 bg-condoto-400/[0.08] px-4 py-3">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-condoto-400"
                aria-hidden="true"
              />
              <p className="text-body-sm text-white/75 leading-relaxed">
                Esta página no se actualiza desde hace {horasSinActualizar} horas.
                Durante una emergencia las cifras cambian rápido: consulta
                directamente las fuentes enlazadas.
              </p>
            </div>
          </div>
        )}

        <SismoHero />
        <AccionRail />
        <LineasSection />
        <AyudarSection />
        <CronologiaSection />
        <ImpactoSection />
        <GeologiaSection />
        <TerritorioSection />
        <ServiciosSection />
        <FuentesSismoSection />
        <CierreSismo />
      </main>
    </div>
  );
}
