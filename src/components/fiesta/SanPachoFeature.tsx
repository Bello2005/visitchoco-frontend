import { motion } from "framer-motion";

const STATS = [
  { value: "16", unit: "días", sub: "de celebración continua" },
  { value: "13", unit: "barrios", sub: "cada uno con su propio día" },
  { value: "1648", unit: "", sub: "año de origen misionero" },
  { value: "UNESCO", unit: "", sub: "desde 2012 — Patrimonio de la Humanidad" },
];

const PILLS = [
  "Chirimía",
  "Bunde",
  "Disfraz político",
  "Revulú",
  "Balsadas fluviales",
];

const IMG =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=75";

export function SanPachoFeature() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }}
      className="min-h-[80vh] bg-[#0f0800] bg-gradient-to-r from-[#0f0800] via-[#0f0800] to-amber-950/20 py-20 md:py-28"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 md:flex-row md:gap-0 md:px-8 lg:px-12">
        <div className="flex-[0_0_60%] min-w-0 pr-0 md:pr-10">
          <p className="font-mono text-xs uppercase tracking-widest text-amber-500/70">
            Quibdó · 20 Sept — 5 Oct
          </p>
          <h2 className="mt-4 font-serif text-5xl font-bold text-white/90 md:text-7xl">
            San Francisco de Asís
          </h2>
          <p className="mt-2 font-serif text-4xl font-bold text-amber-400 md:text-6xl">
            El San Pacho
          </p>
          <div className="my-8 h-px w-24 bg-amber-800/40" />
          <p className="font-sans text-base font-light leading-relaxed text-white/60">
            Desde 1648, cuando los misioneros franciscanos fundaron Quibdó, la
            fiesta de San Francisco de Asís ha sido el eje sobre el cual gira la
            identidad afrocolombiana del Chocó. Cada 20 de septiembre comienzan
            16 días que el mundo entero reconoce como Patrimonio Cultural
            Inmaterial de la Humanidad.
          </p>
          <p className="mt-6 font-sans text-base font-light leading-relaxed text-white/60">
            Los 13 barrios de Quibdó se turnan para &apos;sacar el santo&apos;:
            balsadas en el río Atrato, procesiones con chirimía, carrozas
            políticas de disfraz, y el &apos;Revulú&apos; — el caos gozoso del
            último día. Fe, protesta y alegría en un mismo rito.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-px border border-amber-900/40 bg-amber-900/40">
            {STATS.map((s) => (
              <div
                key={s.value + s.sub}
                className="bg-[#0f0800] p-4 md:p-5"
              >
                <p className="font-mono text-2xl font-bold text-amber-400 md:text-3xl">
                  {s.value}
                  {s.unit ? (
                    <span className="text-lg text-white/40"> {s.unit}</span>
                  ) : null}
                </p>
                <p className="mt-1 font-sans text-xs font-light text-white/45">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {PILLS.map((p) => (
              <span
                key={p}
                className="rounded-full border border-amber-700/40 bg-amber-900/40 px-3 py-1 text-xs text-amber-300"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="relative min-h-[320px] flex-[0_0_40%] overflow-hidden rounded-2xl md:min-h-[560px]">
          <img
            src={IMG}
            alt="Celebración nocturna"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0800] via-transparent to-transparent" />
        </div>
      </div>
    </motion.section>
  );
}
