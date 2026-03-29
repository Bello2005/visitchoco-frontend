import { motion } from "framer-motion";
import { Shield, Calendar, Users, ArrowRight } from "lucide-react";

const BARRIOS = [
  "Tomás Pérez",
  "Kennedy",
  "Margaritas",
  "Esmeralda",
  "Cristo Rey",
  "Silencio",
  "César Conto",
  "Roma",
  "Pandeyuca",
  "Yesquita",
  "Yesca Grande",
  "Alameda Reyes",
];

export function SanPachoFeature() {
  return (
    <section className="py-24 px-6 md:px-0 bg-[#0c0800]">
      <div className="max-w-7xl mx-auto">
        <div className="px-6 md:px-16 mb-12">
          <p className="text-amber-400/60 text-xs font-semibold tracking-[0.25em] uppercase mb-2">
            La fiesta más grande
          </p>
          <h2 className="font-serif text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
            San Pacho · <span className="text-amber-400">UNESCO 2012</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 min-h-[600px]">
          <div className="relative overflow-hidden md:rounded-r-none rounded-2xl md:rounded-l-2xl">
            <img
              src="/images/municipios/quibdo.jpg"
              alt="Fiestas de San Pacho, Quibdó"
              className="w-full h-full object-cover min-h-[400px]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, transparent 50%, #0c0800 100%), linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)",
              }}
            />
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-amber-400/30 px-4 py-2 rounded-full">
              <Shield size={12} className="text-amber-400" />
              <span className="text-amber-300 text-xs font-semibold tracking-wider uppercase">
                Patrimonio de la Humanidad
              </span>
            </div>
          </div>

          <div className="bg-[#110a00] md:rounded-r-2xl px-8 md:px-12 py-12 flex flex-col justify-center gap-8">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "15", label: "días de fiesta", icon: Calendar },
                { value: "1648", label: "año de origen", icon: Shield },
                { value: "12", label: "barrios franciscanos", icon: Users },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center">
                  <Icon className="mx-auto mb-1 text-amber-400/50" size={16} strokeWidth={1.5} />
                  <p className="font-serif text-amber-400 font-bold" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
                    {value}
                  </p>
                  <p className="text-white/30 text-xs mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-4">
              <p className="text-white/70 text-base leading-relaxed">
                Cada 20 de septiembre, a medianoche, los cañones disparan y las chirimías despiertan a Quibdó. La
                Alborada anuncia que los 15 días más importantes del año han comenzado.
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                Los 12 barrios franciscanos compiten con disfraces que son periódicos de papel maché: denuncian
                corrupción, abandono estatal y discriminación con arte y sarcasmo. La fiesta como constitución
                popular.
              </p>
            </div>

            <div>
              <p className="text-white/20 text-[10px] font-semibold tracking-widest uppercase mb-3">
                Los 12 barrios franciscanos
              </p>
              <div className="flex flex-wrap gap-2">
                {BARRIOS.map((barrio, i) => (
                  <motion.span
                    key={barrio}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="text-xs px-3 py-1 rounded-full border border-amber-500/20 text-amber-300/60 font-medium"
                  >
                    {barrio}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Chirimía", "Bunde", "Balsada", "Alborada", "Disfraz político"].map((el) => (
                <span
                  key={el}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20"
                >
                  {el}
                </span>
              ))}
            </div>

            <a
              href="/mapa?m=quibdo"
              className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm hover:text-amber-300 transition-colors"
            >
              Ver Quibdó en el mapa
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
