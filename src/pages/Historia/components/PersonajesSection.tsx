import { motion } from "framer-motion";

const PERSONAJES = [
  {
    numero: "01",
    nombre: "Barule",
    periodo: "~1690 – 1728",
    rol: "El primer libertador",
    descripcion:
      "Esclavo de etnia Akan, nacido en África y traído desde Jamaica. Lideró la insurrección más grande del Chocó colonial, confederando a 2.000 esclavizados. Fundó el Palenque de Tadó y se proclamó Rey. Fusilado el 18 de febrero de 1728.",
    legado:
      "La resistencia cimarrona obligó a los esclavistas a conceder el derecho a cultivar parcelas propias.",
    color: "#dc2626",
    imagen: "/images/municipios/tado.jpg",
  },
  {
    numero: "02",
    nombre: "Manuel Saturio Valencia",
    periodo: "1867 – 1907",
    rol: "El primer mártir del racismo institucional",
    descripcion:
      "Pedagogo, escritor, juez y el primer afrodescendiente en la Universidad del Cauca. Acusado en un proceso viciado de intentar incendiar Quibdó. Fusilado el 6 de mayo de 1907 — la última persona en sufrir la pena de muerte en Colombia.",
    legado:
      "Su ejecución evidenció el racismo estructural del Estado colombiano ante toda la nación.",
    color: "#6366f1",
    imagen: "/images/municipios/quibdo.jpg",
  },
  {
    numero: "03",
    nombre: "Diego Luis Córdoba",
    periodo: "1907 – 1964",
    rol: "El padre del departamento",
    descripcion:
      "Primer abogado chocoano. Dominio del latín, griego, francés y alemán. Fundó la «Liga Pro-Chocó» en 1926. Luchó contra el «impuesto del platino», la paridad salarial de maestros y la autonomía territorial. En 1947 logró la aprobación de la Ley 13 que convirtió al Chocó en Departamento.",
    legado:
      "Sin Diego Luis Córdoba, el Chocó seguiría siendo una Intendencia sin derechos políticos plenos.",
    color: "#10b981",
    imagen: "/images/municipios/condoto.jpg",
  },
  {
    numero: "04",
    nombre: "Amir Smith Córdoba",
    periodo: "1948 – 2003",
    rol: "El intelectual de la negritud",
    descripcion:
      "Sociólogo, periodista y abogado de Cértegui. Fundó el Centro de Investigaciones para el Desarrollo de la Cultura Negra y el periódico Presencia Negra. Propuso la autodenominación «africano nacido en Colombia». Murió en pobreza extrema por su ostracismo político.",
    legado: "Sus obras sentaron las bases para el movimiento afrocolombiano y la Ley 70 de 1993.",
    color: "#d97706",
    imagen: "/images/municipios/certegui.jpg",
  },
];

export function PersonajesSection() {
  return (
    <section className="py-24 px-6 md:px-16 bg-[#180e00]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-amber-500/50 text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          >
            Los que cambiaron la historia
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700 }}
          >
            Cuatro nombres que
            <br />
            <span className="text-white/25">el Chocó no olvida.</span>
          </motion.h2>
        </div>

        <div className="flex md:grid md:grid-cols-2 gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 snap-x snap-mandatory md:snap-none -mx-6 px-6 md:mx-0 md:px-0">
          {PERSONAJES.map(
            ({ numero, nombre, periodo, rol, descripcion, legado, color, imagen }, i) => (
              <motion.div
                key={nombre}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl flex-shrink-0 w-[min(100%,380px)] md:w-auto snap-center"
                style={{ minHeight: 420 }}
              >
                {/* Imagen de fondo */}
                <img
                  src={imagen}
                  alt={nombre}
                  className="absolute inset-0 w-full h-full object-cover
                             transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: "brightness(0.25) saturate(0.4) sepia(0.5)" }}
                />

                {/* Overlay de color del personaje */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${color}15 0%, transparent 50%), linear-gradient(to top, rgba(15,10,0,0.95) 0%, rgba(15,10,0,0.4) 60%, transparent 100%)`,
                  }}
                />

                {/* Contenido */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
                  {/* Número + período */}
                  <div className="flex items-start justify-between">
                    <span
                      className="font-serif font-bold text-4xl md:text-5xl leading-none"
                      style={{ color: `${color}30` }}
                    >
                      {numero}
                    </span>
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                      style={{
                        color,
                        backgroundColor: `${color}15`,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {periodo}
                    </span>
                  </div>

                  {/* Info principal */}
                  <div>
                    <p
                      className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2"
                      style={{ color: `${color}80` }}
                    >
                      {rol}
                    </p>
                    <h3
                      className="font-serif text-white font-bold mb-3"
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
                    >
                      {nombre}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-4">{descripcion}</p>

                    {/* Legado */}
                    <div className="flex items-start gap-2 pt-3 border-t border-white/[0.06]">
                      <div
                        className="w-0.5 h-full flex-shrink-0 rounded-full mt-1"
                        style={{ backgroundColor: color, minHeight: 40 }}
                      />
                      <p className="text-white/30 text-xs italic leading-relaxed">{legado}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
