import { motion } from "framer-motion";
import { ArrowDown, Music } from "lucide-react";

const CONFETTI = [
  { x: "8%", y: "15%", size: 12, color: "#f59e0b", delay: 0 },
  { x: "18%", y: "70%", size: 8, color: "#ec4899", delay: 0.3 },
  { x: "75%", y: "20%", size: 16, color: "#10b981", delay: 0.6 },
  { x: "88%", y: "65%", size: 10, color: "#6366f1", delay: 0.15 },
  { x: "45%", y: "8%", size: 6, color: "#f97316", delay: 0.45 },
  { x: "92%", y: "40%", size: 14, color: "#f59e0b", delay: 0.9 },
  { x: "5%", y: "50%", size: 9, color: "#0ea5e9", delay: 0.7 },
  { x: "60%", y: "85%", size: 11, color: "#ec4899", delay: 0.2 },
  { x: "30%", y: "90%", size: 7, color: "#10b981", delay: 0.55 },
  { x: "70%", y: "5%", size: 13, color: "#6366f1", delay: 0.35 },
];

export function FiestaHero() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-16 overflow-hidden bg-[#0c0800]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(245,158,11,0.12) 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 20% 30%, rgba(236,72,153,0.07) 0%, transparent 50%)",
        }}
      />

      {CONFETTI.map(({ x, y, size, color, delay }, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ left: x, top: y, width: size, height: size, backgroundColor: color }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + delay,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-8"
        >
          <Music size={14} className="text-amber-400" />
          <span className="text-amber-400/80 text-xs font-semibold tracking-[0.25em] uppercase">
            Departamento del Chocó · Calendario festivo
          </span>
        </motion.div>

        <div className="relative mb-4">
          <span
            className="absolute -top-10 -left-6 font-serif text-white/[0.03] select-none pointer-events-none leading-none"
            style={{ fontSize: "clamp(12rem, 30vw, 22rem)", fontWeight: 700 }}
          >
            37
          </span>

          <div className="relative z-10 overflow-hidden">
            {[
              { text: "La fiesta", delay: 0.2, color: "text-white" },
              { text: "es la lengua", delay: 0.35, color: "text-white" },
              { text: "del Chocó.", delay: 0.5, color: "text-amber-400" },
            ].map(({ text, delay, color }) => (
              <motion.h1
                key={text}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
                className={`font-serif leading-[0.9] block ${color}`}
                style={{ fontSize: "clamp(3.8rem, 11vw, 9rem)", fontWeight: 700 }}
              >
                {text}
              </motion.h1>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="text-white/40 text-base md:text-xl mt-8 max-w-2xl leading-relaxed"
        >
          37 fiestas documentadas. 12 meses de celebración. Desde 1648 el pueblo chocoano convirtió la
          fe en resistencia y la calle en su catedral.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="flex flex-wrap gap-3 mt-10"
        >
          {[
            { label: "37 fiestas", color: "#f59e0b" },
            { label: "12 meses activos", color: "#10b981" },
            { label: "UNESCO 2012", color: "#6366f1" },
            { label: "Desde 1648", color: "#ec4899" },
          ].map(({ label, color }) => (
            <span
              key={label}
              className="text-xs font-semibold px-4 py-2 rounded-full border"
              style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
            >
              {label}
            </span>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          type="button"
          onClick={() => scrollTo("calendario")}
          className="mt-12 flex items-center gap-2 text-white/30 hover:text-amber-400 transition-colors duration-200 text-sm font-medium"
        >
          <ArrowDown size={14} />
          Ver el calendario
        </motion.button>
      </div>
    </section>
  );
}
