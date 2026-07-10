import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import type { Establecimiento } from "../../../hooks/useEstablecimientos";
import { categoriaDef } from "../categorias";

export function NegocioCard({ negocio }: { negocio: Establecimiento }) {
  const [imgError, setImgError] = useState(false);
  const cat = categoriaDef(negocio.categoria);
  const CatIcon = cat.Icon;
  const showFoto = Boolean(negocio.foto_url) && !imgError;

  return (
    <a
      href={`/negocio/${negocio.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.06]
                 bg-white/[0.03] transition-colors hover:border-white/[0.14] hover:bg-white/[0.05]"
    >
      {/* Foto o placeholder por categoría — nunca imagen rota */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {showFoto ? (
          <img
            src={negocio.foto_url as string}
            alt={negocio.nombre}
            loading="lazy"
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover
                       transition-transform duration-500 group-hover:scale-105"
            style={{ filter: "brightness(0.85) saturate(1.05)" }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: cat.gradient }}
            aria-hidden
          >
            <CatIcon size={44} strokeWidth={1.25} style={{ color: `${cat.accent}90` }} />
          </div>
        )}

        {negocio.rnt && (
          <span
            className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full
                       bg-emerald-950/80 backdrop-blur-sm border border-emerald-400/30
                       px-2.5 py-1 text-[10px] font-semibold text-emerald-300"
          >
            <BadgeCheck size={11} strokeWidth={2.5} />
            RNT verificado
          </span>
        )}

        {negocio.rango_precio && (
          <span
            className="absolute top-3 right-3 rounded-full bg-black/50 backdrop-blur-sm
                       border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80"
          >
            {negocio.rango_precio}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3
          className="font-serif text-white font-bold leading-snug line-clamp-2"
          style={{ fontSize: "1.05rem" }}
        >
          {negocio.nombre}
        </h3>
        <p className="mt-1 text-xs text-white/50">
          <span style={{ color: cat.accent }}>{cat.label}</span>
          {negocio.municipio_nombre && <> · {negocio.municipio_nombre}</>}
        </p>
      </div>
    </a>
  );
}

export function NegocioCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
      <div className="aspect-[4/3] animate-pulse bg-white/[0.06]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.08]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
      </div>
    </div>
  );
}
