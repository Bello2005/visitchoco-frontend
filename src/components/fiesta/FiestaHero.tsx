import { useMemo } from "react";
import { motion } from "framer-motion";

const CONFETTI_COLORS = [
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#fbbf24",
  "#10b981",
  "#d97706",
  "#f87171",
  "#fcd34d",
  "#ea580c",
  "#fde68a",
];

const TICKER =
  "San Pacho · Virgen del Carmen · Tamborito · Fiestas del Chontaduro · Festival de la Bahía · Alabaos · Chirimía · Bunde · Revulú · San Pacho ··· ";

const HERO_IMG =
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=75";

export function FiestaHero() {
  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${((i * 37) % 92) + 4}%`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: (i % 20) * 0.2,
        duration: 3 + (i % 4) * 0.75,
        rotate: (i * 47) % 360,
        size: 6 + (i % 5) * 2,
      })),
    []
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0c0800]">
      <img
        src={HERO_IMG}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-25 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0800] via-transparent to-[#0c0800]/80 pointer-events-none" />

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {confetti.map((c) => (
          <span
            key={c.id}
            className="fiesta-confetti-particle absolute rounded-[1px] opacity-90"
            style={{
              left: c.left,
              top: "-4%",
              width: c.size,
              height: c.size * 2.5,
              backgroundColor: c.color,
              transform: `rotate(${c.rotate}deg)`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-16 left-8 right-8 z-10 md:left-16 md:right-auto md:max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border border-amber-500/40 bg-amber-900/30 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-amber-300 inline-block rounded-full"
        >
          Patrimonio Cultural Inmaterial — UNESCO
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-serif text-6xl font-bold leading-none tracking-normal [font-variant-ligatures:no-common-ligatures] md:text-8xl lg:text-[7rem]"
        >
          <span className="block text-white/90">
            31 f<span className="pl-[0.07em]">iestas.</span>
          </span>
          <span className="block text-amber-400">Un solo</span>
          <span className="block text-white/90">corazón.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-lg font-sans text-lg font-light text-white/50"
        >
          Del San Pacho en Quibdó hasta el Tamborito en Nuquí — el Chocó celebra
          la vida con fuego, tambor y chirimía.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 overflow-hidden"
        >
          <div className="flex w-max animate-fiesta-marquee">
            <span className="pr-16 font-mono text-xs uppercase tracking-widest text-amber-500/60 whitespace-nowrap">
              {TICKER}
            </span>
            <span className="pr-16 font-mono text-xs uppercase tracking-widest text-amber-500/60 whitespace-nowrap">
              {TICKER}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
