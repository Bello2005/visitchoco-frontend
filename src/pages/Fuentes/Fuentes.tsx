import { MainNav } from "../../components/layout/MainNav";
import { LandingFooter } from "../../components/layout/LandingFooter";
import { useNavigate } from "react-router-dom";
import { DATA_SOURCES } from "../../content/dataSources";

export default function Fuentes() {
  const navigate = useNavigate();

  return (
    <div className="bg-white pb-20 md:pb-0">
      <MainNav onLogin={() => navigate("/login")} />

      <section className="bg-[#f8f6f1] px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-emerald-600 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Transparencia
          </p>
          <h1
            className="font-serif text-gray-900 mb-6"
            style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 700 }}
          >
            Fuentes de datos
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            VisitChocó combina información pública, cartografía y servicios meteorológicos para
            contextualizar el mapa y las secciones temáticas. A continuación, el detalle de cada
            tipo de fuente y su uso en la plataforma.
          </p>
          <p className="text-gray-400 text-xs mt-6">
            Las fechas de actualización dependen de cada proveedor; ante divergencias, prevalecen
            las publicaciones oficiales de las entidades citadas.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-5">
          {DATA_SOURCES.map((src) => (
            <article
              key={src.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                <h2 className="font-serif text-xl font-bold text-gray-900">{src.name}</h2>
                <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wide shrink-0">
                  {src.uso}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{src.detalle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#0a1f0f] px-6 md:px-12 py-14">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/80 text-sm leading-relaxed">
            ¿Viste un dato desactualizado o quieres proponer una fuente adicional? Escribe a través
            de los canales del proyecto o desde el área de{" "}
            <a href="/acerca" className="text-emerald-400 hover:underline">
              Acerca de VisitChocó
            </a>
            .
          </p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
