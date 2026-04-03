import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Calendar, Users } from "lucide-react";

export interface PESItem {
  id: number;
  titulo: string;
  municipio_nombre: string;
  fecha_declaracion: string;
  ambito: string;
  descripcion_corta: string;
  descripcion_larga: string;
  elementos_clave: string[];
  fecha_celebracion: string;
  organizacion_gestora: string;
  color: string;
  colorDark: string;
  imagen: string;
  icon: string;
}

export function PESCard({
  pes,
  isActive,
  onClick,
}: {
  pes: PESItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl cursor-pointer flex-shrink-0"
      style={{
        flexBasis: isActive ? "60%" : "20%",
        minHeight: isActive ? 560 : 200,
        transition:
          "flex-basis 0.5s cubic-bezier(0.16,1,0.3,1), min-height 0.5s cubic-bezier(0.16,1,0.3,1)",
        border: `1px solid ${
          isActive ? pes.color + "50" : "rgba(255,255,255,0.06)"
        }`,
      }}
    >
      {/* Imagen de fondo */}
      <img
        src={pes.imagen}
        alt={pes.titulo}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: isActive
            ? "brightness(0.35)"
            : "brightness(0.2) saturate(0.3)",
          transition: "filter 0.5s ease",
        }}
      />

      {/* Overlay con color del PES */}
      <div
        className="absolute inset-0"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${pes.colorDark}60 0%, transparent 60%)`
            : "transparent",
          transition: "background 0.5s ease",
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
        {/* Top: icono + badge */}
        <div className="flex items-start justify-between">
          <span className="text-3xl">{pes.icon}</span>
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${pes.color}20`,
              color: pes.color,
              border: `1px solid ${pes.color}40`,
            }}
          >
            {pes.fecha_declaracion}
          </span>
        </div>

        {/* Bottom: título siempre visible + contenido expandido */}
        <div>
          {/* Título — vertical cuando inactivo en desktop */}
          {/* Título vertical solo en desktop (lg+) */}
          <div
            style={
              !isActive
                ? { writingMode: "vertical-rl" as const, transform: "rotate(180deg)" }
                : undefined
            }
            className="hidden lg:block"
          >
            <p
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2"
              style={{ color: `${pes.color}90` }}
            >
              {pes.ambito}
            </p>
            <h3
              className="font-serif text-white font-bold leading-tight"
              style={{ fontSize: isActive ? "clamp(1.5rem, 3vw, 2.2rem)" : "1rem" }}
            >
              {pes.titulo}
            </h3>
          </div>

          {/* Título horizontal en mobile e iPad */}
          <div className="lg:hidden">
            <p
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2"
              style={{ color: `${pes.color}90` }}
            >
              {pes.ambito}
            </p>
            <h3
              className="font-serif text-white font-bold leading-tight text-lg"
            >
              {pes.titulo}
            </h3>
          </div>

          {/* Contenido expandido */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="mt-5 space-y-5"
              >
                <p className="text-white/65 text-sm leading-relaxed max-w-lg">
                  {pes.descripcion_larga}
                </p>

                {/* Elementos clave como pills */}
                <div className="flex flex-wrap gap-2">
                  {pes.elementos_clave.map((el) => (
                    <span
                      key={el}
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: `${pes.color}15`,
                        color: `${pes.color}cc`,
                      }}
                    >
                      {el}
                    </span>
                  ))}
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Calendar size={12} />
                    {pes.fecha_celebracion}
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Users size={12} />
                    {pes.organizacion_gestora}
                  </div>
                </div>

                <a
                  href={`/fiesta?municipio=${encodeURIComponent(pes.municipio_nombre)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: pes.color }}
                >
                  Ver más sobre {pes.municipio_nombre}
                  <ChevronRight size={14} />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
