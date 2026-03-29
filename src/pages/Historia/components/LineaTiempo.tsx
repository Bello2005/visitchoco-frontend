import { motion } from "framer-motion";
import { useState } from "react";

const EVENTOS = [
  {
    año: "~10000 a.C.",
    titulo: "Los primeros",
    descripcion:
      "Los pueblos Emberá y Wounaan pueblan las selvas y ríos del Chocó Biogeográfico milenios antes de la historia escrita. El Jaibanismo — sistema espiritual basado en la mediación entre humanos y la naturaleza — estructura su cosmología.",
    color: "#d97706",
    categoria: "Pueblos originarios",
  },
  {
    año: "1513",
    titulo: "Vasco Núñez de Balboa",
    descripcion:
      "La expedición cruza el Istmo del Darién y avista el Océano Pacífico. Para los europeos, el «descubrimiento». Para los pueblos originarios, el inicio de la catástrofe.",
    color: "#dc2626",
    categoria: "Contacto colonial",
  },
  {
    año: "1648",
    titulo: "Los franciscanos llegan al Atrato",
    descripcion:
      "El misionero Matías Abad organiza la primera procesión fluvial con la imagen de San Francisco de Asís. El catolicismo llega — pero la cultura africana lo transforma desde adentro. Nace el sincretismo que siglos después la UNESCO declarará Patrimonio de la Humanidad.",
    color: "#6366f1",
    categoria: "Evangelización",
  },
  {
    año: "1726",
    titulo: "Nace la Gobernación del Chocó",
    descripcion:
      "La Corona española separa administrativamente al Chocó de Popayán creando la Gobernación, subdivida en provincias: Nóvita, Citará, Tatamá, Baudó y Raposo. El oro del Chocó financia el Imperio.",
    color: "#d97706",
    categoria: "Colonial",
  },
  {
    año: "1727–1728",
    titulo: "El Rey Barule",
    descripcion:
      "El esclavo africano Barule — de etnia Akan, traído desde Jamaica — confedera a más de 120 cimarrones y 2.000 esclavizados. Funda el Palenque de Tadó y se proclama Rey. Fue traicionado, capturado y fusilado el 18 de febrero de 1728. El terror que infundió forzó mejoras en las condiciones de los esclavizados.",
    color: "#dc2626",
    categoria: "Cimarronaje",
    destacado: true,
  },
  {
    año: "1795",
    titulo: "Agustina de Tadó",
    descripcion:
      "Una mujer esclavizada llamada Agustina es abusada por su amo, denuncia ante la justicia colonial, es castigada y azotada. Su respuesta: incendia la hacienda y desata una ola de revueltas. Primer acto de rebelión liderado por una mujer negra en Colombia y América Latina.",
    color: "#ec4899",
    categoria: "Resistencia femenina",
    destacado: true,
  },
  {
    año: "1813",
    titulo: "Independencia del Chocó",
    descripcion:
      "El 2 de febrero, la provincia del Chocó proclama su independencia del régimen español. Sin embargo, la república que sigue no traerá equidad — el Chocó será anexado al Gran Cauca y marginado durante más de un siglo.",
    color: "#10b981",
    categoria: "Independencia",
  },
  {
    año: "1907",
    titulo: "Manuel Saturio Valencia",
    descripcion:
      "Nacido en Quibdó, el primer afrodescendiente en ingresar a la Universidad del Cauca. Pedagogo, escritor, juez. Acusado de intentar incendiar Quibdó en un juicio viciado por el racismo, el 6 de mayo de 1907 es fusilado. Última persona en sufrir la pena de muerte en la historia judicial de Colombia.",
    color: "#dc2626",
    categoria: "Mártir",
    destacado: true,
  },
  {
    año: "1947",
    titulo: "El Chocó es Departamento",
    descripcion:
      "Tras casi 50 años de lucha política liderada por Diego Luis Córdoba — primer abogado chocoano, orador brillante, defensor de los derechos afros — el Congreso aprueba la Ley 13 del 3 de noviembre de 1947. El Chocó obtiene su autonomía territorial.",
    color: "#10b981",
    categoria: "Autonomía",
    destacado: true,
  },
  {
    año: "2016",
    titulo: "Sentencia T-622: El Río tiene Derechos",
    descripcion:
      "La Corte Constitucional de Colombia declara al río Atrato como sujeto de derechos — el primero en América Latina en recibir esta protección jurídica. La sentencia reconoce la relación indisoluble entre el pueblo chocoano y su río.",
    color: "#0ea5e9",
    categoria: "Justicia ambiental",
    destacado: true,
  },
];

export function LineaTiempo() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 md:px-16 bg-[#140c00]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-red-500/50 text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          >
            Línea de tiempo
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700 }}
          >
            500 años en
            <br />
            <span className="text-white/25">10 momentos.</span>
          </motion.h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-[28px] md:left-[36px] top-0 bottom-0 w-px bg-white/[0.06]" />

          <div className="space-y-0">
            {EVENTOS.map((ev, i) => (
              <motion.div
                key={ev.año}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="relative flex gap-6 md:gap-10 pb-10 cursor-default group"
              >
                {/* Nodo en la línea */}
                <div className="flex-shrink-0 relative z-10 mt-1">
                  <div
                    className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] rounded-full border-2
                                 transition-all duration-300 flex-shrink-0"
                    style={{
                      borderColor: hoveredIdx === i ? ev.color : "rgba(255,255,255,0.15)",
                      backgroundColor: hoveredIdx === i ? ev.color : "transparent",
                      boxShadow: hoveredIdx === i ? `0 0 12px ${ev.color}60` : "none",
                    }}
                  />
                </div>

                {/* Contenido */}
                <div className="flex-1 pb-2">
                  {/* Categoría + año */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full"
                      style={{
                        color: ev.color,
                        backgroundColor: `${ev.color}15`,
                        border: `1px solid ${ev.color}30`,
                      }}
                    >
                      {ev.categoria}
                    </span>
                    {ev.destacado && (
                      <span className="text-[10px] font-bold text-white/20 tracking-widest uppercase">
                        ★ Hito
                      </span>
                    )}
                  </div>

                  {/* Año masivo */}
                  <p
                    className="font-serif font-bold leading-none mb-2 transition-colors duration-300"
                    style={{
                      fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                      color: hoveredIdx === i ? ev.color : "rgba(255,255,255,0.85)",
                    }}
                  >
                    {ev.año}
                  </p>

                  {/* Título */}
                  <h3 className="text-white/80 font-semibold text-base md:text-lg mb-2 leading-tight">
                    {ev.titulo}
                  </h3>

                  {/* Descripción */}
                  <p className="text-white/35 text-sm leading-relaxed max-w-2xl">{ev.descripcion}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
