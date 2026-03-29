import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const DATOS_BALLENA = [
  { valor: "40", unidad: "toneladas", label: "Peso promedio" },
  { valor: "16m", unidad: "de longitud", label: "Largo adulto" },
  { valor: "Jul–Oct", unidad: "", label: "Temporada en el Chocó" },
  { valor: "Utría", unidad: "PNN", label: "Santuario principal" },
];

const ENLACES_MAPA: { label: string; slug: string }[] = [
  { label: "Bahía Solano", slug: "bahia-solano" },
  { label: "Nuquí", slug: "nuqui" },
  { label: "PNN Utría", slug: "nuqui" },
  { label: "Cabo Corrientes", slug: "nuqui" },
];

export function BallenasFeature() {
  return (
    <section id="ballenas" className="bg-[#020d1a]">
      <div className="max-w-7xl mx-auto">
        {/* Header de sección */}
        <div className="px-6 md:px-16 pt-24 pb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sky-400/60 text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          >
            El espectáculo más grande del océano
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-white"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 4rem)",
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            Las ballenas jorobadas
            <br />
            <span className="text-sky-400">eligen el Chocó.</span>
          </motion.h2>
        </div>

        {/* Split layout */}
        <div className="grid md:grid-cols-2 min-h-[560px] px-6 md:px-0">
          {/* Imagen — izquierda */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden md:rounded-r-none rounded-2xl md:rounded-l-2xl md:ml-16"
            style={{ minHeight: 460 }}
          >
            <img
              src="/images/municipios/bahia-solano.jpg"
              alt="Ballenas jorobadas en Bahía Solano"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.8) saturate(1.2)" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, transparent 60%, #020d1a 100%)",
              }}
            />

            {/* Badge flotante */}
            <div
              className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md
                              border border-sky-400/20 rounded-2xl p-4"
            >
              <p className="text-sky-300 text-xs font-semibold tracking-wider uppercase mb-1">
                Hope Spot · Mission Blue
              </p>
              <p className="text-white/60 text-xs">
                Golfo de Tribugá declarado lugar
                <br />
                de esperanza global
              </p>
            </div>
          </motion.div>

          {/* Texto — derecha */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="px-6 md:px-12 py-10 flex flex-col justify-center gap-8"
          >
            {/* Dato masivo */}
            <div className="relative">
              <span
                className="font-serif text-sky-400/20 select-none pointer-events-none
                                 absolute -translate-y-4 left-0 top-0"
                style={{
                  fontSize: "clamp(5rem, 12vw, 9rem)",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                40t
              </span>
              <p className="relative z-10 text-white/50 text-sm leading-relaxed max-w-lg pt-[clamp(3rem,8vw,5rem)]">
                Cada año entre julio y octubre, las ballenas jorobadas
                <em className="text-white/80 not-italic font-semibold">
                  {" "}
                  migran desde las aguas polares de la Antártida
                </em>{" "}
                hasta las cálidas costas del Pacífico chocoano para reproducirse.
                El Parque Nacional Natural Utría es el principal santuario de
                avistamiento.
              </p>
            </div>

            <p className="text-white/40 text-sm leading-relaxed max-w-lg">
              Las lanchas se acercan a menos de 100 metros. Las ballenas saltan
              — 40 toneladas en el aire. Los guías certificados del RNT garantizan
              una experiencia que respeta el comportamiento natural del animal.
              Es uno de los mejores avistamientos del planeta, y está aquí, en el
              Chocó.
            </p>

            {/* Grid de datos */}
            <div className="grid grid-cols-2 gap-3">
              {DATOS_BALLENA.map(({ valor, unidad, label }) => (
                <div
                  key={label}
                  className="p-4 rounded-2xl border border-sky-400/10 bg-sky-400/[0.03]"
                >
                  <p
                    className="font-serif text-sky-400 font-bold leading-none"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                  >
                    {valor}
                    {unidad && (
                      <span className="text-base text-sky-400/60 ml-1 font-sans">
                        {unidad}
                      </span>
                    )}
                  </p>
                  <p className="text-white/30 text-xs mt-1.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {ENLACES_MAPA.map(({ label, slug }) => (
                <a
                  key={label}
                  href={`/mapa?m=${slug}`}
                  className="flex items-center gap-1.5 text-xs font-medium text-sky-400/70
                               hover:text-sky-400 transition-colors border border-sky-400/20
                               hover:border-sky-400/50 px-3 py-1.5 rounded-full"
                >
                  <MapPin size={10} />
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
