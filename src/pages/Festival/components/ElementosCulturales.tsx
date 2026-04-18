import { motion } from "framer-motion";

const elementos = [
  {
    nombre: "La Chirimía",
    tipo: "Conjunto musical",
    descripcion:
      "El sonido que define al Chocó. Ocho músicos: dos clarinetes, dos bombardinos, dos platillos, caja y bombo. Sonó en el primer San Pacho y no ha parado desde 1648.",
    detalle:
      "Presente en: Quibdó, Bagadó, Istmina, Condoto, Cértegui, Nuquí, Río Quito, Atrato",
    simbolo: "🎵",
    color: "amber",
  },
  {
    nombre: "El Bunde",
    tipo: "Canto y danza",
    descripcion:
      "Mezcla de canción de cuna y música festiva. En el Chocó es el lenguaje emocional de las celebraciones colectivas — se canta con algarabía, con el cuerpo entero.",
    detalle:
      "Presente en: Quibdó, Bagadó, Istmina, Cértegui, Atrato",
    simbolo: "🥁",
    color: "orange",
  },
  {
    nombre: "Los Alabaos",
    tipo: "Canto fúnebre ritual",
    descripcion:
      "Cantos a cappella interpretados por mujeres en velorios y novenarios. Patrimonio Cultural Inmaterial de la Humanidad. En el Chocó la muerte se canta, no solo se llora.",
    detalle:
      "Presente en: Lloró, Bojayá, Tadó, Medio San Juan, San José del Palmar",
    simbolo: "🎶",
    color: "blue",
  },
  {
    nombre: "El Tamborito",
    tipo: "Danza ancestral",
    descripcion:
      "Llegó con los ancestros desde Panamá hasta las costas del Pacífico Norte. Una danza lateral 'coqueta' de intercambio entre hombre y mujer. Nuquí lo guarda y lo celebra cada enero.",
    detalle:
      "Presente en: Nuquí, Bahía Solano, Juradó (Pacífico Norte)",
    simbolo: "💃",
    color: "purple",
  },
] as const;

const colorMap: Record<string, string> = {
  amber: "text-amber-500/80",
  orange: "text-orange-400/80",
  blue: "text-blue-400/80",
  purple: "text-purple-400/80",
};

export function ElementosCulturales() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#080400] py-32"
    >
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <header className="mb-20 text-center md:mb-28">
          <p className="font-mono text-xs uppercase tracking-widest text-amber-500/50">
            Alma musical del Chocó
          </p>
          <h2 className="mt-4 font-serif text-5xl font-bold text-white/90">
            Cuatro voces que nunca callan
          </h2>
        </header>

        <div>
          {elementos.map((el, i) => {
            const num = String(i + 1).padStart(2, "0");
            const textColor = colorMap[el.color] ?? "text-amber-500/80";
            const isOdd = i % 2 === 0;

            return (
              <div
                key={el.nombre}
                className={`relative border-b border-amber-900/30 py-16 last:border-0 md:py-24 ${
                  isOdd ? "" : ""
                }`}
              >
                <div
                  className={`relative flex flex-col gap-10 md:flex-row md:items-start md:gap-16 ${
                    isOdd ? "" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="relative min-w-0 flex-1 md:max-w-xl">
                    <p
                      className={`text-xs font-semibold uppercase tracking-widest ${textColor}`}
                    >
                      {el.tipo}
                    </p>
                    <h3 className="mt-2 font-serif text-4xl font-bold text-white/90">
                      {el.nombre}
                    </h3>
                    <p className="mt-4 font-sans text-base font-light leading-relaxed text-white/60">
                      {el.descripcion}
                    </p>
                    <details className="mt-6 group">
                      <summary className="cursor-pointer font-mono text-xs text-amber-500/70 marker:text-amber-600">
                        Dónde suena
                      </summary>
                      <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/40">
                        {el.detalle}
                      </p>
                    </details>
                  </div>

                  <div className="relative hidden min-h-[200px] flex-1 select-none md:block">
                    <span
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 font-mono text-[8rem] font-bold leading-none text-white/[0.05] md:text-[12rem]"
                      aria-hidden
                    >
                      {num}
                    </span>
                    <span
                      className="absolute bottom-0 right-4 text-6xl opacity-20 md:text-7xl"
                      aria-hidden
                    >
                      {el.simbolo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
