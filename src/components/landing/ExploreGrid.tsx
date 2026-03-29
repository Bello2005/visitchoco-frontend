import { ArrowRight } from "lucide-react";

const CARDS = [
  {
    id: "mapa",
    category: "Interactivo",
    title: "El mapa vivo del Chocó",
    description: "31 municipios. Clima en tiempo real. Datos del DANE.",
    href: "/mapa",
    image: "/images/municipios/quibdo.jpg",
    accent: "#10b981",
    /** Encuadre Quibdó: bajar un poco el punto focal */
    imageObjectPosition: "center 18%",
  },
  {
    id: "cultura",
    category: "UNESCO · PCI",
    title: "Cultura viva",
    description: "San Pacho, Alabaos y la Partería Afro del Pacífico.",
    href: "/cultura",
    image: "/images/municipios/tado.jpg",
    accent: "#f59e0b",
    /** Desde la parte superior de la foto hacia abajo */
    imageObjectPosition: "center top",
  },
  {
    id: "fauna",
    category: "Biodiversidad",
    title: "Fauna del Chocó",
    description: "577 especies de aves. Ballenas jorobadas. Jaguares.",
    href: "/animales",
    image: "/images/municipios/nuqui.jpg",
    accent: "#6366f1",
  },
  {
    id: "historia",
    category: "Memoria",
    title: "Historia y resistencia",
    description: "Del cimarronaje de Barule a Diego Luis Córdoba.",
    href: "/historia",
    image: "/images/municipios/bojaya.jpg",
    accent: "#ef4444",
  },
  {
    id: "turismo",
    category: "Destinos",
    title: "Turismo",
    description: "128 prestadores RNT. Playa, selva y río.",
    href: "/turismo",
    image: "/images/municipios/bahia-solano.jpg",
    accent: "#0ea5e9",
  },
  {
    id: "fiestas",
    category: "Calendario",
    title: "Fiestas patronales",
    description: "37 fiestas documentadas. La fiesta es resistencia.",
    href: "/fiesta",
    image: "/images/municipios/condoto.jpg",
    accent: "#ec4899",
  },
] as const;

function ExploreCard({
  category,
  title,
  description,
  href,
  image,
  accent,
  className = "",
  imageObjectPosition,
}: {
  category: string;
  title: string;
  description: string;
  href: string;
  image: string;
  accent: string;
  className?: string;
  /** object-position CSS (ej. center 8%) para encuadrar mejor la foto */
  imageObjectPosition?: string;
}) {
  return (
    <a
      href={href}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group block ${className}`}
    >
      {/* Imagen */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
        style={imageObjectPosition ? { objectPosition: imageObjectPosition } : undefined}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)",
        }}
      />

      {/* Sombreado esquina superior izquierda — ayuda al badge sobre fotos claras */}
      <div
        className="pointer-events-none absolute top-0 left-0 z-[2] h-32 w-[min(100%,22rem)]"
        style={{
          background: "radial-gradient(ellipse 120% 100% at 0% 0%, rgba(0,0,0,0.5) 0%, transparent 65%)",
        }}
      />

      {/* Categoría — texto blanco sobre fondo oscuro + borde acento (legible en cualquier foto) */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className="inline-block text-[10px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-full text-white bg-black/72 backdrop-blur-sm shadow-md border"
          style={{ borderColor: `${accent}bb` }}
        >
          {category}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
        <h3
          className="font-serif text-white font-bold leading-tight mb-1 pr-10"
          style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
        >
          {title}
        </h3>
        <p className="text-white/60 text-xs hidden md:block leading-relaxed pr-10 md:pr-11">
          {description}
        </p>
        <div
          className="absolute bottom-5 right-5 flex items-center justify-center text-white/50 group-hover:text-white/80 transition-colors pointer-events-none"
          aria-hidden
        >
          <ArrowRight size={13} />
        </div>
      </div>
    </a>
  );
}

export function ExploreGrid() {
  return (
    <section className="px-6 md:px-12 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-emerald-600 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Descubre el territorio
          </p>
          <h2
            className="font-serif text-gray-900 leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}
          >
            Seis entradas.<br />Un solo territorio.
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-3">
          {/* MAPA — cols 1–6, filas 1–2 */}
          <div
            className="col-span-12 md:col-span-6 md:col-start-1 md:row-start-1 md:row-span-2"
            style={{ minHeight: 460 }}
          >
            <ExploreCard {...CARDS[0]} className="h-full" />
          </div>

          {/* CULTURA — cols 7–12, fila 1 */}
          <div
            className="col-span-12 md:col-span-6 md:col-start-7 md:row-start-1"
            style={{ minHeight: 220 }}
          >
            <ExploreCard {...CARDS[1]} className="h-full" />
          </div>

          {/* FAUNA — cols 7–9, fila 2 */}
          <div
            className="col-span-6 md:col-span-3 md:col-start-7 md:row-start-2"
            style={{ minHeight: 220 }}
          >
            <ExploreCard {...CARDS[2]} className="h-full" />
          </div>

          {/* HISTORIA — cols 10–12, fila 2 */}
          <div
            className="col-span-6 md:col-span-3 md:col-start-10 md:row-start-2"
            style={{ minHeight: 220 }}
          >
            <ExploreCard {...CARDS[3]} className="h-full" />
          </div>

          {/* TURISMO + FIESTAS — misma fila, 6+6 cols, misma altura (Fiestas iguala a Turismo) */}
          <div
            className="col-span-12 md:col-span-6 md:col-start-1 md:row-start-3"
            style={{ minHeight: 180 }}
          >
            <ExploreCard {...CARDS[4]} className="h-full" />
          </div>

          <div
            className="col-span-12 md:col-span-6 md:col-start-7 md:row-start-3"
            style={{ minHeight: 180 }}
          >
            <ExploreCard {...CARDS[5]} className="h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
