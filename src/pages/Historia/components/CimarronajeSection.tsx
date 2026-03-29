import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export function CimarronajeSection() {
  return (
    <section className="py-24 bg-[#0f0a00] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-red-500/50 text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          >
            1727 — Tadó, Chocó
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-white"
            style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.05 }}
          >
            Barule fue el primer
            <br />
            <span className="text-red-500">libertador del Chocó.</span>
            <br />
            <span className="text-white/20">El mundo lo olvidó.</span>
          </motion.h2>
        </div>

        {/* Split layout */}
        <div className="grid md:grid-cols-2 gap-3 min-h-[520px]">
          {/* Izquierda — texto editorial */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative bg-[#1a0800] rounded-2xl p-8 md:p-12 flex flex-col justify-between overflow-hidden"
          >
            {/* Watermark LIBRE */}
            <span
              className="absolute -bottom-8 -right-4 font-serif text-red-500/[0.04]
                           select-none pointer-events-none leading-none"
              style={{ fontSize: "clamp(8rem, 20vw, 14rem)", fontWeight: 700 }}
            >
              LIBRE
            </span>

            <div className="relative z-10 space-y-6">
              <p className="text-white/70 text-base leading-relaxed">
                Barule era un esclavo <em className="text-white not-italic font-semibold">«bozal»</em> —
                nacido en África, probablemente de etnia Akan, traído desde Jamaica donde había
                conocido las guerras cimarronas. Hablaba inglés. Conocía la resistencia.
              </p>
              <p className="text-white/50 text-base leading-relaxed">
                En noviembre de 1727, confederó a más de 120 cimarrones y ganó la lealtad
                clandestina de cerca de{" "}
                <em className="text-red-400 not-italic font-bold">2.000 esclavizados</em> en las
                cuencas de los ríos Nóvita y San Juan. Ajusticiaron a 14 esclavistas españoles y
                fundaron el Palenque de Tadó.
              </p>
              <p className="text-white/50 text-base leading-relaxed">
                Su objetivo declarado:{" "}
                <em className="text-amber-400 not-italic">
                  &quot;aniquilar el régimen esclavista blanco en todo el Chocó&quot;
                </em>
                . Fue traicionado, capturado y fusilado el 18 de febrero de 1728. Pero el terror que
                infundió obligó al sistema esclavista a ceder.
              </p>
            </div>

            {/* Stats rápidos */}
            <div className="relative z-10 grid grid-cols-3 gap-4 pt-8 border-t border-white/[0.06] mt-8">
              {[
                { valor: "2.000", label: "esclavizados confederados" },
                { valor: "1728", label: "año del Palenque de Tadó" },
                { valor: "14", label: "esclavistas ajusticiados" },
              ].map(({ valor, label }) => (
                <div key={label}>
                  <p
                    className="font-serif text-red-400 font-bold"
                    style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}
                  >
                    {valor}
                  </p>
                  <p className="text-white/25 text-[10px] mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Derecha — imagen con capas de datos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl"
            style={{ minHeight: 400 }}
          >
            <img
              src="/images/municipios/bojaya.jpg"
              alt="Territorio de resistencia — Chocó"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.3) saturate(0.6) sepia(0.4)" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(15,10,0,0.9) 0%, transparent 50%)",
              }}
            />

            {/* Agustina — badge */}
            <div className="absolute top-6 left-6 right-6">
              <div
                className="bg-black/50 backdrop-blur-md border border-pink-500/20
                                rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={12} className="text-pink-400" />
                  <span className="text-pink-400/80 text-[10px] font-bold tracking-widest uppercase">
                    1795 · Tadó
                  </span>
                </div>
                <p className="text-white/80 text-sm font-semibold leading-tight mb-1">
                  Agustina de Tadó
                </p>
                <p className="text-white/40 text-xs leading-relaxed">
                  Primer acto de rebelión liderado por una mujer negra en Colombia. Incendió la
                  hacienda de su opresor tras ser azotada por denunciar abusos sexuales ante la
                  justicia colonial.
                </p>
              </div>
            </div>

            {/* Palenques — texto abajo */}
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white/20 text-[10px] font-semibold tracking-widest uppercase mb-2">
                Los palenques del Chocó
              </p>
              <p className="text-white/50 text-sm leading-relaxed">
                Comunidades libres en la selva. Rodeadas de fosos y empalizadas. Allí se reconstruyó
                la cultura africana, se preservaron las lenguas, y se plantaron semillas que las
                mujeres ocultaban en su cabello al huir.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
