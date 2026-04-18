const EXPLORE_LINKS: [string, string][] = [
  ["Mapa interactivo",       "/mapa"    ],
  ["Fauna y biodiversidad",  "/animales"],
  ["Cultura y patrimonio",   "/cultura" ],
  ["Historia",               "/historia"],
  ["Turismo",                "/turismo" ],
  ["Fiestas",                "/fiesta"  ],
];

import { FOOTER_FUENTE_LINEAS } from "../../content/dataSources";

export function LandingFooter() {
  return (
    <footer className="bg-[#0a1f0f] text-white/70 py-16 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">

        {/* Top */}
        <div className="grid md:grid-cols-3 gap-12 pb-12 border-b border-white/10">

          {/* Identidad */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">VC</span>
              </div>
              <span className="text-white font-bold text-lg">VisitChocó</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              Plataforma turística interactiva del departamento del Chocó,
              Colombia. Construida en Quibdó.
            </p>
          </div>

          {/* Explorar */}
          <div>
            <p className="text-white text-xs font-semibold tracking-widest uppercase mb-4">
              Explorar
            </p>
            <ul className="space-y-2 text-sm">
              {EXPLORE_LINKS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="hover:text-emerald-400 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Proyecto */}
          <div>
            <p className="text-white text-xs font-semibold tracking-widest uppercase mb-4">
              Proyecto
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/acerca" className="hover:text-emerald-400 transition-colors">
                  Acerca de VisitChocó
                </a>
              </li>
              <li>
                <a href="/fuentes" className="hover:text-emerald-400 transition-colors">
                  Fuentes de datos
                </a>
              </li>
              {FOOTER_FUENTE_LINEAS.map((f) => (
                <li key={f}>
                  <span className="text-white/30">{f}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/30">
          <p>© 2026 VisitChocó. Todos los derechos reservados.</p>
          <p className="font-medium text-white/50">
            Desarrollado en Quibdó, Chocó · Deiner D. Bello /{" "}
            <a
              href="https://dirsoft.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-emerald-400 underline-offset-2 hover:underline transition-colors"
            >
              DIRSOFT
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
