import { motion } from "framer-motion";

type TagColor = "blue" | "emerald" | "purple" | "amber" | "orange";

const TAG_RING: Record<TagColor, string> = {
  blue: "ring-blue-400/40 bg-blue-950/50 text-blue-200",
  emerald: "ring-emerald-400/40 bg-emerald-950/50 text-emerald-200",
  purple: "ring-purple-400/40 bg-purple-950/50 text-purple-200",
  amber: "ring-amber-400/40 bg-amber-950/50 text-amber-200",
  orange: "ring-orange-400/40 bg-orange-950/50 text-orange-200",
};

const SUB_BADGE: Record<string, string> = {
  Atrato: "border-amber-500/50 bg-amber-900/40 text-amber-300",
  "San Juan": "border-emerald-500/50 bg-emerald-900/40 text-emerald-300",
  "Pacífico Norte":
    "border-purple-500/50 bg-purple-900/40 text-purple-300",
  Baudó: "border-blue-500/50 bg-blue-900/40 text-blue-300",
  Darién: "border-orange-500/50 bg-orange-900/40 text-orange-300",
};

const fiestasDestacadas = [
  {
    nombre: "San Pacho",
    municipio: "Quibdó",
    fechas: "20 sept — 5 oct",
    subregion: "Atrato",
    tag: "UNESCO",
    tagColor: "blue" as TagColor,
    descripcion:
      "16 días donde 13 barrios compiten en fe, disfraz y chirimía. El corazón del Chocó late más fuerte.",
    elementosCulturales: ["Chirimía", "Bunde", "Revulú"],
    imagen:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=700&q=75",
    size: "large" as const,
  },
  {
    nombre: "Fiestas del Chontaduro",
    municipio: "San José del Palmar",
    fechas: "8 — 15 Agosto",
    subregion: "San Juan",
    tag: "Único",
    tagColor: "emerald" as TagColor,
    descripcion:
      "El fruto sagrado Emberá como protagonista. Carros de balineras, reinado y encuentro de saberes ancestrales.",
    elementosCulturales: ["Reinado del Chontaduro", "Saberes Emberá", "Alabaos"],
    imagen:
      "https://images.unsplash.com/photo-1541795795328-f073b763494e?w=700&q=75",
    size: "medium" as const,
  },
  {
    nombre: "Fiesta del Tamborito",
    municipio: "Nuquí",
    fechas: "5 — 7 Enero",
    subregion: "Pacífico Norte",
    tag: "Herencia panameña",
    tagColor: "purple" as TagColor,
    descripcion:
      "La danza coqueta que llegó con los ancestros desde Panamá. Trajes tradicionales, concurso de danza.",
    elementosCulturales: ["Tamborito", "Chirimía costera"],
    imagen:
      "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=700&q=75",
    size: "medium" as const,
  },
  {
    nombre: "Divino Ecce-Homo",
    municipio: "Unión Panamericana",
    fechas: "24 Abr — 1 May",
    subregion: "San Juan",
    tag: "Milagro de 1802",
    tagColor: "amber" as TagColor,
    descripcion:
      "Una imagen hallada por una esclavizada en Popana. Peregrinación masiva y 'mandas': promesas de dar vueltas al pueblo.",
    elementosCulturales: ["Placas de agradecimiento", "Santuario de Raspadura"],
    imagen:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700&q=75",
    size: "small" as const,
  },
  {
    nombre: "Festival de la Bahía",
    municipio: "Bahía Solano",
    fechas: "Agosto",
    subregion: "Pacífico Norte",
    tag: "Biodiversidad marina",
    tagColor: "blue" as TagColor,
    descripcion:
      "La meca del Pacífico celebra el mar, las ballenas y la cultura local. Tamborito de herencia panameña.",
    elementosCulturales: ["Tamborito", "Biodiversidad"],
    imagen:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75",
    size: "small" as const,
  },
  {
    nombre: "Festival del Bocachico",
    municipio: "Unguía",
    fechas: "Anual",
    subregion: "Darién",
    tag: "Único en Colombia",
    tagColor: "orange" as TagColor,
    descripcion:
      "El pez sagrado de las ciénagas del Darién como protagonista. Danzas de Marriaga: 'caderas sin control'.",
    elementosCulturales: ["Molas Gunadule", "Danzas de Marriaga"],
    imagen:
      "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=700&q=75",
    size: "small" as const,
  },
  {
    nombre: "Virgen de la Pobreza",
    municipio: "Tadó",
    fechas: "30 Ago — 8 Sept",
    subregion: "San Juan",
    tag: "Aparición milagrosa",
    tagColor: "amber" as TagColor,
    descripcion:
      "La virgen que se apareció a una lavandera llamada 'Pobreza'. Altares barriales y el legado del Rey Barule.",
    elementosCulturales: ["Alabaos", "Cantaoras tradicionales", "Legado Rey Barule"],
    imagen:
      "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=700&q=75",
    size: "small" as const,
  },
  {
    nombre: "India Sivirá",
    municipio: "Bajo Baudó (Pizarro)",
    fechas: "16 de Julio",
    subregion: "Baudó",
    tag: "Afro-indígena",
    tagColor: "emerald" as TagColor,
    descripcion:
      "La patrona ancestral de las comunidades Sivirú. Balsadas, cantos de mar, avistamiento de ballenas y delfines.",
    elementosCulturales: ["Cantos de mar", "Balsadas", "Ballenas"],
    imagen:
      "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=700&q=75",
    size: "small" as const,
  },
];

function gridPlacement(index: number): string {
  switch (index) {
    case 0:
      return "md:col-span-7 md:row-span-2 md:col-start-1 md:row-start-1 min-h-[280px] md:min-h-[520px]";
    case 1:
      return "md:col-span-5 md:col-start-8 md:row-start-1 min-h-[240px] md:min-h-[260px]";
    case 2:
      return "md:col-span-5 md:col-start-8 md:row-start-2 min-h-[240px] md:min-h-[260px]";
    case 3:
      return "md:col-span-3 md:col-start-1 md:row-start-3 min-h-[220px] md:min-h-[260px]";
    case 4:
      return "md:col-span-3 md:col-start-4 md:row-start-3 min-h-[220px] md:min-h-[260px]";
    case 5:
      return "md:col-span-3 md:col-start-7 md:row-start-3 min-h-[220px] md:min-h-[260px]";
    case 6:
      return "md:col-span-3 md:col-start-10 md:row-start-3 min-h-[220px] md:min-h-[260px]";
    case 7:
      return "md:col-span-12 md:col-start-1 md:row-start-4 min-h-[220px] md:min-h-[280px]";
    default:
      return "";
  }
}

export function FiestasGrid() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0c0800] py-20 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-amber-500/50">
          Ocho joyas del calendario
        </p>
        <h2 className="mt-3 font-serif text-4xl font-bold text-white/90 md:text-5xl">
          Donde el Chocó se vuelve puro sentido
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-12 md:auto-rows-auto">
          {fiestasDestacadas.map((f, index) => (
            <motion.article
              key={f.nombre}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                delay: index * 0.06,
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl ring-1 ring-transparent transition-all hover:ring-amber-500/30 ${gridPlacement(index)}`}
            >
              <img
                src={f.imagen}
                alt={f.nombre}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0800]/90 via-[#0c0800]/35 to-transparent transition-colors group-hover:from-[#0c0800]/95" />

              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${SUB_BADGE[f.subregion] ?? SUB_BADGE.Atrato}`}
                  >
                    {f.subregion}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${TAG_RING[f.tagColor]}`}
                  >
                    {f.tag}
                  </span>
                </div>

                <h3
                  className={`mt-3 font-serif font-bold text-white ${
                    f.size === "large"
                      ? "text-3xl md:text-4xl"
                      : f.size === "medium"
                        ? "text-2xl md:text-3xl"
                        : "text-xl md:text-2xl"
                  }`}
                >
                  {f.nombre}
                </h3>
                <p className="mt-1 font-mono text-[10px] text-amber-500/80 md:text-xs">
                  {f.municipio} · {f.fechas}
                </p>

                <div className="mt-3 overflow-hidden">
                  <div className="max-h-0 translate-y-2 opacity-0 transition-all duration-500 ease-out group-hover:max-h-[240px] group-hover:translate-y-0 group-hover:opacity-100 md:group-hover:max-h-[280px]">
                    <p className="font-sans text-sm font-light leading-relaxed text-white/85">
                      {f.descripcion}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {f.elementosCulturales.map((el) => (
                        <span
                          key={el}
                          className="rounded-full border border-amber-700/40 bg-amber-900/50 px-2 py-0.5 text-[10px] text-amber-200/90"
                        >
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
