import { Search, X } from "lucide-react";
import { MUNICIPIOS } from "../../../data/municipioSlugs";
import { CATEGORIAS } from "../categorias";

interface FilterBarProps {
  municipio: string;
  categoria: string;
  q: string;
  onChange: (patch: { municipio?: string; categoria?: string; q?: string }) => void;
}

export function FilterBar({ municipio, categoria, q, onChange }: FilterBarProps) {
  return (
    <div
      className="sticky top-12 md:top-16 z-40 border-b border-white/[0.06]
                 bg-[rgba(2,13,26,0.92)] backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center">
        {/* Chips de categoría — scroll horizontal en móvil */}
        <div
          className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                     -mx-4 px-4 md:mx-0 md:px-0"
          role="tablist"
          aria-label="Categorías"
        >
          <CategoriaChip
            label="Todos"
            active={categoria === ""}
            onClick={() => onChange({ categoria: "" })}
          />
          {CATEGORIAS.map((c) => (
            <CategoriaChip
              key={c.value}
              label={c.label}
              active={categoria === c.value}
              accent={c.accent}
              onClick={() => onChange({ categoria: categoria === c.value ? "" : c.value })}
            />
          ))}
        </div>

        <div className="flex gap-2 md:ml-auto md:shrink-0">
          {/* Select de municipio */}
          <select
            value={municipio}
            onChange={(e) => onChange({ municipio: e.target.value })}
            aria-label="Filtrar por municipio"
            className="h-9 min-w-0 flex-1 md:flex-none md:w-44 rounded-full border border-white/10
                       bg-white/[0.05] px-3 text-xs text-white/80 outline-none
                       focus:border-white/25 [&>option]:bg-[#0b1826] [&>option]:text-white"
          >
            <option value="">Todos los municipios</option>
            {MUNICIPIOS.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.nombre}
              </option>
            ))}
          </select>

          {/* Búsqueda */}
          <div className="relative flex-1 md:flex-none md:w-52">
            <Search
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Buscar por nombre…"
              aria-label="Buscar negocios por nombre"
              className="h-9 w-full rounded-full border border-white/10 bg-white/[0.05]
                         pl-8 pr-8 text-xs text-white/90 placeholder:text-white/35
                         outline-none focus:border-white/25
                         [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button
                type="button"
                onClick={() => onChange({ q: "" })}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1
                           text-white/40 hover:text-white/80"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriaChip({
  label,
  active,
  accent,
  onClick,
}: {
  label: string;
  active: boolean;
  accent?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-xs font-medium
                  transition-colors ${
                    active
                      ? "border-white/30 bg-white/15 text-white"
                      : "border-white/10 bg-white/[0.04] text-white/55 hover:text-white/85 hover:border-white/20"
                  }`}
      style={active && accent ? { borderColor: `${accent}80`, color: "#fff" } : undefined}
    >
      {label}
    </button>
  );
}
