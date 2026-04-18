const STATS = [
  { value: "31",  label: "Municipios",          detail: "30 con cartografía IGAC"           },
  { value: "125", label: "Resguardos indígenas", detail: "Emberá, Wounaan, Gunadule"         },
  { value: "577", label: "Especies de aves",     detail: "Hotspot global de biodiversidad"   },
  { value: "2",   label: "Costas",               detail: "Pacífico y Caribe"                 },
];

export function StatsStrip() {
  return (
    <section className="bg-[#0a1f0f] py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/10">
        {STATS.map(({ value, label, detail }) => (
          <div key={label} className="flex flex-col gap-1 md:px-10 first:pl-0 last:pr-0">
            <span
              className="text-emerald-400 font-serif leading-none"
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.5rem)", fontWeight: 700 }}
            >
              {value}
            </span>
            <span className="text-white text-sm font-semibold">{label}</span>
            <span className="text-white/40 text-xs">{detail}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
