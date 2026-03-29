import { motion } from "framer-motion";

const DESTINOS = [
  {
    id: "acandi",
    nombre: "Acandí · Capurganá · Sapzurro",
    region: "Mar Caribe",
    regionColor: "#0ea5e9",
    rnt: 153,
    imagen: "/images/municipios/acandi.jpg",
    tagline: "Playas sin carros. Arrecifes sin igual.",
    descripcion:
      "El único municipio de Colombia donde no hay carreteras. Capurganá y Sapzurro solo se alcanzan en lancha o a pie. Arrecifes coralinos, la ensenada donde anida la tortuga caná y la frontera con Panamá.",
    experiencias: [
      "Buceo en arrecifes",
      "Tortugas caná",
      "Paso a Sapzurro a pie",
    ],
    slug: "acandi",
    colSpan: "md:col-span-7",
    height: "min-h-[480px]",
  },
  {
    id: "nuqui",
    nombre: "Nuquí",
    region: "Pacífico Norte",
    regionColor: "#10b981",
    rnt: 152,
    imagen: "/images/municipios/nuqui.jpg",
    tagline: "Ballenas, selva y termales en el Pacífico.",
    descripcion:
      "Rodeado de selva húmeda y playas de arena oscura. Avistamiento de ballenas en Ensenada de Utría, surf en Cabo Corrientes, baños termales junto al mar.",
    experiencias: [
      "Avistamiento ballenas",
      "Termales naturales",
      "Surf Cabo Corrientes",
    ],
    slug: "nuqui",
    colSpan: "md:col-span-5",
    height: "min-h-[480px]",
  },
  {
    id: "bahia-solano",
    nombre: "Bahía Solano",
    region: "Pacífico Norte",
    regionColor: "#10b981",
    rnt: 111,
    imagen: "/images/municipios/bahia-solano.jpg",
    tagline: "La puerta del Pacífico colombiano.",
    descripcion:
      "Pesca deportiva de marlín y atún. Playas de Huina y El Valle. Base para PNN Utría y avistamiento de ballenas.",
    experiencias: ["Pesca deportiva", "PNN Utría", "Playa Huina"],
    slug: "bahia-solano",
    colSpan: "md:col-span-3",
    height: "min-h-[300px]",
  },
  {
    id: "quibdo",
    nombre: "Quibdó",
    region: "Región del Atrato",
    regionColor: "#f59e0b",
    rnt: 128,
    imagen: "/images/municipios/quibdo.jpg",
    tagline: "Capital cultural del Chocó.",
    descripcion:
      "San Pacho UNESCO. Malecón del Atrato. Catedral colonial. Hub para explorar todo el departamento.",
    experiencias: ["Fiestas San Pacho", "Malecón del Atrato", "Gastronomía local"],
    slug: "quibdo",
    colSpan: "md:col-span-3",
    height: "min-h-[300px]",
  },
  {
    id: "riosucio",
    nombre: "Riosucio",
    region: "Zona Norte · Darién",
    regionColor: "#6366f1",
    rnt: 9,
    imagen: "/images/municipios/riosucio.jpg",
    tagline: "Darién profundo. Selva sin límites.",
    descripcion:
      "Puertas del Darién. Ciénaga de Bellavista. Playas de Pogue. Ecoturismo de bajo impacto.",
    experiencias: ["Ecoturismo Darién", "Playas de Pogue", "Ciénaga Bellavista"],
    slug: "riosucio",
    colSpan: "md:col-span-3",
    height: "min-h-[300px]",
  },
  {
    id: "bojaya",
    nombre: "Bojayá · Bellavista",
    region: "Medio Atrato",
    regionColor: "#ec4899",
    rnt: 2,
    imagen: "/images/municipios/bojaya.jpg",
    tagline: "Turismo de memoria y naturaleza.",
    descripcion:
      "Monumento a la resistencia del pueblo chocoano. Turismo de memoria, paz y comunidad.",
    experiencias: ["Turismo de memoria", "Comunidades afro", "Río Atrato"],
    slug: "bojaya",
    colSpan: "md:col-span-3",
    height: "min-h-[300px]",
  },
];

export function DestinosGrid() {
  return (
    <section id="destinos" className="py-24 px-6 md:px-16 bg-[#020d1a]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sky-400/60 text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          >
            Destinos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700 }}
          >
            Seis destinos.
            <br />
            <span className="text-white/30">Dos océanos. Una selva.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 md:items-start gap-3">
          {DESTINOS.map((d, i) => (
            <motion.a
              key={d.id}
              href={`/mapa?m=${d.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group relative block overflow-hidden rounded-2xl cursor-pointer ${d.colSpan} ${d.height}`}
            >
              {/* Imagen */}
              <img
                src={d.imagen}
                alt={d.nombre}
                className="absolute inset-0 w-full h-full object-cover
                             transition-transform duration-700 group-hover:scale-105"
                style={{ filter: "brightness(0.5) saturate(1.1)" }}
              />

              {/* Overlay oceánico */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(2,13,26,0.9) 0%, rgba(2,13,26,0.2) 50%, transparent 100%)",
                }}
              />

              {/* Badge región — arriba izquierda */}
              <div className="absolute top-4 left-4">
                <span
                  className="text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: `${d.regionColor}20`,
                    color: d.regionColor,
                    border: `1px solid ${d.regionColor}40`,
                  }}
                >
                  {d.region}
                </span>
              </div>

              {/* RNT badge — arriba derecha */}
              <div
                className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm
                                border border-white/10 rounded-full px-3 py-1"
              >
                <span className="text-white/60 text-[10px] font-medium">
                  {d.rnt} RNT
                </span>
              </div>

              {/* Contenido abajo */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <p className="text-white/40 text-xs italic mb-1">{d.tagline}</p>
                <h3
                  className="font-serif text-white font-bold leading-tight mb-3"
                  style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
                >
                  {d.nombre}
                </h3>

                {/* Experiencias como pills — solo en hover o en cards grandes */}
                <div
                  className="flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100
                                  translate-y-2 group-hover:translate-y-0
                                  transition-all duration-300"
                >
                  {d.experiencias.map((exp) => (
                    <span
                      key={exp}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full
                                   bg-white/10 text-white/70"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
