import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1920&q=80";

export function FaunaHero() {
  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden bg-[#010d05]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 60% 50%, rgba(6,78,59,0.4) 0%, transparent 70%)",
      }}
    >
      <img
        src={HERO_IMG}
        alt="Jaguar en la selva del Chocó, biodiversidad del Pacífico colombiano"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[#010d05]/60" />

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-20 left-6 z-20 md:top-24 md:left-16 flex items-center gap-2
                   bg-emerald-400/10 backdrop-blur-md border border-emerald-400/20
                   px-4 py-2 rounded-full max-w-[calc(100vw-3rem)]"
      >
        <Leaf size={12} className="text-emerald-400" />
        <span className="text-emerald-300/90 text-xs font-semibold tracking-wider uppercase">
          Chocó Biogeográfico
        </span>
      </motion.div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-6 pb-16 pt-32 md:px-16 md:pb-20">
        <div className="max-w-[min(100%,56rem)]">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif block text-[clamp(2.25rem,min(8vw_+_0.5vh,11vw),min(6.5rem,15svh))] leading-[1.08] md:leading-[1.05] text-emerald-400"
            style={{ fontWeight: 700 }}
          >
            577 especies
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif block text-[clamp(2.25rem,min(8vw_+_0.5vh,11vw),min(6.5rem,15svh))] leading-[1.08] md:leading-[1.05] text-white/90"
            style={{ fontWeight: 700 }}
          >
            de aves.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans mt-6 max-w-xl text-base md:text-lg font-light leading-relaxed text-white/40"
          >
            El departamento más biodiverse del planeta.
          </motion.p>
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex flex-col items-center gap-2 md:bottom-10"
        style={{ x: "-50%" }}
        aria-hidden
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-emerald-500/60">
          Desliza
        </span>
        <motion.span
          className="h-12 w-px rounded-full bg-emerald-400"
          animate={{ opacity: [0.4, 1, 0.4], scaleY: [0.85, 1, 0.85] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
