import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MainNav } from "../../components/layout/MainNav";
import { LandingFooter } from "../../components/layout/LandingFooter";
import { dur, ease } from "../../lib/motion";
import { cn } from "../../lib/cn";

const CHAPTERS = [
  {
    eyebrow: "1500–1850",
    title: "El río llegó antes que los mapas.",
    body: "El Atrato fue corredor de pueblos Emberá y Wounaan mucho antes de que apareciera en cartografía colonial. Era ruta, despensa, idioma.",
  },
  {
    eyebrow: "Siglo XIX",
    title: "Llegaron quienes lo vieron como oro.",
    body: "Minería de aluvión, deforestación, mercurio. El río que sostenía vida empezó a cargar lo que se le tiraba. La selva no descansaba.",
  },
  {
    eyebrow: "1990–2010",
    title: "Lo que mata no es la corriente.",
    body: "Mercurio, retroexcavadoras, dragas. Comunidades enteras viendo desaparecer fauna, peces, suelo. La justicia ordinaria nunca llegaba a tiempo.",
  },
  {
    eyebrow: "Sentencia T-622 · 2016",
    title: "Y entonces el río se volvió sujeto.",
    body: "La Corte Constitucional declaró al Atrato sujeto de derechos: a la protección, conservación, mantenimiento y restauración. Por primera vez en Colombia, un río podía ser representado en juicio.",
  },
  {
    eyebrow: "Hoy",
    title: "El Atrato sigue hablando.",
    body: "Las comunidades guardianas custodian el cumplimiento de la sentencia. La pelea no terminó, pero el lenguaje cambió: ya no se pide permiso al Estado por el río, se reclama derecho del río.",
  },
];

export default function AtratoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const pathLength = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  return (
    <div className="bg-carbon-950 text-white min-h-screen">
      <MainNav />

      {/* Hero */}
      <section className="relative h-[100dvh] flex items-end px-6 md:px-16 pb-24 grain">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 30% 70%, rgba(26,92,69,0.18) 0%, transparent 60%), linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: dur.slow, ease: ease.out }}
            className="text-eyebrow text-atrato-400 mb-6"
          >
            Sentencia T-622 · 2016
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: dur.slow, ease: ease.out, delay: 0.1 }}
            className="font-display text-display-2xl leading-[0.92]"
          >
            <span className="block">El río que</span>
            <span className="block text-atrato-400">aprendió a hablar</span>
            <span className="block text-white/60">en lengua jurídica.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: dur.slow, delay: 0.4 }}
            className="text-body-lg text-white/50 mt-8 max-w-xl leading-relaxed"
          >
            Una historia en cinco actos sobre el Atrato — corredor ancestral, herida abierta, y primer río colombiano declarado sujeto de derechos.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduce ? { duration: 0 } : { delay: 0.7 }}
            className="mt-12 text-micro font-mono text-white/30 uppercase tracking-[0.18em]"
          >
            Desliza para entrar
          </motion.div>
        </div>
      </section>

      {/* Scrollytelling */}
      <div ref={containerRef} className="relative">
        {/* Línea de río — SVG sticky mientras scrolleas */}
        <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 100 800"
            preserveAspectRatio="xMidYMid meet"
            className="h-[80vh] w-auto opacity-40"
            aria-hidden
          >
            <motion.path
              d="M50 0 Q70 100, 40 200 T60 400 Q30 500, 50 600 T55 800"
              stroke="var(--atrato-400)"
              strokeWidth="0.7"
              fill="none"
              strokeLinecap="round"
              style={{ pathLength: reduce ? 1 : pathLength }}
            />
          </svg>
        </div>

        {/* Capítulos superpuestos */}
        <div className="-mt-[100vh]">
          {CHAPTERS.map((ch, i) => (
            <section
              key={i}
              className={cn(
                "relative min-h-screen flex items-center px-6 md:px-16",
                i % 2 === 0 ? "justify-end" : "justify-start",
              )}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30%" }}
                transition={reduce ? { duration: 0 } : { duration: dur.slow, ease: ease.out }}
                className="max-w-md backdrop-blur-sm bg-carbon-950/40 rounded-2xl p-8 border border-white/[0.06]"
              >
                <p className="text-eyebrow text-atrato-400 mb-3">{ch.eyebrow}</p>
                <h2 className="font-display text-h1 leading-tight mb-5">
                  {ch.title}
                </h2>
                <p className="text-body text-white/60 leading-relaxed">
                  {ch.body}
                </p>
              </motion.div>
            </section>
          ))}
        </div>
      </div>

      {/* Cierre */}
      <section className="px-6 md:px-16 py-32 border-t border-white/[0.06]">
        <div className="max-w-2xl">
          <p className="text-eyebrow text-atrato-400 mb-6">El relato continúa</p>
          <h2 className="font-display text-h1 mb-8">
            Esta no es una historia que se lee.<br />Es un río que se camina.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/mapa"
              className="inline-flex items-center gap-2 rounded-full bg-white text-carbon-950 px-6 py-3 text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Ver el Atrato en el mapa
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 text-white/80 px-6 py-3 text-sm font-medium hover:border-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
