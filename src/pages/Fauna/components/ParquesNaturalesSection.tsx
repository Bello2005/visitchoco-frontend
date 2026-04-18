import { motion } from "framer-motion";
import { Waves, TreePine, Mountain, Compass, type LucideIcon } from "lucide-react";
import { parquesNaturales } from "../../../content/faunaData";

const icons: LucideIcon[] = [Waves, TreePine, Mountain, Compass];

export function ParquesNaturalesSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#010d05] py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-14 text-center md:mb-16">
          <p className="font-sans text-xs uppercase tracking-widest text-emerald-500/70">
            Áreas Protegidas
          </p>
          <h2 className="font-serif mt-3 text-4xl font-bold text-white">
            Cuatro Santuarios del Mundo Natural
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {parquesNaturales.map((p, index) => {
            const Icon = icons[index] ?? Compass;
            return (
              <motion.article
                key={p.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
                className="group rounded-2xl border border-emerald-900/40 bg-[#0a1f10]/60 p-6 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] md:p-8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-800/40 bg-emerald-950/50 text-emerald-400">
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </div>
                  {p.esUNESCO && (
                    <span className="font-sans rounded-full bg-blue-900/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-300">
                      UNESCO
                    </span>
                  )}
                </div>

                <h3 className="font-serif mt-5 text-xl font-bold text-white md:text-2xl">
                  {p.nombre}
                </h3>
                <p className="font-sans mt-2 text-sm leading-relaxed text-white/70">
                  {p.tagline}
                </p>

                <p className="font-mono mt-6 text-3xl font-bold text-emerald-400">
                  {p.hectareas.toLocaleString("es-CO")}{" "}
                  <span className="font-sans text-sm font-normal text-emerald-500/80">ha</span>
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
