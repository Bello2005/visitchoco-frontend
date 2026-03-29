import { motion } from "framer-motion";

const EXPERIENCIAS = [
  {
    emoji: "🐋",
    titulo: "Avistamiento de ballenas",
    descripcion: "La migración más grande del Pacífico",
    color: "#0ea5e9",
  },
  {
    emoji: "🤿",
    titulo: "Buceo y snorkel",
    descripcion: "Arrecifes coralinos del Caribe",
    color: "#6366f1",
  },
  {
    emoji: "🏄",
    titulo: "Surf",
    descripcion: "Cabo Corrientes y olas perfectas",
    color: "#10b981",
  },
  {
    emoji: "🌊",
    titulo: "Pesca deportiva",
    descripcion: "Marlín, atún y dorado del Pacífico",
    color: "#f59e0b",
  },
  {
    emoji: "🦜",
    titulo: "Avistamiento de fauna",
    descripcion: "577 especies de aves. Jaguares. Delfines.",
    color: "#ec4899",
  },
  {
    emoji: "🛶",
    titulo: "Turismo fluvial",
    descripcion: "El río Atrato como sujeto de derechos",
    color: "#f97316",
  },
  {
    emoji: "🌿",
    titulo: "Turismo indígena",
    descripcion: "Comunidades Emberá y Wounaan",
    color: "#84cc16",
  },
  {
    emoji: "🏕️",
    titulo: "Ecoturismo de selva",
    descripcion: "Ensenada de Utría y selva tropical",
    color: "#14b8a6",
  },
];

export function ExperienciasSection() {
  return (
    <section className="py-24 px-6 md:px-16 bg-[#020d1a]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-sky-400/60 text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            Experiencias
          </p>
          <h2
            className="font-serif text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}
          >
            Todo lo que puedes
            <br />
            <span className="text-white/30">hacer aquí.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EXPERIENCIAS.map(({ emoji, titulo, descripcion, color }, i) => (
            <motion.div
              key={titulo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative rounded-2xl p-5 cursor-default
                           border border-white/[0.05] hover:border-white/15
                           transition-all duration-[400ms]"
              style={{
                background: "linear-gradient(145deg, #0c1f35, #071626)",
              }}
            >
              {/* Glow en hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                             transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 30% 70%, ${color}15 0%, transparent 70%)`,
                }}
              />

              <span className="text-3xl block mb-4">{emoji}</span>
              <p
                className="text-[10px] font-bold tracking-widest uppercase mb-1.5"
                style={{ color: `${color}80` }}
              >
                Experiencia
              </p>
              <h3 className="font-serif text-white text-base font-bold leading-tight mb-2">
                {titulo}
              </h3>
              <p className="text-white/30 text-xs leading-relaxed">{descripcion}</p>

              <div
                className="absolute bottom-0 left-4 right-4 h-px opacity-0
                               group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(to right, ${color}50, transparent)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
