import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FEATURED = [
  { name: "Quibdó",       zone: "Zona Urbana del Atrato", rnt: 128, slug: "quibdo",       img: "/images/municipios/quibdo.jpg"       },
  { name: "Nuquí",        zone: "Costa Pacífica",         rnt: 152, slug: "nuqui",        img: "/images/municipios/nuqui.jpg"        },
  { name: "Bahía Solano", zone: "Costa Pacífica",         rnt: 111, slug: "bahia-solano", img: "/images/municipios/bahia-solano.jpg" },
  { name: "Acandí",       zone: "Costa Caribe",           rnt: 153, slug: "acandi",       img: "/images/municipios/acandi.jpg"       },
  { name: "Tadó",         zone: "San Juan",               rnt: 42,  slug: "tado",         img: "/images/municipios/tado.jpg"         },
  { name: "Bojayá",       zone: "Medio Atrato",           rnt: 18,  slug: "bojaya",       img: "/images/municipios/bojaya.jpg"       },
  { name: "Riosucio",     zone: "Zona Norte",             rnt: 31,  slug: "riosucio",     img: "/images/municipios/riosucio.jpg"     },
  { name: "Condoto",      zone: "San Juan",               rnt: 45,  slug: "condoto",      img: "/images/municipios/condoto.jpg"      },
];

export function MunicipiosCarousel() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 px-6 md:px-12">
        <div>
          <p className="text-emerald-600 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            31 municipios
          </p>
          <h2 className="font-serif text-gray-900 text-3xl md:text-4xl font-bold">
            Cada uno, un mundo.
          </h2>
        </div>
        <a
          href="/mapa"
          className="text-sm font-semibold text-gray-500 hover:text-emerald-600
                     flex items-center gap-1 transition-colors whitespace-nowrap"
        >
          Ver todos <ArrowRight size={14} />
        </a>
      </div>

      {/* Scroll container */}
      <div
        className="flex gap-4 overflow-x-auto px-6 md:px-12 pb-4"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {FEATURED.map(({ name, zone, rnt, slug, img }) => (
          <button
            key={slug}
            onClick={() => navigate(`/mapa?m=${slug}`)}
            className="flex-shrink-0 relative overflow-hidden rounded-2xl group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            style={{ width: 260, height: 360 }}
          >
            {/* Imagen */}
            <img
              src={img}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500
                         grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.03]"
            />

            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%)",
              }}
            />

            {/* Footer de card */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10 px-4 py-3
                         bg-white/95 backdrop-blur-sm flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-base truncate leading-tight">
                  {name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {zone}
                  <span className="text-emerald-600 font-medium"> · {rnt} prestadores</span>
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 group-hover:text-emerald-600 flex-shrink-0 ml-2 transition-colors"
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
