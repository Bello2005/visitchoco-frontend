const EXPRESIONES = [
  {
    icon: "🥁",
    titulo: "El Bunde",
    subtitulo: "Danza · Resistencia",
    descripcion:
      "Danza colectiva eufórica donde las clases sociales se disuelven. Cuando el redoblante llama, nadie puede quedarse quieto.",
    color: "#f59e0b",
  },
  {
    icon: "⚰️",
    titulo: "Los Alabaos",
    subtitulo: "Cantos mortuorios · Herencia africana",
    descripcion:
      "Cantos polifónicos a capella durante nueve noches de velorio. Las cantaoras son las guardianas de la memoria colectiva.",
    color: "#6366f1",
  },
  {
    icon: "🎨",
    titulo: "El Disfraz",
    subtitulo: "Arte · Denuncia política",
    descripcion:
      "Desde 1926, los barrios de Quibdó construyen figuras gigantes que critican la corrupción y el abandono estatal. Un periódico de papel maché.",
    color: "#ec4899",
  },
  {
    icon: "🛶",
    titulo: "La Balsada",
    subtitulo: "Procesión fluvial · Desde 1648",
    descripcion:
      "Canoas adornadas navegando el río Atrato con la imagen de San Francisco. El momento donde el río y la fe se vuelven uno.",
    color: "#10b981",
  },
];

export function ExpresionesSection() {
  return (
    <section id="expresiones" className="py-24 px-6 md:px-16 bg-[#0a0f0a]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-white/30 text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            Expresiones vivas
          </p>
          <h2
            className="font-serif text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700 }}
          >
            Cuatro formas de decir
            <br />
            <span className="text-white/30">que seguimos aquí.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXPRESIONES.map(({ icon, titulo, subtitulo, descripcion, color }) => (
            <div
              key={titulo}
              className="group relative rounded-2xl p-6 cursor-default
                         border border-white/5 hover:border-white/15
                         transition-all duration-500"
              style={{
                background: "linear-gradient(145deg, #141a14, #0d120d)",
              }}
            >
              {/* Glow en hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 30% 70%, ${color}12 0%, transparent 70%)`,
                }}
              />

              {/* Icono */}
              <div className="text-4xl mb-6">{icon}</div>

              {/* Subtítulo */}
              <p
                className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2"
                style={{ color: `${color}80` }}
              >
                {subtitulo}
              </p>

              {/* Título */}
              <h3 className="font-serif text-white text-xl font-bold mb-3 leading-tight">
                {titulo}
              </h3>

              {/* Descripción */}
              <p className="text-white/40 text-sm leading-relaxed">
                {descripcion}
              </p>

              {/* Línea de color en la parte inferior */}
              <div
                className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(to right, ${color}60, transparent)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
