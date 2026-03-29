import { motion } from "framer-motion";

const HITOS_ADMIN = [
  { año: "1726", evento: "Gobernación del Chocó separada de Popayán", resultado: "Avance" },
  { año: "1813", evento: "Grito de Independencia — 2 de febrero", resultado: "Libertad formal" },
  { año: "1906", evento: "Decreto 1347 — Rafael Reyes crea la Intendencia", resultado: "Avance parcial" },
  { año: "1926", evento: "Diego Luis Córdoba funda la Liga Pro-Chocó", resultado: "Resistencia" },
  { año: "1947", evento: "Ley 13 del 3 de noviembre — Departamento pleno", resultado: "Victoria" },
];

export function IndependenciaSection() {
  return (
    <section className="py-24 px-6 md:px-16 bg-[#0f0a00]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start mb-16">
          {/* Número masivo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white/20 text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              Años de lucha
            </p>
            <div className="relative">
              <span
                className="font-serif text-red-500/[0.06] absolute -top-8 -left-4 select-none leading-none"
                style={{ fontSize: "clamp(10rem, 25vw, 18rem)", fontWeight: 700 }}
              >
                134
              </span>
              <div className="relative z-10">
                <span
                  className="font-serif text-red-500 block leading-none"
                  style={{ fontSize: "clamp(5rem, 12vw, 9rem)", fontWeight: 700 }}
                >
                  134
                </span>
                <p className="text-white/50 text-lg mt-3">
                  años entre la independencia
                  <br />y la autonomía departamental.
                </p>
                <p className="text-white/25 text-xs mt-2">1813 → 1947</p>
              </div>
            </div>
          </motion.div>

          {/* Texto editorial */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5 pt-4 md:pt-16"
          >
            <h2
              className="font-serif text-white"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, lineHeight: 1.1 }}
            >
              La independencia llegó en 1813.
              <br />
              <span className="text-white/30">La autonomía tardó 134 años más.</span>
            </h2>
            <p className="text-white/40 text-base leading-relaxed">
              Tras separarse de España, el Chocó fue anexado al Gran Cauca y sometido a los intereses
              de Antioquia y Valle del Cauca que codiciaban sus recursos madereros y auríferos. La
              categoría de &quot;Intendencia&quot; lo mantuvo bajo tutela de Bogotá sin derechos
              políticos plenos.
            </p>
            <p className="text-white/40 text-base leading-relaxed">
              Diego Luis Córdoba cambió esto. Con dominio del latín, griego, francés y alemán, y una
              oratoria que paralizaba el Congreso, el primer abogado chocoano pasó su vida
              convirtiendo la injusticia en legislación. La Ley 13 de 1947 fue su obra maestra.
            </p>
          </motion.div>
        </div>

        {/* Tabla de hitos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-white/[0.06] rounded-2xl overflow-hidden"
        >
          {HITOS_ADMIN.map(({ año, evento, resultado }) => (
            <div
              key={año}
              className="flex items-center gap-6 px-6 py-4 border-b border-white/[0.04]
                           last:border-0 hover:bg-white/[0.02] transition-colors duration-200"
            >
              <span className="font-mono text-amber-500/70 text-sm font-bold w-12 flex-shrink-0">
                {año}
              </span>
              <p className="flex-1 text-white/60 text-sm">{evento}</p>
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  color:
                    resultado === "Victoria"
                      ? "#10b981"
                      : resultado === "Resistencia"
                        ? "#dc2626"
                        : resultado === "Libertad formal"
                          ? "#6366f1"
                          : "#d97706",
                  backgroundColor:
                    resultado === "Victoria"
                      ? "#10b98115"
                      : resultado === "Resistencia"
                        ? "#dc262615"
                        : resultado === "Libertad formal"
                          ? "#6366f115"
                          : "#d9770615",
                }}
              >
                {resultado}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
