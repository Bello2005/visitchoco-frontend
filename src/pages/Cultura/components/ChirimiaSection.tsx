export function ChirimiaSection() {
  return (
    <section
      id="chirimia"
      className="py-24 px-6 md:px-16 bg-[#0d1a0e] relative overflow-hidden"
    >
      {/* Línea superior decorativa */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, #f59e0b40, transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Columna izquierda — número masivo */}
        <div>
          <p className="text-white/30 text-xs font-semibold tracking-[0.25em] uppercase mb-6">
            El sonido del Chocó
          </p>
          <div className="relative">
            <span
              className="font-serif text-white/5 absolute -top-8 -left-4 select-none"
              style={{
                fontSize: "clamp(8rem, 20vw, 16rem)",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              376
            </span>
            <div className="relative z-10">
              <span
                className="font-serif text-amber-400 block"
                style={{
                  fontSize: "clamp(4rem, 10vw, 8rem)",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                376
              </span>
              <p className="text-white/60 text-lg mt-3">
                años lleva la chirimía
                <br />
                sonando sin parar.
              </p>
              <p className="text-white/30 text-xs mt-2">Desde 1648 · Quibdó</p>
            </div>
          </div>
        </div>

        {/* Columna derecha — editorial */}
        <div className="space-y-6">
          <h2
            className="font-serif text-white"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            La chirimía no es solo música.
            <br />
            <span className="text-white/40">
              Es la constitución sonora del Chocó.
            </span>
          </h2>

          <p className="text-white/50 text-base leading-relaxed">
            Dos clarinetes, un bombardino, redoblante, tambora y platillos. La
            melodía europea que llegó con los misioneros franciscanos se fusionó
            con la percusión africana de los cimarrones y creó algo que no
            existe en ningún otro lugar del planeta.
          </p>

          <p className="text-white/50 text-base leading-relaxed">
            En San Pacho, la chirimía no se escucha sentado. Se sigue. Los
            músicos lideran la multitud por las calles en el bunde, una danza
            colectiva donde las barreras de clase desaparecen. Por esos minutos,
            Quibdó es completamente libre.
          </p>

          {/* Instrumentos como pills oscuras */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "2 Clarinetes",
              "Bombardino",
              "Tambora",
              "Redoblante",
              "Platillos",
              "Abozao",
              "Contradanza",
            ].map((inst) => (
              <span
                key={inst}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10
                           text-white/40 font-medium"
              >
                {inst}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
