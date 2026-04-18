import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinned, ArrowRight } from "lucide-react";

type HeroSlide = {
  src: string;
  alt: string;
  /** Línea pequeña encima del titular — encaja con el tema de la foto */
  eyebrow: string;
  /** Siempre dos líneas — simetría visual entre slides */
  titleLines: [string, string];
  /** Párrafo breve con dato o contexto real */
  subtitle: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/images/hero/pexels-daniloarenash-18868239.jpg",
    alt: "Puerto y embarcaciones en el río Atrato, Chocó",
    eyebrow: "Chocó, Colombia",
    titleLines: ["El río que le dio", "derechos a un pueblo."],
    subtitle:
      "46.530 km² donde la selva, las comunidades afro e indígenas, y el río Atrato escriben una historia que el mundo necesita conocer.",
  },
  {
    src: "/images/hero/FORGOTTEN_BOAT_AT_BEACH_2_NUQUI_CHOCO_COLOMBIA.jpg",
    alt: "Costa del Pacífico en Nuquí, canoa y mar",
    eyebrow: "Nuquí · Costa Pacífica",
    titleLines: ["Mar abierto,", "arena negra viva."],
    subtitle:
      "Nuquí concentra playas de arena negra, ballenas jorobadas (temporada) y selva pluvial hasta la orilla — uno de los rostros más emblemáticos del departamento.",
  },
  {
    src: "/images/hero/AGC_20250826_175454037.jpg",
    alt: "Quibdó, vida urbana en el departamento",
    eyebrow: "Quibdó · Capital",
    titleLines: ["La ciudad del Atrato,", "institución y calle."],
    subtitle:
      "Centro urbano y departamental del Chocó: sede de gobierno, cultura y economía sobre el valle del río Atrato, con el ritmo cotidiano del Pacífico colombiano.",
  },
  {
    src: "/images/hero/MVIMG_20250827_181611.jpg",
    alt: "Costa y territorio del Chocó",
    eyebrow: "Pacífico colombiano",
    titleLines: ["Islas y selva:", "el mar en mil verdes."],
    subtitle:
      "El litoral chocoano combina archipiélagos, manglares y costa oceánica — frontera natural entre el continente y una de las biodiversidades más densas del planeta.",
  },
  {
    src: "/images/hero/IMG_20260308_200539.jpg",
    alt: "Tadó de noche, cultura y calle",
    eyebrow: "Tadó · San Juan",
    titleLines: ["La noche en el San Juan", "también es biodiversidad."],
    subtitle:
      "Municipio del interior: el arte urbano y la vida nocturna dialogan con el territorio — aquí un jaguar en la pared recuerda que el Chocó es cultura y fauna a la vez.",
  },
];

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = HERO_SLIDES[activeIndex];

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ height: "100dvh", minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      <link rel="preload" as="image" href={HERO_SLIDES[0].src} />
      {/* Fotos rotando — crossfade */}
      {HERO_SLIDES.map(({ src, alt }, i) => (
        <img
          key={src}
          src={src}
          alt={alt}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === activeIndex ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
            zIndex: 0,
          }}
        />
      ))}

      {/* Gradiente base — de abajo hacia arriba */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.08) 100%)",
        }}
      />
      {/* Gradiente lateral — refuerza legibilidad del texto izquierdo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 65%)",
        }}
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-20 right-6 z-20 md:top-24 md:right-16 flex items-center gap-2
                   bg-black/50 backdrop-blur-sm border border-white/20 text-white
                   px-4 py-2 rounded-full max-w-[calc(100vw-3rem)]"
      >
        <MapPinned size={12} className="text-white/80" />
        <span className="text-white text-xs font-semibold tracking-wider uppercase">
          Patrimonio UNESCO · Hotspot Global de Biodiversidad
        </span>
      </motion.div>

      {/* Contenido — abajo izquierda */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
        className="px-6 md:px-16 pb-16 md:pb-20"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-emerald-300 text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              {active.eyebrow}
            </p>
            <h1
              className="text-white font-serif leading-[1.02] mb-6 w-full max-w-[min(20ch,92vw)]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 700 }}
            >
              <span className="block">{active.titleLines[0]}</span>
              <span className="block">{active.titleLines[1]}</span>
            </h1>
            <p className="text-white/70 text-base md:text-lg mb-10 max-w-[min(36rem,92vw)] leading-[1.75]">
              {active.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-4 flex-wrap mb-8">
          <a
            href="/mapa"
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white
                       px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200
                       shadow-lg shadow-emerald-900/30"
          >
            <MapPinned size={16} />
            Explorar el mapa
          </a>
          <a
            href="/historia"
            className="flex items-center gap-2 text-white/80 hover:text-white
                       border border-white/30 hover:border-white/60
                       px-7 py-3.5 rounded-full text-sm font-medium transition-all duration-200
                       backdrop-blur-sm"
          >
            Conocer la historia
            <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Indicadores de foto */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
        className="flex items-center gap-2"
      >
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-500 ${
              i === activeIndex
                ? "w-10 h-1 bg-white"
                : "w-2 h-2 bg-white/35 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
