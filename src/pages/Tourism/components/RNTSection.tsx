import { useState, useEffect } from "react";
import { api } from "../../../services/api.service";
import { motion } from "framer-motion";
import { Hotel, Home, Plane, Compass, Leaf, BedDouble } from "lucide-react";

interface RntRow {
  municipio_nombre: string;
  total_activos: number;
  hoteles: number;
  hostales: number;
  agencias_viajes: number;
  guias_turismo: number;
  viviendas_turisticas: number;
  fincas_turisticas: number;
}

export function RNTSection() {
  const [data, setData] = useState<RntRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<RntRow[]>("/api/rnt")
      .then((r) => setData(r.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const max = data[0]?.total_activos || 1;

  return (
    <section className="py-24 px-6 md:px-16 bg-[#051020]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="text-sky-400/60 text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            Oferta turística certificada
          </p>
          <h2
            className="font-serif text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}
          >
            602 prestadores.
            <br />
            <span className="text-white/30">Todos registrados. Todos reales.</span>
          </h2>
          <p className="text-white/30 text-sm mt-4 max-w-lg">
            Fuente: Cámara de Comercio del Chocó · RNT · MinCIT 2025. Solo
            prestadores con registro activo.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl animate-pulse bg-white/[0.03]"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data.map(
              (
                {
                  municipio_nombre,
                  total_activos,
                  hoteles,
                  hostales,
                  agencias_viajes,
                  viviendas_turisticas,
                  guias_turismo,
                  fincas_turisticas,
                },
                i
              ) => (
                <motion.div
                  key={municipio_nombre}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group flex items-center gap-4 p-4 rounded-2xl
                             border border-white/[0.05] hover:border-sky-400/20
                             bg-white/[0.02] hover:bg-sky-400/[0.03]
                             transition-all duration-200"
                >
                  {/* Ranking */}
                  <span className="text-white/15 font-serif font-bold text-2xl w-8 flex-shrink-0 text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Nombre + barra */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-white/80 font-semibold text-sm">
                        {municipio_nombre}
                      </p>
                      <p className="font-serif text-sky-400 font-bold text-base flex-shrink-0 ml-4">
                        {total_activos}
                      </p>
                    </div>
                    {/* Barra de progreso */}
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${(total_activos / max) * 100}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.07 }}
                      />
                    </div>
                  </div>

                  {/* Mini desglose — visible en hover o en sm+ */}
                  <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                    {hoteles > 0 && (
                      <div className="flex items-center gap-1 text-white/20 text-xs">
                        <Hotel size={10} />
                        {hoteles}
                      </div>
                    )}
                    {hostales > 0 && (
                      <div className="flex items-center gap-1 text-white/20 text-xs">
                        <BedDouble size={10} />
                        {hostales}
                      </div>
                    )}
                    {viviendas_turisticas > 0 && (
                      <div className="flex items-center gap-1 text-white/20 text-xs">
                        <Home size={10} />
                        {viviendas_turisticas}
                      </div>
                    )}
                    {agencias_viajes > 0 && (
                      <div className="flex items-center gap-1 text-white/20 text-xs">
                        <Plane size={10} />
                        {agencias_viajes}
                      </div>
                    )}
                    {guias_turismo > 0 && (
                      <div className="flex items-center gap-1 text-white/20 text-xs">
                        <Compass size={10} />
                        {guias_turismo}
                      </div>
                    )}
                    {fincas_turisticas > 0 && (
                      <div className="flex items-center gap-1 text-white/20 text-xs">
                        <Leaf size={10} />
                        {fincas_turisticas}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
