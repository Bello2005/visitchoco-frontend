import { motion } from "framer-motion";
import { ArrowDown, Landmark } from "lucide-react";

export function CulturaHero() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      className="min-h-[100dvh] flex flex-col justify-end pt-32 pb-16 md:pb-20 px-6 md:px-16
                 bg-[#0a0f0a] relative overflow-hidden"
    >
      {/* Fondo: gradiente radial cálido sutil — como brasas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(234,88,12,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(234,179,8,0.05) 0%, transparent 50%)",
        }}
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-20 right-6 z-20 md:top-24 md:right-16 flex items-center gap-2
                   bg-black/50 backdrop-blur-sm border border-white/20 text-white
                   px-4 py-2 rounded-full max-w-[calc(100vw-3rem)]"
      >
        <Landmark size={12} className="text-white/80" />
        <span className="text-white text-xs font-semibold tracking-wider uppercase">
          Patrimonio · Identidad · Resistencia
        </span>
      </motion.div>

      {/* Headline masivo — 3 líneas que bajan escalonadas */}
      <div className="overflow-hidden">
        {[
          { text: "La cultura del", delay: 0.3, color: "text-white/90" },
          { text: "Chocó no se", delay: 0.45, color: "text-white/90" },
          { text: "hereda. Se vive.", delay: 0.6, color: "text-amber-400" },
        ].map(({ text, delay, color }) => (
          <motion.h1
            key={text}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
            className={`font-serif leading-[0.92] ${color} block`}
            style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)", fontWeight: 700 }}
          >
            {text}
          </motion.h1>
        ))}
      </div>

      {/* Descripción */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="text-white/40 text-base md:text-lg mt-8 max-w-2xl leading-relaxed"
      >
        Tres manifestaciones declaradas Patrimonio de la Humanidad.
        Gastronomía nacida del río y la selva. Una chirimía que lleva tres
        siglos resistiendo. Esto es lo que el Chocó le regala al mundo.
      </motion.p>

      {/* Pills de navegación */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="flex flex-wrap gap-3 mt-10"
      >
        {[
          {
            label: "Patrimonio UNESCO",
            id: "pes",
            color:
              "border-amber-400/40 text-amber-300 hover:bg-amber-400/10",
          },
          {
            label: "La Chirimía",
            id: "chirimia",
            color: "border-white/20 text-white/60 hover:bg-white/5",
          },
          {
            label: "Expresiones vivas",
            id: "expresiones",
            color: "border-white/20 text-white/60 hover:bg-white/5",
          },
          {
            label: "Gastronomía",
            id: "gastronomia",
            color: "border-white/20 text-white/60 hover:bg-white/5",
          },
        ].map(({ label, id, color }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border
                       text-sm font-medium transition-all duration-200 ${color}`}
          >
            {label}
            <ArrowDown size={12} />
          </button>
        ))}
      </motion.div>
    </section>
  );
}
