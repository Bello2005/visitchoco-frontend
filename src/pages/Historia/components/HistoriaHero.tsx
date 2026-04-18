import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const SIGLOS = [
  { siglo: "S. XVI–XVII", label: "Pueblos originarios", color: "#d97706" },
  { siglo: "S. XVII–XVIII", label: "Esclavitud y cimarronaje", color: "#dc2626" },
  { siglo: "S. XIX", label: "Independencia y república", color: "#6366f1" },
  { siglo: "S. XX", label: "Lucha por ser departamento", color: "#10b981" },
  { siglo: "S. XXI", label: "Derechos y bioeconomía", color: "#0ea5e9" },
];

export function HistoriaHero() {
  return (
    <section
      className="relative min-h-[100dvh] flex flex-col
                          justify-between px-6 md:px-16 pt-32 pb-16
                          overflow-hidden bg-[#0f0a00]"
    >
      {/* Textura de fondo — líneas horizontales muy sutiles como páginas */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 32px)",
        }}
      />

      {/* Glow rojo sutil — como brasa */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 15% 60%, rgba(220,38,38,0.08) 0%, transparent 60%)",
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
        <BookOpen size={12} className="text-white/80" />
        <span className="text-white text-xs font-semibold tracking-wider uppercase">
          500 años de historia · Chocó, Colombia
        </span>
      </motion.div>

      {/* Contenido principal */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {/* Headline en 4 líneas — entrada escalonada */}
        <div className="overflow-hidden">
          {[
            { text: "No vinieron.", delay: 0.2, color: "text-white/90" },
            { text: "Los trajeron.", delay: 0.38, color: "text-red-500" },
            { text: "Y se quedaron.", delay: 0.56, color: "text-white/90" },
            { text: "Para siempre.", delay: 0.74, color: "text-amber-400" },
          ].map(({ text, delay, color }) => (
            <motion.h1
              key={text}
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
              className={`font-serif block leading-[0.88] ${color}`}
              style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)", fontWeight: 700 }}
            >
              {text}
            </motion.h1>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="text-white/30 text-base md:text-xl mt-10 max-w-2xl leading-relaxed"
        >
          Desde los pueblos Emberá y Wounaan que poblaron la selva antes de la historia escrita,
          hasta la Sentencia T-622 que declaró el río Atrato como sujeto de derechos en 2016.
          Cinco siglos de resistencia que el mundo necesita conocer.
        </motion.p>
      </div>

      {/* Línea de siglos — parte inferior */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-0
                     border-t border-white/[0.06] pt-8"
      >
        {SIGLOS.map(({ siglo, label, color }) => (
          <div
            key={siglo}
            className="flex-1 sm:border-l sm:first:border-l-0 border-white/[0.06] sm:pl-5 first:pl-0"
          >
            <p className="font-mono text-[10px] font-bold mb-1" style={{ color: `${color}80` }}>
              {siglo}
            </p>
            <p className="text-white/40 text-xs leading-tight">{label}</p>
            <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: color }} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
