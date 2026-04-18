import { useEffect, useRef, useState } from "react";
import { animate, useInView, motion } from "framer-motion";
import { biodiversityStripStats } from "../../../content/faunaData";

function AnimatedStatValue({
  value,
  prefix,
  started,
}: {
  value: number;
  prefix: string;
  started: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!started) return;
    const controls = animate(0, value, {
      duration: 1.35,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [started, value]);

  return (
    <span className="font-mono">
      {prefix}
      {display.toLocaleString("es-CO")}
    </span>
  );
}

export function BiodiversityStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative border-t border-emerald-800/50 bg-emerald-950 py-14 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-0 md:divide-x md:divide-emerald-700/30">
          {biodiversityStripStats.map(({ value, label, prefix }) => (
            <div
              key={label}
              className="flex flex-col gap-2 px-0 text-center md:px-6 md:first:pl-0 md:last:pr-0"
            >
              <span className="font-mono text-4xl font-bold text-emerald-300">
                <AnimatedStatValue
                  value={value}
                  prefix={prefix}
                  started={isInView}
                />
              </span>
              <span className="font-sans text-xs uppercase tracking-widest text-emerald-500">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
