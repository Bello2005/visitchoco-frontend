import { MapPin, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Fiesta } from "../../../hooks/useFiestas";

const FIESTA_IMAGES: Record<string, string> = {
  Quibdó: "/images/municipios/quibdo.jpg",
  Tadó: "/images/municipios/tado.jpg",
  Condoto: "/images/municipios/condoto.jpg",
  Istmina: "/images/municipios/canton-de-san-pablo.jpg",
  "Unión Panamericana": "/images/municipios/certegui.jpg",
  Nuquí: "/images/municipios/nuqui.jpg",
  "Bahía Solano": "/images/municipios/bahia-solano.jpg",
  Riosucio: "/images/municipios/riosucio.jpg",
  Acandí: "/images/municipios/acandi.jpg",
  Bojayá: "/images/municipios/bojaya.jpg",
};
const DEFAULT_IMG = "/images/municipios/medio-baudo.jpg";

function cardColClass(i: number): string {
  if (i === 0) return "md:col-span-7 min-h-[280px] md:min-h-[480px]";
  if (i === 1) return "md:col-span-5 min-h-[220px]";
  return "md:col-span-4 min-h-[200px] md:min-h-[220px]";
}

export function FiestasGrid({ fiestas, loading }: { fiestas: Fiesta[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="py-24 px-6 md:px-16 bg-[#0c0800]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-48 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-12 w-2/3 max-w-md rounded-lg bg-white/10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7 h-[320px] md:h-[480px] rounded-2xl bg-white/5 animate-pulse" />
            <div className="md:col-span-5 h-[220px] rounded-2xl bg-white/5 animate-pulse" />
            <div className="md:col-span-4 h-[220px] rounded-2xl bg-white/5 animate-pulse" />
            <div className="md:col-span-4 h-[220px] rounded-2xl bg-white/5 animate-pulse" />
            <div className="md:col-span-4 h-[220px] rounded-2xl bg-white/5 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  const principales = fiestas.filter((f) => f.es_principal);
  const secundarias = fiestas.filter((f) => !f.es_principal);

  return (
    <section className="py-24 px-6 md:px-16 bg-[#0c0800]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-white/30 text-xs font-semibold tracking-[0.25em] uppercase mb-4">Las grandes fiestas</p>
          <h2 className="font-serif text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
            Las 5 que el mundo
            <br />
            <span className="text-amber-400">debe conocer.</span>
          </h2>
        </div>

        {principales.length === 0 ? (
          <p className="text-white/40 text-sm">No hay fiestas principales registradas todavía.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
            {principales.map((f, i) => {
              const img = FIESTA_IMAGES[f.municipio_nombre] || DEFAULT_IMG;
              const isFirst = i === 0;
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`group relative overflow-hidden rounded-2xl cursor-default ${cardColClass(i)}`}
                >
                  <img
                    src={img}
                    alt={f.nombre_fiesta}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: "brightness(0.45)" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)" }}
                  />

                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-amber-400/20 backdrop-blur-sm border border-amber-400/30 px-3 py-1 rounded-full">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-amber-300 text-[10px] font-bold tracking-wider uppercase">Fiesta principal</span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h3
                      className="font-serif text-white font-bold leading-tight mb-2"
                      style={{
                        fontSize: isFirst ? "clamp(1.4rem, 2.5vw, 2rem)" : "clamp(1.1rem, 1.8vw, 1.4rem)",
                      }}
                    >
                      {f.nombre_fiesta}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-white/50 text-xs">
                        <MapPin size={10} />
                        {f.municipio_nombre}
                      </span>
                      <span className="flex items-center gap-1 text-white/50 text-xs">
                        <Calendar size={10} />
                        {f.fechas_texto}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {secundarias.length > 0 && (
          <>
            <p className="text-white/20 text-xs font-semibold tracking-[0.2em] uppercase mb-4 mt-12">
              Todas las fiestas — {secundarias.length} más
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {secundarias.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.06] hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
                >
                  <span className="text-xl flex-shrink-0" aria-hidden>
                    🎭
                  </span>
                  <div className="min-w-0">
                    <p className="text-white/80 text-sm font-semibold truncate">{f.nombre_fiesta}</p>
                    <p className="text-white/30 text-xs truncate">
                      {f.municipio_nombre} · {f.fechas_texto}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
