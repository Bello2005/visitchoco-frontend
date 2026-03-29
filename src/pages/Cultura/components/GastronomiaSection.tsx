const PLATOS = [
  {
    numero: "01",
    nombre: "Arroz Clavado",
    descripcion:
      "El arroz se tuesta primero — paciencia convertida en técnica. Luego se clava con queso blanco salado y longaniza ahumada. El achiote da el color del sol sobre el Atrato.",
    ingrediente: "Longaniza ahumada · Queso chocoano · Achiote",
    color: "#f59e0b",
  },
  {
    numero: "02",
    nombre: "Encocado de Pargo",
    descripcion:
      "El pargo del Pacífico desmechado en leche de coco fresca. El cilantro cimarrón y el poleo — hierbas que solo crecen en esta selva — transforman lo simple en extraordinario.",
    ingrediente: "Leche de coco · Cilantro cimarrón · Poleo",
    color: "#10b981",
  },
  {
    numero: "03",
    nombre: "El Viche",
    descripcion:
      "Destilado artesanal de caña cortada al vaivén de las mareas. Durante siglos fue perseguido por el Estado. Hoy tiene Ley propia (Ley 2158 de 2021) y denominación de origen.",
    ingrediente: "Caña del Pacífico · Destilación ancestral",
    color: "#6366f1",
  },
  {
    numero: "04",
    nombre: "Borojó",
    descripcion:
      "Fruta endémica del Chocó Biogeográfico. Energizante, espesa, con un sabor entre dulce y fermentado que no existe en ningún otro lugar del planeta.",
    ingrediente: "Endémico del Chocó · Único en el mundo",
    color: "#ec4899",
  },
  {
    numero: "05",
    nombre: "Jujú",
    descripcion:
      "Plátano verde cocido aplastado con queso costeño. Frito hasta dorar. Un tentempié que resuelve el hambre y conecta con la infancia chocoana en cuatro bocados.",
    ingrediente: "Plátano verde · Queso costeño",
    color: "#f97316",
  },
  {
    numero: "06",
    nombre: "Sancocho de Bocachico",
    descripcion:
      "El río en un plato. El bocachico secado al sol o salado, cocinado lento con plátano, yuca y las hierbas del monte, servido sobre hoja de plátano.",
    ingrediente: "Bocachico del Atrato · Hoja de plátano",
    color: "#0ea5e9",
  },
];

export function GastronomiaSection() {
  return (
    <section
      id="gastronomia"
      className="py-24 px-6 md:px-16"
      style={{ background: "#110d06" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-amber-400/60 text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              Gastronomía del territorio
            </p>
            <h2
              className="font-serif text-white"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700 }}
            >
              El sabor del río,
              <br />
              <span className="text-white/30">la selva y el mar.</span>
            </h2>
          </div>
          <p className="text-white/30 text-sm max-w-xs leading-relaxed">
            Una cocina de supervivencia que el tiempo convirtió en arte.
            Técnicas indígenas y africanas que maximizan los dones del bosque
            húmedo.
          </p>
        </div>

        {/* Lista estilo menú de alta cocina */}
        <div className="divide-y divide-white/5">
          {PLATOS.map(({ numero, nombre, descripcion, ingrediente, color }) => (
            <div
              key={nombre}
              className="group py-8 flex flex-col md:flex-row md:items-start gap-4 md:gap-12
                         hover:bg-white/[0.02] -mx-4 px-4 rounded-xl transition-colors duration-300"
            >
              {/* Número */}
              <span className="text-white/15 font-serif text-4xl font-bold flex-shrink-0 w-12">
                {numero}
              </span>

              {/* Nombre + descripción */}
              <div className="flex-1">
                <h3
                  className="font-serif text-white font-bold mb-2 transition-colors duration-300"
                  style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}
                >
                  {nombre}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed italic max-w-2xl">
                  {descripcion}
                </p>
              </div>

              {/* Ingrediente estrella */}
              <div className="flex-shrink-0 md:text-right">
                <span
                  className="text-[10px] font-semibold tracking-widest uppercase"
                  style={{ color: `${color}70` }}
                >
                  {ingrediente}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
