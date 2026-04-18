import { motion } from "framer-motion";
import { ArrowDown, Anchor } from "lucide-react";

const HEADLINES: { text: string; delay: number; color: string }[] = [
  { text: "Un océano.", delay: 0.4, color: "text-white" },
  { text: "Una selva.", delay: 0.55, color: "text-white" },
  { text: "Sin igual.", delay: 0.7, color: "text-sky-400" },
];

/** Sin overflow-hidden: el bloque completo ya no debe recortar ascendentes ni chocar con section overflow */
function HeroHeadlineLine({
  text,
  delay,
  color,
}: {
  text: string;
  delay: number;
  color: string;
}) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`font-serif block ${color} leading-[1.08] md:leading-[1.05]`}
      style={{
        fontSize:
          "clamp(2.25rem, min(8vw + 0.5vh, 11vw), min(6.5rem, 15svh))",
        fontWeight: 700,
      }}
    >
      {text}
    </motion.h1>
  );
}

export function TurismoHero() {
  return (
    <section className="relative h-[100dvh] min-h-0 overflow-x-hidden">
      {/* Capas de fondo recortadas (scale) — el texto ya no vive bajo overflow:hidden de la section */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/municipios/nuqui.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            transform: "scale(1.08)",
            filter: "brightness(0.45)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(2,13,26,0.95) 0%, rgba(2,13,26,0.4) 40%, rgba(2,13,26,0.1) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(2,13,26,0.7) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Badge superior */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-20 right-6 z-20 md:top-24 md:right-16 flex items-center gap-2
                   bg-black/50 backdrop-blur-sm border border-white/20 text-white
                   px-4 py-2 rounded-full max-w-[calc(100vw-3rem)]"
      >
        <Anchor size={12} className="text-white/80" />
        <span className="text-white text-xs font-semibold tracking-wider uppercase">
          Pacífico · Caribe · Selva · Río
        </span>
      </motion.div>

      {/* Sin overflow-y en este panel: si no, la rueda/touch se queda aquí y no hace scroll de la página */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex min-h-0 flex-col overflow-x-hidden px-6 md:px-16
                   pt-4 top-[5.5rem] sm:top-24 md:top-28
                   pb-[max(4rem,env(safe-area-inset-bottom,0px))] md:pb-[max(5rem,env(safe-area-inset-bottom,0px))]"
      >
        <div className="mt-auto flex w-full max-w-[min(100%,56rem)] flex-col gap-5 md:gap-7">
          <div className="flex flex-col gap-0">
            {HEADLINES.map(({ text, delay, color }) => (
              <HeroHeadlineLine
                key={text}
                text={text}
                delay={delay}
                color={color}
              />
            ))}
          </div>
        </div>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/40 md:mt-8 md:text-xl"
        >
          El único lugar del planeta donde puedes desayunar viendo saltar
          ballenas jorobadas y cenar en la selva más biodiversa del hemisferio
          occidental.
        </motion.p>

        {/* Stats en línea horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-8 flex flex-wrap gap-6 border-b border-white/10 pb-2 md:mt-10"
        >
          {[
            {
              value: "602",
              label: "prestadores RNT activos",
              color: "#0ea5e9",
            },
            {
              value: "Jul–Oct",
              label: "temporada ballenas",
              color: "#10b981",
            },
            {
              value: "2",
              label: "océanos en un departamento",
              color: "#f59e0b",
            },
            {
              value: "1.382",
              label: "km de costa Pacífica",
              color: "#6366f1",
            },
          ].map(({ value, label, color }) => (
            <div key={label}>
              <p
                className="font-serif font-bold"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  color,
                }}
              >
                {value}
              </p>
              <p className="mt-0.5 text-xs text-white/30">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6 flex flex-wrap items-center gap-4 md:mt-8"
        >
          <a
            href="/mapa"
            className="flex items-center gap-2 rounded-full bg-sky-500 px-7 py-3.5 text-sm font-semibold text-white
                       shadow-lg shadow-sky-900/30 transition-all duration-200 hover:bg-sky-400"
          >
            <ArrowDown size={14} />
            Explorar destinos
          </a>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("ballenas")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-1.5 text-sm font-medium text-white/50 transition-colors duration-200
                       hover:text-sky-400"
          >
            Ver las ballenas ↓
          </button>
        </motion.div>
      </div>
    </section>
  );
}
