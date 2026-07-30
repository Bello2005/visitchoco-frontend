import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX, RotateCcw } from "lucide-react";
import { MainNav, MAIN_NAV_MOBILE_BOTTOM_CLASS } from "../../components/layout/MainNav";
import { LandingFooter } from "../../components/layout/LandingFooter";
import { useEstablecimientos, PAGE_SIZE } from "../../hooks/useEstablecimientos";
import { DirectorioHero } from "./components/DirectorioHero";
import { FilterBar } from "./components/FilterBar";
import { NegocioCard, NegocioCardSkeleton } from "./components/NegocioCard";

export default function Directorio() {
  const [searchParams, setSearchParams] = useSearchParams();

  const municipio = searchParams.get("municipio") ?? "";
  const categoria = searchParams.get("categoria") ?? "";
  const q = searchParams.get("q") ?? "";
  const [page, setPage] = useState(0);

  useEffect(() => {
    document.title = "Directorio de negocios — VisitChocó";
  }, []);

  // Cualquier cambio de filtro vuelve a la página 0
  useEffect(() => setPage(0), [municipio, categoria, q]);

  const updateFilters = (patch: { municipio?: string; categoria?: string; q?: string }) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const { items, total, loading, error, reload } = useEstablecimientos({
    municipioSlug: municipio || undefined,
    categoria: categoria || undefined,
    q: q || undefined,
    page,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = Boolean(municipio || categoria || q);

  return (
    <div className={`min-h-screen bg-[#020d1a] ${MAIN_NAV_MOBILE_BOTTOM_CLASS} md:pb-0`}>
      <MainNav />
      <DirectorioHero />
      <FilterBar municipio={municipio} categoria={categoria} q={q} onChange={updateFilters} />

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-8 min-h-[50vh]">
        {/* Contador */}
        {!loading && !error && (
          <p className="mb-5 text-xs text-white/45" aria-live="polite">
            <span className="font-semibold text-white/80">{total}</span>{" "}
            {total === 1 ? "negocio" : "negocios"}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-sm text-white/60">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-full border border-white/15
                         bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/85
                         hover:bg-white/[0.12] transition-colors"
            >
              <RotateCcw size={13} /> Reintentar
            </button>
          </div>
        )}

        {/* Skeletons */}
        {loading && !error && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <NegocioCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <SearchX size={36} strokeWidth={1.25} className="text-white/25" />
            <div>
              <p className="font-serif text-lg font-bold text-white">Sin resultados</p>
              <p className="mt-1 max-w-xs text-sm text-white/50">
                No encontramos negocios con esos filtros. Prueba con otra categoría o municipio.
              </p>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2
                           text-xs font-medium text-white/85 hover:bg-white/[0.12] transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((n) => (
                <NegocioCard key={n.id} negocio={n} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-3"
                aria-label="Paginación"
              >
                <PageButton
                  disabled={page === 0}
                  onClick={() => {
                    setPage((p) => Math.max(0, p - 1));
                    window.scrollTo({ top: 0 });
                  }}
                >
                  ← Anterior
                </PageButton>
                <span className="text-xs text-white/45">
                  {page + 1} / {totalPages}
                </span>
                <PageButton
                  disabled={page + 1 >= totalPages}
                  onClick={() => {
                    setPage((p) => p + 1);
                    window.scrollTo({ top: 0 });
                  }}
                >
                  Siguiente →
                </PageButton>
              </nav>
            )}
          </>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}

function PageButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs
                 font-medium text-white/80 transition-colors hover:bg-white/[0.1]
                 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
