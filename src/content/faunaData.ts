/** Datos de biodiversidad del Chocó */
export const biodiversityData = {
  aves: 577,
  plantas: 8500,
  anfibios: 200,
  mamiferos: 150,
  peces: 800,
  mariposas: 3000,
  parquesNacionales: 4,
  porcentajeEspeciesEndemicas: 25,
} as const;

export type EspecieIconica = {
  nombre: string;
  nombreCientifico: string;
  estadoConservacion: string;
  descripcion: string;
  habitat: string;
  donde: string[];
  temporada?: string;
};

/** Especies icónicas con datos reales — texto literal del brief */
export const especiesIconicas: EspecieIconica[] = [
  {
    nombre: "Jaguar",
    nombreCientifico: "Panthera onca",
    estadoConservacion: "Vulnerable",
    descripcion:
      "El mayor felino de América. El Chocó biogeográfico es uno de los últimos refugios del jaguar en Colombia.",
    habitat: "Selva húmeda tropical",
    donde: ["Serranía del Baudó", "PNN Los Katíos", "Bajo Atrato"],
  },
  {
    nombre: "Ballena Jorobada",
    nombreCientifico: "Megaptera novaeangliae",
    estadoConservacion: "Preocupación Menor",
    descripcion:
      "Migra 8.000 km desde la Antártica para reproducirse en las aguas cálidas del Pacífico colombiano.",
    habitat: "Océano Pacífico",
    donde: ["Bahía Solano", "Nuquí", "PNN Utría"],
    temporada: "Julio — Octubre",
  },
  {
    nombre: "Águila Arpía",
    nombreCientifico: "Harpia harpyja",
    estadoConservacion: "Vulnerable",
    descripcion:
      "La rapaz más poderosa del mundo. Sus alas alcanzan 2 metros de envergadura.",
    habitat: "Dosel de selva primaria",
    donde: ["PNN Los Katíos", "Serranía del Baudó"],
  },
  {
    nombre: "Rana Venenosa",
    nombreCientifico: "Phyllobates bicolor",
    estadoConservacion: "Vulnerable",
    descripcion:
      "Endémica del Chocó. Los Emberá la usaban para envenenar sus dardos de caza.",
    habitat: "Selva húmeda y quebradas",
    donde: ["Río San Juan", "Alto Baudó", "Río Baudó"],
  },
  {
    nombre: "Tití Cabeciblanco",
    nombreCientifico: "Saguinus oedipus",
    estadoConservacion: "En Peligro Crítico",
    descripcion:
      "Uno de los primates más amenazados del planeta. Solo quedan aproximadamente 6.000 individuos.",
    habitat: "Bosques secos y húmedos",
    donde: ["Darién", "Urabá chocoano"],
  },
  {
    nombre: "Danta o Tapir",
    nombreCientifico: "Tapirus bairdii",
    estadoConservacion: "En Peligro",
    descripcion:
      "El mamífero terrestre más grande de América Central y del Sur. Guardián de semillas del bosque.",
    habitat: "Selva primaria y ribera de ríos",
    donde: ["PNN Utría", "PNN Los Katíos"],
  },
  {
    nombre: "Tortuga Baula",
    nombreCientifico: "Dermochelys coriacea",
    estadoConservacion: "Crítico",
    descripcion:
      "La tortuga marina más grande del mundo. Anida en las playas del Pacífico chocoano.",
    habitat: "Océano Pacífico",
    donde: ["Playa El Almejal", "Juanchaco", "Nuquí"],
    temporada: "Septiembre — Diciembre",
  },
  {
    nombre: "Mariposa Morpho",
    nombreCientifico: "Morpho menelaus",
    estadoConservacion: "No Evaluado",
    descripcion:
      "Sus alas de 15 cm reflejan luz azul iridiscente. Símbolo de la biodiversidad del Chocó.",
    habitat: "Selva tropical húmeda",
    donde: ["Todo el departamento"],
  },
];

export type ParqueNatural = {
  nombre: string;
  slug: string;
  descripcion: string;
  hectareas: number;
  ubicacion: string;
  especiesAves: number;
  esUNESCO: boolean;
  destacado: string;
  /** Texto corto para card de la vista Fauna */
  tagline: string;
};

export const parquesNaturales: ParqueNatural[] = [
  {
    nombre: "PNN Utría",
    slug: "utria",
    descripcion:
      "Donde la selva abraza el mar. Ensenada de aguas cristalinas con corales, manglares y selva virgen en perfecta armonía.",
    hectareas: 54300,
    ubicacion: "Costa Pacífica Norte — municipios Bahía Solano y Nuquí",
    especiesAves: 247,
    esUNESCO: false,
    destacado:
      "Avistamiento de ballenas, buceo con tortugas, senderismo en selva primaria",
    tagline: "Donde la selva abraza el mar",
  },
  {
    nombre: "PNN Los Katíos",
    slug: "katios",
    descripcion:
      "Patrimonio de la Humanidad por la UNESCO. Uno de los ecosistemas más ricos y complejos del planeta.",
    hectareas: 72000,
    ubicacion: "Darién — municipio de Riosucio",
    especiesAves: 450,
    esUNESCO: true,
    destacado:
      "El jaguar, el águila arpía y el manatí del Caribe coexisten aquí",
    tagline: "Patrimonio de la Humanidad UNESCO",
  },
  {
    nombre: "PNN Tatamá",
    slug: "tatama",
    descripcion:
      "La cordillera Occidental viva. Ecosistemas que van desde páramo hasta selva húmeda en apenas 40 km.",
    hectareas: 51900,
    ubicacion: "San Juan — municipio de San José del Palmar",
    especiesAves: 320,
    esUNESCO: false,
    destacado: "Zona de nidificación de aves endémicas de los Andes del Chocó",
    tagline: "La cordillera viva",
  },
  {
    nombre: "PNN Serranía del Baudó",
    slug: "baudo",
    descripcion:
      "El corazón secreto del Pacífico. Montañas antiguas con un nivel de endemismo comparable a las Galápagos.",
    hectareas: 81000,
    ubicacion: "Pacífico Sur — Alto y Medio Baudó",
    especiesAves: 380,
    esUNESCO: false,
    destacado:
      "25% de especies encontradas aquí no existen en ningún otro lugar del mundo",
    tagline: "El corazón secreto del Pacífico",
  },
];

/** Franja superior de biodiversidad — valores para contadores */
export const biodiversityStripStats = [
  { value: 577, label: "aves registradas", prefix: "" },
  { value: 8500, label: "especies de plantas vasculares", prefix: "+" },
  { value: 4, label: "Parques Nacionales Naturales", prefix: "" },
  { value: 2, label: "costas (Pacífico + Caribe)", prefix: "" },
] as const;

export type EspecieBentoItem = {
  nombre: string;
  nombreCientifico: string;
  estadoConservacion: string;
  descripcion: string;
  habitat: string;
  donde: string[];
  imageUrl: string;
  colSpan: number;
  rowSpan: number;
};

/** Bento grid: layout + imágenes Unsplash; textos alineados con especiesIconicas donde aplica */
export const especiesBento: EspecieBentoItem[] = [
  {
    nombre: "Jaguar",
    nombreCientifico: "Panthera onca",
    estadoConservacion: "Vulnerable",
    descripcion:
      "El mayor felino de América. El Chocó biogeográfico es uno de los últimos refugios del jaguar en Colombia.",
    habitat: "Selva húmeda tropical",
    donde: ["Serranía del Baudó", "PNN Los Katíos", "Bajo Atrato"],
    imageUrl: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=800&q=75",
    colSpan: 7,
    rowSpan: 2,
  },
  {
    nombre: "Danta o Tapir",
    nombreCientifico: "Tapirus bairdii",
    estadoConservacion: "En Peligro",
    descripcion:
      "El mamífero terrestre más grande de América Central y del Sur. Guardián de semillas del bosque.",
    habitat: "Selva primaria y ribera de ríos",
    donde: ["PNN Utría", "PNN Los Katíos"],
    imageUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=75",
    colSpan: 5,
    rowSpan: 1,
  },
  {
    nombre: "Águila Arpía",
    nombreCientifico: "Harpia harpyja",
    estadoConservacion: "Vulnerable",
    descripcion:
      "La rapaz más poderosa del mundo. Sus alas alcanzan 2 metros de envergadura.",
    habitat: "Dosel de selva primaria",
    donde: ["PNN Los Katíos", "Serranía del Baudó"],
    imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=75",
    colSpan: 5,
    rowSpan: 1,
  },
  {
    nombre: "Rana Venenosa",
    nombreCientifico: "Phyllobates bicolor",
    estadoConservacion: "Vulnerable",
    descripcion:
      "Endémica del Chocó. Los Emberá la usaban para envenenar sus dardos de caza.",
    habitat: "Selva húmeda y quebradas",
    donde: ["Río San Juan", "Alto Baudó", "Río Baudó"],
    imageUrl: "https://images.unsplash.com/photo-1498855926480-d98e83099315?w=800&q=75",
    colSpan: 3,
    rowSpan: 2,
  },
  {
    nombre: "Mariposa Morpho",
    nombreCientifico: "Morpho menelaus",
    estadoConservacion: "No Evaluado",
    descripcion:
      "Sus alas de 15 cm reflejan luz azul iridiscente. Símbolo de la biodiversidad del Chocó.",
    habitat: "Selva tropical húmeda",
    donde: ["Todo el departamento"],
    imageUrl: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&q=75",
    colSpan: 3,
    rowSpan: 2,
  },
  {
    nombre: "Delfín del Pacífico",
    nombreCientifico: "Lagenorhynchus obscurus",
    estadoConservacion: "Preocupación Menor",
    descripcion:
      "Delfines costeros que recorren el Pacífico chocoano en grupos; frecuentes frente a Nuquí y Bahía Solano.",
    habitat: "Océano Pacífico",
    donde: ["Nuquí", "Bahía Solano", "PNN Utría"],
    imageUrl: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&q=75",
    colSpan: 3,
    rowSpan: 1,
  },
  {
    nombre: "Tití Cabeciblanco",
    nombreCientifico: "Saguinus oedipus",
    estadoConservacion: "En Peligro Crítico",
    descripcion:
      "Uno de los primates más amenazados del planeta. Solo quedan aproximadamente 6.000 individuos.",
    habitat: "Bosques secos y húmedos",
    donde: ["Darién", "Urabá chocoano"],
    imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=75",
    colSpan: 3,
    rowSpan: 1,
  },
  {
    nombre: "Tortuga Baula",
    nombreCientifico: "Dermochelys coriacea",
    estadoConservacion: "Crítico",
    descripcion:
      "La tortuga marina más grande del mundo. Anida en las playas del Pacífico chocoano.",
    habitat: "Océano Pacífico",
    donde: ["Playa El Almejal", "Juanchaco", "Nuquí"],
    imageUrl: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=75",
    colSpan: 6,
    rowSpan: 1,
  },
];
