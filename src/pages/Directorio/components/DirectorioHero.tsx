import { motion } from "framer-motion";
import { Foto } from "../../../components/common/Foto";

export function DirectorioHero() {
  return (
    <section className="relative max-h-[40vh] overflow-hidden">
      {/* Capas de fondo — mismo lenguaje del hero de Tourism, compacto */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            transform: "scale(1.06)",
            filter: "brightness(0.35)",
          }}
        >
          <Foto
            src="/images/municipios/bahia-solano.jpg"
            alt=""
            aria-hidden
            sizes="100vw"
            prioridad
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 35%" }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(2,13,26,1) 0%, rgba(2,13,26,0.55) 55%, rgba(2,13,26,0.35) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 pt-24 md:pt-28 pb-10 md:pb-12">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-400/70"
        >
          Directorio · RNT
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-white leading-[1.05]"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.4rem)", fontWeight: 700 }}
        >
          Los negocios del Chocó
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-3 max-w-xl text-sm md:text-base text-white/55"
        >
          602 prestadores verificados en el Registro Nacional de Turismo.
        </motion.p>
      </div>
    </section>
  );
}
