import { motion } from "framer-motion";

const TEMPORADAS = [
  {
    experiencia: "Avistamiento de ballenas",
    emoji: "🐋",
    color: "#0ea5e9",
    meses: [7, 8, 9, 10],
    nota: "Julio–Octubre · Nuquí y Bahía Solano",
  },
  {
    experiencia: "Anidación tortugas caná",
    emoji: "🐢",
    color: "#10b981",
    meses: [3, 4, 5, 6, 7, 8],
    nota: "Marzo–Agosto · Capurganá",
  },
  {
    experiencia: "Surf · Cabo Corrientes",
    emoji: "🏄",
    color: "#6366f1",
    meses: [12, 1, 2, 3],
    nota: "Diciembre–Marzo · Nuquí",
  },
  {
    experiencia: "Pesca deportiva",
    emoji: "🎣",
    color: "#f59e0b",
    meses: [1, 2, 3, 4, 5],
    nota: "Enero–Mayo · Bahía Solano",
  },
  {
    experiencia: "Fiestas de San Pacho",
    emoji: "🎭",
    color: "#ec4899",
    meses: [9, 10],
    nota: "20 Sep – 5 Oct · Quibdó",
  },
  {
    experiencia: "Menos lluvia · Mejor clima",
    emoji: "☀️",
    color: "#f97316",
    meses: [12, 1, 2, 3, 4],
    nota: "Diciembre–Abril",
  },
];

const MESES_CORTOS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function TemporadasSection() {
  return (
    <section className="py-24 px-6 md:px-16 bg-[#051020]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="text-sky-400/60 text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            ¿Cuándo ir?
          </p>
          <h2
            className="font-serif text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}
          >
            El Chocó tiene
            <br />
            <span className="text-white/30">algo para cada mes.</span>
          </h2>
        </div>

        <div className="space-y-5">
          {/* Header de meses */}
          <div className="flex items-center gap-2 pl-[200px] md:pl-[240px]">
            {MESES_CORTOS.map((m) => (
              <div
                key={m}
                className="flex-1 text-center text-white/20 text-[10px] font-mono font-bold"
              >
                {m}
              </div>
            ))}
          </div>

          {/* Rows de temporadas */}
          {TEMPORADAS.map(({ experiencia, emoji, color, meses, nota }) => (
            <motion.div
              key={experiencia}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              {/* Label */}
              <div className="w-[200px] md:w-[240px] flex-shrink-0 flex items-center gap-2">
                <span className="text-lg">{emoji}</span>
                <div>
                  <p className="text-white/70 text-xs font-semibold leading-tight">
                    {experiencia}
                  </p>
                  <p className="text-white/30 text-[10px] mt-0.5">{nota}</p>
                </div>
              </div>

              {/* Barra de meses */}
              <div className="flex-1 flex gap-2 items-center">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => {
                  const isActive = meses.includes(mes);
                  return (
                    <div
                      key={mes}
                      className="flex-1 h-2.5 rounded-full transition-all duration-200"
                      style={{
                        backgroundColor: isActive
                          ? color
                          : "rgba(255,255,255,0.05)",
                        boxShadow: isActive ? `0 0 8px ${color}40` : "none",
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
