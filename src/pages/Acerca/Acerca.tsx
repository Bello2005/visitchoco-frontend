import { MainNav } from "../../components/layout/MainNav";
import { LandingFooter } from "../../components/layout/LandingFooter";
import { useNavigate } from "react-router-dom";
import { MapPinned, BookOpen, Landmark } from "lucide-react";

export default function Acerca() {
  const navigate = useNavigate();

  return (
    <div className="bg-white pb-20 md:pb-0">
      <MainNav onLogin={() => navigate("/login")} />

      <section className="bg-[#f8f6f1] px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-emerald-600 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Proyecto
          </p>
          <h1
            className="font-serif text-gray-900 mb-6"
            style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 700 }}
          >
            Acerca de VisitChocó
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Una plataforma para explorar el Chocó con mapa interactivo, datos y narrativas que
            conectan territorio, culturas afro e indígenas, y el río Atrato — el mismo que la
            Corte reconoció como sujeto de derechos.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">Qué es</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              VisitChocó reúne en un solo lugar el mapa vivo del departamento — municipios, clima,
              capas temáticas — junto a entradas temáticas sobre cultura, historia, fauna, turismo
              y fiestas. Está pensada para quien visita el Pacífico, para docentes y estudiantes, y
              para quienes habitan el territorio y quieren verlo representado con rigor y belleza.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">Territorio</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              El Chocó concentra selva húmeda, dos océanos y una frontera con Panamá en{" "}
              <span className="text-gray-800 font-medium">46.530 km²</span> de biodiversidad y
              diversidad cultural. La app no reemplaza la experiencia del territorio: la invita a
              conocerlo con contexto y respeto.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#0d1a0f] px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4 text-center">
            Explorar
          </p>
          <h2
            className="font-serif text-white text-center mb-12"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700 }}
          >
            Tres formas de entrar al mapa
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="/mapa"
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
            >
              <MapPinned className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Mapa interactivo</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Municipios, filtros y capas que se actualizan con los datos disponibles.
              </p>
            </a>
            <a
              href="/cultura"
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
            >
              <Landmark className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Cultura</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Patrimonio UNESCO, PCI y expresiones que definen el Pacífico colombiano.
              </p>
            </a>
            <a
              href="/historia"
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Historia</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Memoria, resistencia y relato territorial desde el departamento.
              </p>
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 text-sm leading-relaxed">
            Construida en <span className="text-gray-900 font-medium">Quibdó</span>, capital del
            Chocó. Los datos y el diseño evolucionan; puedes revisar{" "}
            <a href="/fuentes" className="text-emerald-700 font-medium hover:underline">
              las fuentes
            </a>{" "}
            que sustentan la información mostrada.
          </p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
