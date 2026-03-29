import type { Fiesta } from "../../../hooks/useFiestas";

interface Props {
  proximas: Fiesta[];
  loading: boolean;
}

export function ProximasBanner({ proximas, loading }: Props) {
  if (loading || proximas.length === 0) return null;

  const items = [...proximas, ...proximas, ...proximas];

  return (
    <section id="proximas" className="overflow-hidden bg-amber-500/10 border-y border-amber-500/20 py-3">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: "fiestaTicker 30s linear infinite",
          width: "max-content",
        }}
      >
        {items.map((f, i) => (
          <div key={`${f.id}-${i}`} className="flex items-center gap-3 flex-shrink-0">
            <span className="text-amber-400 text-xs" aria-hidden>
              🎭
            </span>
            <span className="text-amber-200 text-sm font-semibold">{f.nombre_fiesta}</span>
            <span className="text-amber-400/60 text-xs">{f.municipio_nombre}</span>
            <span className="text-amber-300/40 text-xs">·</span>
            <span className="text-amber-400/50 text-xs italic">{f.fechas_texto}</span>
            {f.es_principal && (
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                ⭐ Principal
              </span>
            )}
            <span className="text-amber-500/20 text-lg mx-4">·</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fiestaTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
