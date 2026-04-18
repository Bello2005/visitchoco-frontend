import { useMemo } from "react";
import { motion } from "framer-motion";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

type RowSpec = {
  label: string;
  active: (monthIndex: number) => boolean;
  accent: string;
  peakMonth: number;
};

const rows: RowSpec[] = [
  {
    label: "Ballenas jorobadas",
    active: (m) => m >= 6 && m <= 9,
    accent: "amber",
    peakMonth: 7,
  },
  {
    label: "Tortugas baula",
    active: (m) => m >= 8 && m <= 11,
    accent: "teal",
    peakMonth: 10,
  },
  {
    label: "Aves migratorias",
    active: (m) => m >= 10 || m <= 2,
    accent: "sky",
    peakMonth: 0,
  },
  {
    label: "Nidificación de aves",
    active: (m) => m >= 2 && m <= 5,
    accent: "emerald",
    peakMonth: 4,
  },
];

function cellAccentClasses(accent: string, active: boolean): string {
  if (!active) return "bg-white/5 border border-white/5";
  switch (accent) {
    case "amber":
      return "bg-amber-500/20 border border-amber-500/30";
    case "teal":
      return "bg-teal-500/20 border border-teal-500/30";
    case "sky":
      return "bg-sky-500/20 border border-sky-500/30";
    default:
      return "bg-emerald-500/20 border border-emerald-500/30";
  }
}

export function TemporadasFaunaSection() {
  const delayByKey = useMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    rows.forEach((row, ri) => {
      MONTHS.forEach((_, mi) => {
        if (row.active(mi)) {
          map.set(`${ri}-${mi}`, n * 0.03);
          n += 1;
        }
      });
    });
    return map;
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden bg-emerald-950/50 py-24 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <h2 className="font-serif mb-10 text-3xl font-bold text-white md:mb-14">
          Cuándo ver cada maravilla
        </h2>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[720px] md:min-w-0">
            <div
              className="grid gap-x-1 gap-y-3"
              style={{
                gridTemplateColumns: `minmax(150px,1.4fr) repeat(12, minmax(0,1fr))`,
              }}
            >
              <div />
              {MONTHS.map((m) => (
                <div
                  key={m}
                  className="font-sans pb-2 text-center text-xs uppercase tracking-wider text-white/40"
                >
                  {m}
                </div>
              ))}

              {rows.map((row, ri) => (
                <div key={row.label} className="contents">
                  <div className="font-sans flex items-center py-1 text-sm text-white/85">
                    {row.label}
                  </div>
                  {MONTHS.map((_, mi) => {
                    const active = row.active(mi);
                    const delay = delayByKey.get(`${ri}-${mi}`) ?? 0;
                    const showPeak = active && mi === row.peakMonth;
                    const cell = (
                      <div
                        className={`h-9 rounded-md ${cellAccentClasses(row.accent, active)}`}
                      />
                    );

                    return (
                      <div key={`${row.label}-${mi}`} className="relative flex items-center justify-center p-0.5">
                        {active ? (
                          <motion.div
                            className="h-full w-full"
                            initial={{ opacity: 0, scale: 0.92 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{
                              delay,
                              duration: 0.35,
                              ease: "easeOut",
                            }}
                          >
                            {cell}
                          </motion.div>
                        ) : (
                          cell
                        )}
                        {showPeak && (
                          <span className="absolute -top-1 left-0 right-0 z-10 mx-auto flex w-max max-w-[min(100%,96px)] justify-center rounded-full border border-emerald-500/40 bg-[#0a1f10]/90 px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-wide text-emerald-300 shadow-sm">
                            Mejor época
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
