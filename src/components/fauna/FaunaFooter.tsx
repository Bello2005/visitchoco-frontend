import { FOOTER_FUENTE_LINEAS } from "../../content/dataSources";

const EXPLORE_LINKS: [string, string][] = [
  ["Mapa interactivo", "/mapa"],
  ["Fauna y biodiversidad", "/animales"],
  ["Cultura y patrimonio", "/cultura"],
  ["Historia", "/historia"],
  ["Turismo", "/turismo"],
  ["Fiestas", "/fiesta"],
];

export function FaunaFooter() {
  return (
    <footer className="border-t border-emerald-900/40 bg-[#0a1f0f] py-16 text-white/70 md:px-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 border-b border-emerald-900/30 pb-12 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
                <span className="text-sm font-black text-white">VC</span>
              </div>
              <span className="font-sans text-lg font-bold text-white">VisitChocó</span>
            </div>
            <p className="font-sans max-w-xs text-sm leading-relaxed text-white/50">
              Plataforma turística interactiva del departamento del Chocó, Colombia. Construida en
              Quibdó.
            </p>
          </div>

          <div>
            <p className="font-sans mb-4 text-xs font-semibold uppercase tracking-widest text-emerald-500/90">
              Explorar
            </p>
            <ul className="font-sans space-y-2 text-sm">
              {EXPLORE_LINKS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="transition-colors hover:text-emerald-400">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-sans mb-4 text-xs font-semibold uppercase tracking-widest text-emerald-500/90">
              Proyecto
            </p>
            <ul className="font-sans space-y-2 text-sm">
              <li>
                <a href="/acerca" className="transition-colors hover:text-emerald-400">
                  Acerca de VisitChocó
                </a>
              </li>
              <li>
                <a href="/fuentes" className="transition-colors hover:text-emerald-400">
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

        <div className="flex flex-col items-start justify-between gap-4 pt-8 text-xs text-white/30 md:flex-row md:items-center">
          <p className="font-sans">© 2026 VisitChocó. Todos los derechos reservados.</p>
          <p className="font-sans font-medium text-white/50">
            Desarrollado en Quibdó, Chocó · Deiner D. Bello /{" "}
            <a
              href="https://dirsoft.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 underline-offset-2 transition-colors hover:text-emerald-400 hover:underline"
            >
              DIRSOFT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
