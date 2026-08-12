/**
 * Corte esquemático de la zona de subducción.
 *
 * Existe para explicar una sola cosa: por qué el epicentro no fue lo más
 * destruido y por qué el sismo se sintió en Panamá. La respuesta es la
 * profundidad, y la profundidad se entiende mejor viéndola.
 *
 * No está a escala. La escala de profundidad (2 px = 1 km) sí es real,
 * la horizontal está comprimida.
 *
 * Accesibilidad: `role="img"` con título y descripción; el texto que lo
 * acompaña en GeologiaSection dice lo mismo en prosa, así que un lector
 * de pantalla no pierde nada.
 */

import { useReducedMotion } from "framer-motion";

/** y = 90 es la superficie; 2 px por kilómetro de profundidad. */
const SUP = 90;
const PX_POR_KM = 2;
const prof = (km: number) => SUP + km * PX_POR_KM;

/** Hipocentro, sobre la línea media de la placa a ~102 km. */
const HIPO = { x: 522, y: 295 };

export function SlabDiagram() {
  const reduce = useReducedMotion();

  return (
    <figure className="mt-8">
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <svg
          viewBox="0 0 800 400"
          role="img"
          aria-labelledby="slab-titulo slab-desc"
          className="w-full min-w-[560px] h-auto"
        >
          <title id="slab-titulo">
            Corte esquemático de la subducción bajo el occidente colombiano
          </title>
          <desc id="slab-desc">
            La placa de Nazca se hunde bajo el Bloque Andino del Norte. El
            sismo del 10 de agosto se originó dentro de la placa que se
            hunde, a unos cien kilómetros de profundidad, y no en el
            contacto entre las dos placas.
          </desc>

          <defs>
            <linearGradient id="slabFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.07)" />
            </linearGradient>
            <linearGradient id="mantoFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {/* Manto */}
          <rect x="0" y={SUP} width="800" height={400 - SUP} fill="url(#mantoFill)" />

          {/* Océano Pacífico */}
          <rect x="0" y={SUP - 16} width="290" height="16" fill="rgba(56,140,180,0.28)" />
          <text x="16" y={SUP - 24} fill="rgba(255,255,255,0.55)" fontSize="12">
            Océano Pacífico
          </text>

          {/* Perfil de la cordillera */}
          <path
            d="M 290 90 L 350 86 L 400 74 L 445 58 L 490 50 L 530 44 L 575 56 L 620 38 L 668 56 L 715 48 L 762 64 L 800 68 L 800 90 Z"
            fill="rgba(255,255,255,0.09)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />
          <text x="672" y="78" fill="rgba(255,255,255,0.55)" fontSize="12" textAnchor="middle">
            Cordillera Occidental
          </text>

          {/* Superficie */}
          <line
            x1="0"
            y1={SUP}
            x2="800"
            y2={SUP}
            stroke="rgba(255,255,255,0.30)"
            strokeWidth="1"
          />

          {/* Placa de Nazca subduciendo. Banda gruesa = litosfera oceánica. */}
          <path
            d="M 300 110 C 390 140, 470 210, 545 330"
            fill="none"
            stroke="url(#slabFill)"
            strokeWidth="50"
            strokeLinecap="round"
          />
          <path
            d="M 300 110 C 390 140, 470 210, 545 330"
            fill="none"
            stroke="rgba(255,255,255,0.20)"
            strokeWidth="50"
            strokeLinecap="round"
            opacity="0.35"
          />

          {/* Convergencia */}
          <g>
            <line
              x1="60"
              y1={SUP + 34}
              x2="180"
              y2={SUP + 34}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.5"
            />
            <path
              d="M 180 118 l -9 -4.5 l 0 9 Z"
              transform={`translate(0, ${SUP + 34 - 118})`}
              fill="rgba(255,255,255,0.55)"
            />
            <text x="60" y={SUP + 52} fill="rgba(255,255,255,0.70)" fontSize="12">
              55–60 mm por año
            </text>
            <text x="60" y={SUP + 68} fill="rgba(255,255,255,0.45)" fontSize="11">
              Placa de Nazca
            </text>
          </g>

          {/* ── Sismo superficial, para contraste ───────────────────── */}
          <g>
            <circle cx="655" cy={prof(12)} r="4" fill="rgba(255,255,255,0.45)" />
            <line
              x1="655"
              y1={prof(12)}
              x2="700"
              y2={prof(38)}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
            />
            {/* Anclado a la derecha: con textAnchor="start" el texto se salía
                del viewBox de 800 y quedaba cortado. */}
            <text
              x="792"
              y={prof(38) + 4}
              fill="rgba(255,255,255,0.55)"
              fontSize="11"
              textAnchor="end"
            >
              Un sismo superficial
            </text>
            <text
              x="792"
              y={prof(38) + 18}
              fill="rgba(255,255,255,0.45)"
              fontSize="10"
              textAnchor="end"
            >
              (Eje Cafetero, 1999)
            </text>
          </g>

          {/* ── Ondas ───────────────────────────────────────────────── */}
          <g fill="none" stroke="rgba(196,61,35,0.30)" strokeWidth="1.5">
            {[70, 130, 195].map((r, i) => (
              <circle key={r} cx={HIPO.x} cy={HIPO.y} r={r} strokeDasharray="3 7">
                {!reduce && (
                  <animate
                    attributeName="opacity"
                    values="0.15;0.55;0.15"
                    dur="4s"
                    begin={`${i * 1.1}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            ))}
          </g>

          {/* ── Epicentro e hipocentro ──────────────────────────────── */}
          <line
            x1={HIPO.x}
            y1={SUP}
            x2={HIPO.x}
            y2={HIPO.y}
            stroke="rgba(196,61,35,0.55)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />

          <circle cx={HIPO.x} cy={HIPO.y} r="12" fill="rgba(196,61,35,0.20)" />
          <circle cx={HIPO.x} cy={HIPO.y} r="5.5" fill="#e0563a" />
          <text x={HIPO.x + 20} y={HIPO.y - 4} fill="rgba(255,255,255,0.92)" fontSize="12.5">
            Hipocentro
          </text>
          <text x={HIPO.x + 20} y={HIPO.y + 12} fill="rgba(255,255,255,0.60)" fontSize="11">
            ~100 km · dentro de la placa
          </text>

          <circle cx={HIPO.x} cy={SUP} r="4" fill="#e0563a" />
          <text x={HIPO.x} y={SUP - 10} fill="rgba(255,255,255,0.85)" fontSize="11.5" textAnchor="middle">
            San José del Palmar
          </text>

          {/* ── Escala de profundidad ───────────────────────────────── */}
          <g>
            <line
              x1="30"
              y1={SUP}
              x2="30"
              y2={prof(140)}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
            {[0, 50, 100].map((km) => (
              <g key={km}>
                <line
                  x1="26"
                  y1={prof(km)}
                  x2="34"
                  y2={prof(km)}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1"
                />
                <text
                  x="20"
                  y={prof(km) + 4}
                  fill="rgba(255,255,255,0.45)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="ui-monospace, monospace"
                >
                  {km}
                </text>
              </g>
            ))}
            <text
              x="30"
              y={prof(140) + 16}
              fill="rgba(255,255,255,0.40)"
              fontSize="10"
              textAnchor="middle"
            >
              km
            </text>
          </g>
        </svg>
      </div>

      <figcaption className="mt-3 text-micro text-white/50">
        Esquema. La escala de profundidad es real; la horizontal está
        comprimida. El sismo no ocurrió en el contacto entre las placas, sino
        dentro de la placa que se hunde.
      </figcaption>
    </figure>
  );
}
