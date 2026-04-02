import { motion } from "framer-motion";

const IMG =
  "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=900&q=80";

const spots = ["Bahía Solano", "Nuquí", "PNN Utría", "El Valle"];

export function BallenasFeature() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="bg-[#010d05] py-24 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-0 lg:grid-cols-2 lg:px-6">
        <motion.div
          className="relative min-h-[320px] lg:min-h-[560px]"
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={IMG}
            alt="Ballena jorobada en el océano Pacífico cerca del Chocó"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </motion.div>

        <motion.div
          className="flex flex-col justify-center bg-[#010d05] px-6 py-12 md:px-10 lg:py-16"
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-amber-400/70">
            Megaptera novaeangliae
          </p>
          <h2 className="font-serif mt-3 text-5xl font-bold leading-none text-white md:text-6xl">
            Ballenas Jorobadas
          </h2>
          <p className="font-sans mt-6 max-w-xl text-base font-normal leading-relaxed text-white/80">
            Entre julio y octubre, las aguas del Pacífico chocoano se convierten en el hogar de las
            ballenas jorobadas que migran desde la Antártica para reproducirse y dar a luz. El Parque
            Nacional Natural Utría es el epicentro de este espectáculo único en el mundo.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="font-sans rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-300">
              Julio — Octubre
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {spots.map((s) => (
              <span
                key={s}
                className="font-sans rounded-full border border-emerald-800/50 bg-[#0a1f10]/80 px-3 py-1 text-xs text-emerald-200/90 backdrop-blur-sm"
              >
                {s}
              </span>
            ))}
          </div>

          <p className="font-serif mt-10 text-2xl font-bold text-emerald-300">
            37 metros de longitud. 40 toneladas de gracia.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
