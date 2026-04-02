import { motion } from "framer-motion";

const HERO_IMG =
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1920&q=80";

export function FaunaHero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden bg-[#010d05]"
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
        className="absolute right-6 top-24 z-20 md:right-10 md:top-28"
      >
        <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-900/30 px-4 py-2 font-sans text-xs font-medium tracking-wide text-emerald-100/90 backdrop-blur-sm">
          Chocó Biogeográfico
        </span>
      </motion.div>

      <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-24 pt-32 md:px-16 md:pb-28">
        <div className="max-w-[min(100%,56rem)]">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif block text-7xl font-bold leading-[0.95] text-emerald-400 md:text-[clamp(4rem,10vw,9rem)]"
          >
            577 especies
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif mt-1 block text-7xl font-bold leading-[0.95] text-white/90 md:text-[clamp(4rem,10vw,9rem)]"
          >
            de aves.
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans mt-6 max-w-xl text-base font-light uppercase tracking-widest text-emerald-300/70"
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
