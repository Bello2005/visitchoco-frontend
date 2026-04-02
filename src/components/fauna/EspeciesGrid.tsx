import { motion } from "framer-motion";
import { especiesBento } from "../../content/faunaData";

function badgeClasses(estado: string): string {
  const e = estado.toLowerCase();
  if (e.includes("crítico") || e.includes("critico")) {
    return "border border-red-700 bg-red-900/60 text-red-300";
  }
  if (e.includes("peligro")) {
    return "border border-red-700/80 bg-red-900/50 text-red-200";
  }
  if (e.includes("vulnerable")) {
    return "border border-amber-700/50 bg-amber-900/60 text-amber-300";
  }
  if (e.includes("menor")) {
    return "border border-emerald-700/50 bg-emerald-900/60 text-emerald-300";
  }
  return "border border-emerald-800/50 bg-emerald-900/50 text-emerald-200/90";
}

const colSpan: Record<number, string> = {
  3: "lg:col-span-3",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
};
const rowSpan: Record<number, string> = {
  1: "lg:row-span-1",
  2: "lg:row-span-2",
};

export function EspeciesGrid() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#010d05] py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="font-serif mb-10 text-center text-3xl font-bold text-white md:mb-14 md:text-4xl">
          Especies icónicas del Chocó
        </h2>

        <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-12 lg:gap-3">
          {especiesBento.map((esp, index) => (
            <motion.article
              key={esp.nombre}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              className={`group relative min-h-[220px] overflow-hidden rounded-2xl border border-emerald-900/40 sm:min-h-[200px] ${colSpan[esp.colSpan] ?? ""} ${rowSpan[esp.rowSpan] ?? ""}`}
            >
              <img
                src={esp.imageUrl}
                alt={`${esp.nombre} (${esp.nombreCientifico}) en hábitat natural`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#010d05]/90 via-[#010d05]/25 to-transparent transition-opacity duration-500 ease-out group-hover:from-[#010d05]/40 group-hover:via-[#010d05]/15 group-hover:to-transparent" />

              <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/80 opacity-80 transition-opacity duration-500 group-hover:opacity-100">
                  {esp.nombreCientifico}
                </p>
                <h3 className="font-serif mt-1 text-2xl font-bold leading-tight text-white md:text-3xl">
                  {esp.nombre}
                </h3>

                <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:max-h-48 group-hover:opacity-100">
                  <span
                    className={`font-sans mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${badgeClasses(esp.estadoConservacion)}`}
                  >
                    {esp.estadoConservacion}
                  </span>
                  <p className="font-sans mt-2 max-w-prose text-sm leading-relaxed text-white/90">
                    {esp.descripcion}
                  </p>
                  <p className="font-sans mt-1 text-xs text-emerald-300/80">{esp.habitat}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
