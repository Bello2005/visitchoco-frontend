import { motion } from "framer-motion";
import { ArrowRight, Droplets } from "lucide-react";

export function AtratoDerecho() {
  return (
    <section
      className="py-32 px-6 md:px-16 relative overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0f0a00 0%, #020d1a 100%)" }}
    >
      {/* Efecto río — líneas curvas azules muy sutiles */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(92deg, #0ea5e9 0px, #0ea5e9 1px, transparent 1px, transparent 60px)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 mb-12"
        >
          <Droplets size={14} className="text-sky-400" />
          <span className="text-sky-400/60 text-xs font-semibold tracking-[0.25em] uppercase">
            Sentencia T-622 · 10 de noviembre de 2016
          </span>
        </motion.div>

        {/* Cita masiva */}
        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif text-white/85 leading-tight mb-12"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)", fontWeight: 700 }}
        >
          &quot;El río Atrato es
          <br />
          <span className="text-sky-400">sujeto de derechos</span>
          <br />
          de protección,
          <br />
          conservación,
          <br />
          <span className="text-white/30">mantenimiento</span>
          <br />y restauración.&quot;
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-white/20 text-sm mb-12 italic"
        >
          — Corte Constitucional de Colombia · Primer río en América Latina declarado sujeto de
          derechos
        </motion.p>

        {/* Texto editorial */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/40 text-base leading-relaxed"
          >
            Aplicando el principio de precaución ambiental, la Corte Constitucional creó una
            jurisprudencia que transformó el paradigma jurídico latinoamericano: el río Atrato no es
            propiedad de nadie. Es un ser vivo con derechos propios.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-base leading-relaxed"
          >
            La Sentencia reconoció la interdependencia biocultural entre las comunidades afros e
            indígenas y el río. Sin el Atrato vivo, la cultura chocoana no puede existir. Son una sola
            cosa.
          </motion.p>
        </div>

        {/* Stats de la sentencia */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { valor: "T-622", label: "Número de la sentencia", color: "#0ea5e9" },
            { valor: "30", label: "instituciones responsables", color: "#dc2626" },
            { valor: "14", label: "guardianes del río", color: "#10b981" },
            { valor: "2016", label: "primera vez en Am. Latina", color: "#d97706" },
          ].map(({ valor, label, color }) => (
            <div
              key={label}
              className="p-4 rounded-2xl border border-white/[0.05]"
              style={{ backgroundColor: `${color}08` }}
            >
              <p
                className="font-serif font-bold leading-none mb-1"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color }}
              >
                {valor}
              </p>
              <p className="text-white/25 text-xs leading-tight">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center gap-4"
        >
          <a
            href="/mapa"
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white
                         px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200
                         shadow-lg shadow-sky-900/30"
          >
            Ver el Atrato en el mapa
            <ArrowRight size={14} />
          </a>
          <a
            href="/cultura"
            className="flex items-center gap-2 border border-white/15 hover:border-white/30
                         text-white/60 hover:text-white px-7 py-3.5 rounded-full text-sm
                         font-medium transition-all duration-200"
          >
            Ver el patrimonio cultural
            <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
