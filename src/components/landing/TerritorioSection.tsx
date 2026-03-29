import { ArrowRight } from "lucide-react";

const FIGURES = [
  { figure: "82%",   text: "de la población es afrocolombiana",              source: "DANE 2018"                     },
  { figure: "46.530",text: "km² de territorio departamental",                 source: "IGAC"                          },
  { figure: "T-622", text: "el río Atrato como sujeto de derechos",           source: "Corte Constitucional, 2016"    },
  { figure: "2012",  text: "San Pacho declarado Patrimonio de la Humanidad",  source: "UNESCO"                        },
];

export function TerritorioSection() {
  return (
    <section className="bg-[#f8f6f1] py-24 px-6 md:px-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">

        {/* Columna izquierda — texto editorial */}
        <div>
          <p className="text-emerald-700 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            El territorio
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            El único departamento de Colombia con dos océanos y frontera con Panamá.
          </h2>
          <div className="space-y-4 text-gray-600 text-base leading-relaxed">
            <p>
              El Chocó Biogeográfico es uno de los 35 hotspots de biodiversidad más
              importantes del planeta. Su extrema pluviosidad — hasta 16.000 mm anuales
              en Lloró — modela un ecosistema único donde cada río es un sistema
              circulatorio de vida y cultura.
            </p>
            <p>
              El río Atrato, declarado sujeto de derechos por la Corte Constitucional
              en 2016 mediante la Sentencia T-622, no es solo una vía fluvial: es un
              ser vivo protegido por ley, habitado por comunidades que llevan siglos
              construyendo civilización a sus orillas.
            </p>
          </div>
          <a
            href="/mapa"
            className="inline-flex items-center gap-2 mt-8 text-emerald-700 font-semibold
                       text-sm border-b-2 border-emerald-300 pb-0.5 hover:border-emerald-600
                       transition-colors duration-200"
          >
            Ver el territorio en el mapa
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Columna derecha — mismo arranque visual que el h2 (compensa “El territorio” + mb-4) */}
        <div className="space-y-8 md:pt-8">
          {FIGURES.map(({ figure, text, source }) => (
            <div key={figure} className="flex gap-6 items-start">
              <span
                className="font-serif text-emerald-600 leading-none flex-shrink-0"
                style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700 }}
              >
                {figure}
              </span>
              <div className="pt-1">
                <p className="text-gray-800 font-medium leading-snug">{text}</p>
                <p className="text-gray-400 text-xs mt-1">{source}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
