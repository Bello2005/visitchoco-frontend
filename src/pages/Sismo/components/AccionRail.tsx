/**
 * S1 — Rail de acción.
 *
 * Tres destinos y tres señales de estado. Va inmediatamente después de la
 * ficha para que ninguna de las audiencias de la página tenga que scrollear
 * buscando qué hacer.
 */

import { Link } from "react-router-dom";
import { HeartHandshake, Phone, Plane } from "lucide-react";
import { cn } from "../../../lib/cn";
import { SERVICIOS } from "../../../content/sismoData";

const ACCIONES = [
  {
    href: "#lineas",
    Icon: Phone,
    label: "Líneas de emergencia",
    detalle: "123 y contactos oficiales",
  },
  {
    href: "#ayudar",
    Icon: HeartHandshake,
    label: "Cómo ayudar",
    detalle: "Canales verificados",
  },
  {
    href: "#servicios",
    Icon: Plane,
    label: "Estado de servicios",
    detalle: "Aeropuertos, vías y energía",
  },
] as const;

export function AccionRail() {
  return (
    <nav
      aria-label="Acciones principales"
      className="px-6 md:px-16 pb-4"
    >
      <div className="mx-auto max-w-5xl">
        <ul className="grid gap-3 sm:grid-cols-3">
          {ACCIONES.map(({ href, Icon, label, detalle }) => (
            <li key={href}>
              <a
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border border-white/[0.10] bg-white/[0.03]",
                  "px-4 py-3.5 min-h-[56px] transition-colors",
                  "hover:bg-white/[0.06] hover:border-white/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chirimia-400",
                )}
              >
                <Icon size={18} className="shrink-0 text-white/70" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-body-sm font-medium text-white">
                    {label}
                  </span>
                  <span className="block text-micro text-white/55 truncate">
                    {detalle}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Señales operativas: sirven a la vez a quien tiene familia en la zona
            y a quien tenía un viaje. Enlazan al detalle en S8. */}
        <ul className="mt-3 flex flex-wrap gap-2">
          {SERVICIOS.map((s) => (
            <li key={s.servicio}>
              <a
                href="#servicios"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-white/[0.08]",
                  "bg-white/[0.02] px-3 py-1.5 text-micro text-white/70",
                  "hover:text-white hover:border-white/20 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chirimia-400",
                )}
              >
                <span className="text-white/85">{s.servicio}</span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span>{s.estado}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/** Enlaces de cierre (S10). Sin CTA turístico. */
export function CierreSismo() {
  return (
    <div className="px-6 md:px-16 pb-20 md:pb-24">
      <div className="mx-auto max-w-5xl border-t border-white/[0.08] pt-8">
        <p className="text-body-sm text-white/55">Seguir en VisitChocó</p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-body-sm">
          <Link to="/mapa" className="text-white/75 hover:text-white transition-colors">
            Mapa del departamento
          </Link>
          <Link to="/fuentes" className="text-white/75 hover:text-white transition-colors">
            Fuentes de datos del sitio
          </Link>
          <Link to="/" className="text-white/75 hover:text-white transition-colors">
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
