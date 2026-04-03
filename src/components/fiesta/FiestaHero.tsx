import { useMemo } from "react";
import { motion } from "framer-motion";
import { Music } from "lucide-react";

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
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#0c0800]">
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

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-20 left-6 z-20 md:top-24 md:left-16 flex items-center gap-2
                   bg-amber-400/10 backdrop-blur-md border border-amber-400/20
                   px-4 py-2 rounded-full max-w-[calc(100vw-3rem)]"
      >
        <Music size={12} className="text-amber-400" />
        <span className="text-amber-300/90 text-xs font-semibold tracking-wider uppercase">
          Patrimonio Cultural Inmaterial — UNESCO
        </span>
      </motion.div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end pt-32 px-6 md:px-16 pb-16 md:pb-20">
        {[
          { text: "31 fiestas.", color: "text-white/90", delay: 0.2 },
          { text: "Un solo", color: "text-amber-400", delay: 0.35 },
          { text: "corazón.", color: "text-white/90", delay: 0.5 },
        ].map(({ text, color, delay }) => (
          <motion.h1
            key={text}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
            className={`font-serif block text-[clamp(2.25rem,min(8vw_+_0.5vh,11vw),min(6.5rem,15svh))] leading-[1.08] md:leading-[1.05] ${color}`}
            style={{ fontWeight: 700 }}
          >
            {text}
          </motion.h1>
        ))}

        <motion.p
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-lg font-sans text-base md:text-lg font-light leading-relaxed text-white/40"
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
