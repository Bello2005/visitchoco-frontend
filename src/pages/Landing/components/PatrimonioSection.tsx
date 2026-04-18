import { ArrowRight } from "lucide-react";

const PATRIMONIO = [
  {
    titulo: "Fiestas de San Pacho",
    municipio: "Quibdó",
    año: "UNESCO 2012",
    descripcion:
      "Cada septiembre, los doce barrios franciscanos de Quibdó toman la calle. La chirimía, el bunde y la Balsada en el Atrato son resistencia hecha fiesta.",
    href: "/cultura",
    color: "#f59e0b",
    imagen: "/images/municipios/quibdo.jpg",
    objectPosition: "center 18%",
  },
  {
    titulo: "Gualíes, Alabaos y Levantamientos de Tumba",
    municipio: "Medio San Juan",
    año: "PCI Nacional 2012",
    descripcion:
      "La muerte no es el fin. Son nueve noches de cantos corales a capella que guían el alma. El dolor colectivo como acto político de presencia.",
    href: "/cultura",
    color: "#6366f1",
    imagen: "/images/municipios/medio-baudo.jpg",
    objectPosition: "center top",
  },
  {
    titulo: "Saberes de la Partería Afro del Pacífico",
    municipio: "Chocó",
    año: "UNESCO 2015",
    descripcion:
      "Las parteras son guardianas de vida. Sus saberes, transmitidos de generación en generación, sostienen la salud reproductiva de comunidades enteras sin hospitales.",
    href: "/cultura",
    color: "#10b981",
    imagen: "/images/municipios/riosucio.jpg",
    objectPosition: "center top",
  },
] as const;

export function PatrimonioSection() {
  return (
    <section className="bg-[#0d1a0f] py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Patrimonio de la humanidad
          </p>
          <h2
            className="font-serif text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}
          >
            Lo que el mundo ya reconoció.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PATRIMONIO.map(({ titulo, año, descripcion, href, color, imagen, objectPosition }) => (
            <a
              key={titulo}
              href={href}
              className="relative overflow-hidden rounded-2xl group block"
              style={{ height: "360px" }}
            >
              <img
                src={imagen}
                alt={titulo}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                style={{ objectPosition }}
              />

              <div
                className="absolute inset-0 z-[1]"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)",
                }}
              />

              <div
                className="pointer-events-none absolute top-0 left-0 z-[2] h-32 w-[min(100%,22rem)]"
                style={{
                  background:
                    "radial-gradient(ellipse 120% 100% at 0% 0%, rgba(0,0,0,0.5) 0%, transparent 65%)",
                }}
              />

              <div className="absolute top-5 left-5 z-10">
                <span
                  className="inline-block text-[10px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-full text-white bg-black/72 backdrop-blur-sm shadow-md border"
                  style={{ borderColor: `${color}bb` }}
                >
                  {año}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
                <h3
                  className="font-serif text-white font-bold leading-tight mb-3 pr-10"
                  style={{ fontSize: "clamp(1.1rem, 2vw, 1.35rem)" }}
                >
                  {titulo}
                </h3>
                <p className="text-white/60 text-xs leading-relaxed pr-10 md:pr-11">
                  {descripcion}
                </p>
                <div
                  className="absolute bottom-6 right-6 flex items-center justify-center text-white/50 group-hover:text-white/80 transition-colors pointer-events-none"
                  aria-hidden
                >
                  <ArrowRight size={13} />
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
