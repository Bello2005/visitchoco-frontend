/**
 * Aviso global de emergencia.
 *
 * Decisiones que no son obvias, para quien venga después:
 *
 * · Se monta DENTRO del gate de opacidad de App.tsx, antes de <Routes>.
 *   `opacity` crea un stacking context pero no un containing block para
 *   `position: fixed` (eso sólo lo hacen transform/filter/perspective),
 *   así que el fixed sigue resolviendo contra el viewport — el mismo
 *   mecanismo por el que MainNav ya funciona dentro de <Routes>.
 *
 * · z-[1900], deliberadamente POR DEBAJO del z-[2000] del nav. El nav
 *   siempre tiene que ser alcanzable; el banner nunca puede tapar el
 *   logo, el buscador ni los tabs. SearchModal (z-3000) lo cubre.
 *
 * · No empuja el layout: superponerse sobre el arranque del hero es
 *   preferible a tocar las 11 raíces de página y romper los h-[100dvh].
 *
 * · role="region", NO role="alert" ni aria-live. El banner está presente
 *   al cargar, no es una notificación dinámica; con aria-live los
 *   lectores de pantalla interrumpirían en cada navegación.
 *
 * · Se apaga solo fuera de la ventana [desde, hasta]. Es la línea más
 *   importante del archivo: garantiza que un sitio de turismo no siga
 *   anunciando una emergencia en diciembre.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { dur, ease } from "../../lib/motion";
import { useDismissibleAlert } from "../../hooks/useDismissibleAlert";
import { ALERTA_GLOBAL } from "../../content/sismoData";
import { hasMainNav } from "./MainNav";

/** Rutas donde el aviso no aparece, además de la propia página del sismo. */
const RUTAS_EXCLUIDAS = ["/sismo", "/mundo", "/login", "/register", "/admin", "/user"];

function dentroDeVentana(): boolean {
  const ahora = Date.now();
  const desde = new Date(ALERTA_GLOBAL.desde).getTime();
  const hasta = new Date(ALERTA_GLOBAL.hasta).getTime();
  if (Number.isNaN(desde) || Number.isNaN(hasta)) return false;
  return ahora >= desde && ahora < hasta;
}

export function EmergencyBanner() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const { visible, dismiss } = useDismissibleAlert(
    ALERTA_GLOBAL.id,
    ALERTA_GLOBAL.rev,
  );

  const excluida = RUTAS_EXCLUIDAS.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  if (excluida || !dentroDeVentana()) return null;

  const conNav = hasMainNav(pathname);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label="Aviso de emergencia"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduce ? { duration: 0 } : { duration: dur.fast, ease: ease.out }}
          className={cn(
            "fixed z-[1900] px-3",
            // Móvil: franja bajo la barra superior de 48px, o pegada arriba
            // en las rutas que no montan nav.
            conNav ? "top-12 inset-x-0" : "top-0 inset-x-0",
            // Desktop: píldora centrada bajo la píldora del nav. max-w-xl
            // deja libres los 380px del panel izquierdo del mapa.
            conNav
              ? "md:top-[76px] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl"
              : "md:top-3 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 border border-chirimia-400/25",
              "bg-carbon-950/92 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
              "h-11 px-3 rounded-xl md:rounded-full md:h-auto md:py-2 md:pl-4 md:pr-2",
            )}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-chirimia-400"
            />

            <p className="min-w-0 flex-1 truncate text-body-sm text-white/85">
              <span className="font-medium text-white">{ALERTA_GLOBAL.titulo}</span>
              <span className="hidden sm:inline text-white/55">
                {" "}
                · {ALERTA_GLOBAL.detalle}
              </span>
            </p>

            {/* Dos destinos explícitos: el enlace y la X. El fondo NO es
                clicable — fondo clicable + X es una trampa de misclick. */}
            <Link
              to={ALERTA_GLOBAL.cta.href}
              className={cn(
                "shrink-0 rounded-full bg-white px-3 py-1.5 text-micro font-semibold",
                "text-carbon-950 hover:bg-white/90 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-carbon-950",
              )}
            >
              {ALERTA_GLOBAL.cta.label}
            </Link>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Ocultar este aviso"
              className={cn(
                "shrink-0 rounded-full p-2.5 -mr-1 text-white/50 hover:text-white",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              )}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
