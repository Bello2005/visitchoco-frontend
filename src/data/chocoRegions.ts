// Definición de tipos
export type AttractionType = "natural" | "cultural" | "histórica" | "económica";
export type TransportationType = "terrestre" | "fluvial" | "aéreo";
export type Availability = "alta" | "media" | "baja";
// Definición de colores por zona para consistencia en UI
export const ZoneColors = {
  "Costa Pacífica": "#0EA5E9", // azul para zonas costeras
  "Zona Minera": "#F59E0B", // ámbar para zonas mineras
  "Región del Atrato": "#10B981", // verde esmeralda para región fluvial
  "Zona Agrícola": "#84CC16", // verde lima para zonas agrícolas
  "Zona Sur": "#8B5CF6", // violeta para zona sur
  "Zona Norte": "#EC4899", // rosa para zona norte
} as const;

export type Zone =
  | "Costa Pacífica"
  | "Zona Minera"
  | "Región del Atrato"
  | "Zona Agrícola"
  | "Zona Sur"
  | "Zona Norte";
// Iconos para actividades principales
export const MainActivityIcons = {
  minería: "⛏️",
  pesca: "🎣",
  agricultura: "🌾",
  turismo: "🏖️",
  comercio: "🏪",
  mixta: "🔄",
} as const;

export type MainActivity =
  | "minería"
  | "pesca"
  | "agricultura"
  | "turismo"
  | "comercio"
  | "mixta";

// Interfaces
export interface Attraction {
  name: string;
  type: AttractionType;
  description?: string;
  bestSeason?: string;
  // Nuevos campos para mejorar la experiencia del usuario
  images?: string[]; // Múltiples imágenes de la atracción
  price?: {
    // Información de precios
    amount: number;
    currency: string;
    type: "gratis" | "entrada" | "donación";
  };
  schedule?: {
    // Horarios de apertura
    [key: string]: {
      open: string;
      close: string;
    };
  };
  tags?: string[]; // Etiquetas para búsqueda
  restrictions?: string[]; // Restricciones o requisitos
  accessibility?: {
    // Información de accesibilidad
    wheelchairAccessible: boolean;
    guidedToursAvailable: boolean;
    parkingAvailable: boolean;
  };
  popularity?: number; // Índice de popularidad (1-5)
  duration?: string; // Tiempo promedio de visita
}

export interface Transportation {
  type: TransportationType;
  description: string;
  availability: Availability;
}

export interface Weather {
  averageTemp: string;
  rainySeasons: string[];
  bestTimeToVisit: string;
}

// Interfaz para metadatos de accesibilidad
export interface AccessibilityInfo {
  wheelchairAccessible?: boolean;
  recommendedSeason?: string;
  difficulty?: "fácil" | "moderado" | "difícil";
  languages?: string[];
  serviceAnimalsAllowed?: boolean;
}

// Interfaz para información de contacto
export interface ContactInfo {
  emergencyPhone?: string;
  touristOffice?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface Region {
  id: string;
  name: string;
  coordinates: [number, number];
  description: string;
  population: string;
  attractions: Attraction[];
  emoji: string;
  zone: Zone;
  mainActivity: MainActivity;
  transportation: Transportation[];
  weather: Weather;
  imageUrl?: string;
  // Nuevos campos para mejorar la UI/UX
  accessibility?: AccessibilityInfo;
  contactInfo?: ContactInfo;
  tags?: string[]; // Para búsqueda y filtrado
  rating?: number; // Calificación promedio
  visitDuration?: string; // Tiempo recomendado de visita
  nearbyPlaces?: string[]; // Lugares cercanos de interés
  popularTimes?: {
    // Horas populares de visita
    [key: string]: number[]; // Por día de la semana
  };
  lastUpdated?: string; // Fecha de última actualización
}

// Datos de las regiones
export const chocoRegions: Region[] = [
  {
    id: "quibdo",
    name: "Quibdó",
    coordinates: [5.6919, -76.6583],
    description: "Capital del departamento y centro cultural.",
    population: "130,000 habitantes aproximadamente",
    attractions: [
      {
        name: "Catedral San Francisco de Asís",
        type: "histórica",
        description:
          "Importante centro religioso y arquitectónico de la ciudad",
      },
      {
        name: "Malecón del Atrato",
        type: "cultural",
        description: "Espacio público junto al río con actividades culturales",
        bestSeason: "Todo el año",
      },
      {
        name: "Museo de Cultura Negra",
        type: "cultural",
        description: "Exhibición de la historia y cultura afrochocoana",
      },
    ],
    emoji: "🏛️",
    zone: "Región del Atrato",
    mainActivity: "comercio",
    transportation: [
      {
        type: "aéreo",
        description: "Aeropuerto El Caraño con vuelos regulares",
        availability: "alta",
      },
      {
        type: "terrestre",
        description: "Conexión por carretera con Medellín",
        availability: "alta",
      },
      {
        type: "fluvial",
        description: "Transporte por el río Atrato",
        availability: "alta",
      },
    ],
    weather: {
      averageTemp: "28°C",
      rainySeasons: ["Abril-Mayo", "Septiembre-Noviembre"],
      bestTimeToVisit: "Diciembre a Marzo",
    },
    imageUrl: "https://example.com/images/quibdo.jpg",
  },
  {
    id: "nuqui",
    name: "Nuquí",
    coordinates: [5.7086, -77.2708],
    description: "Paraíso costero conocido por el avistamiento de ballenas.",
    population: "8,000 habitantes aproximadamente",
    attractions: [
      {
        name: "Playa Olímpica",
        type: "natural",
        description: "Hermosa playa con olas perfectas para el surf",
        bestSeason: "Diciembre a Marzo",
      },
      {
        name: "Termales",
        type: "natural",
        description: "Aguas termales naturales junto al mar",
      },
      {
        name: "Avistamiento de ballenas",
        type: "natural",
        description: "Observación de ballenas jorobadas",
        bestSeason: "Julio a Octubre",
      },
    ],
    emoji: "🌊",
    zone: "Costa Pacífica",
    mainActivity: "turismo",
    transportation: [
      {
        type: "aéreo",
        description: "Pequeño aeropuerto con vuelos desde Quibdó",
        availability: "media",
      },
      {
        type: "fluvial",
        description: "Acceso por mar desde Bahía Solano",
        availability: "alta",
      },
    ],
    weather: {
      averageTemp: "27°C",
      rainySeasons: ["Mayo-Junio", "Septiembre-Noviembre"],
      bestTimeToVisit: "Julio a Octubre (temporada de ballenas)",
    },
    imageUrl: "https://example.com/images/nuqui.jpg",
  },
  {
    id: "bahia-solano",
    name: "Bahía Solano",
    coordinates: [6.2222, -77.4074],
    description:
      "Importante destino turístico conocido por sus playas y pesca.",
    population: "9,500 habitantes aproximadamente",
    attractions: [
      {
        name: "Playa El Almejal",
        type: "natural",
        description: "Playa perfecta para el avistamiento de tortugas",
        bestSeason: "Septiembre a Diciembre",
      },
      {
        name: "Parque Nacional Natural Utría",
        type: "natural",
        description: "Área protegida con gran biodiversidad",
        bestSeason: "Todo el año",
      },
      {
        name: "Pesca deportiva",
        type: "económica",
        description: "Pesca de especies como el marlín y el atún",
        bestSeason: "Enero a Mayo",
      },
    ],
    emoji: "🎣",
    zone: "Costa Pacífica",
    mainActivity: "turismo",
    transportation: [
      {
        type: "aéreo",
        description: "Aeropuerto José Celestino Mutis",
        availability: "alta",
      },
      {
        type: "fluvial",
        description: "Puerto marítimo con conexiones regulares",
        availability: "alta",
      },
    ],
    weather: {
      averageTemp: "26°C",
      rainySeasons: ["Mayo-Junio", "Septiembre-Noviembre"],
      bestTimeToVisit: "Diciembre a Abril",
    },
    imageUrl: "https://example.com/images/bahia-solano.jpg",
  },
  {
    id: "istmina",
    name: "Istmina",
    coordinates: [5.1617, -76.7819],
    description: "Centro comercial y cultural del departamento.",
    population: "25,000 habitantes aproximadamente",
    attractions: [
      {
        name: "Río San Juan",
        type: "natural",
        description:
          "Principal río de la región, ideal para navegación y pesca",
        bestSeason: "Diciembre a Marzo",
      },
      {
        name: "Mercado Municipal",
        type: "económica",
        description: "Centro de comercio tradicional con productos locales",
      },
      {
        name: "Festival de la Cultura Negra",
        type: "cultural",
        description: "Celebración anual de la cultura afrochocoana",
        bestSeason: "Junio",
      },
    ],
    emoji: "🏪",
    zone: "Zona Minera",
    mainActivity: "comercio",
    transportation: [
      {
        type: "terrestre",
        description: "Conexión por carretera desde Quibdó",
        availability: "alta",
      },
      {
        type: "fluvial",
        description: "Transporte por el río San Juan",
        availability: "alta",
      },
    ],
    weather: {
      averageTemp: "28°C",
      rainySeasons: ["Abril-Mayo", "Septiembre-Octubre"],
      bestTimeToVisit: "Diciembre a Marzo",
    },
    imageUrl: "https://example.com/images/istmina.jpg",
  },
  {
    id: "unguia",
    name: "Unguía",
    coordinates: [8.0433, -77.0917],
    description: "Municipio ganadero y agricultor con hermosas playas.",
    population: "15,000 habitantes aproximadamente",
    attractions: [
      {
        name: "Ganadería Tradicional",
        type: "económica",
        description:
          "Conoce las prácticas ganaderas tradicionales de la región",
      },
      {
        name: "Playas Vírgenes",
        type: "natural",
        description: "Extensas playas sin desarrollo turístico",
        bestSeason: "Diciembre a Marzo",
      },
      {
        name: "Santuario de Flora y Fauna Los Katíos",
        type: "natural",
        description: "Área protegida compartida con Antioquia",
        bestSeason: "Todo el año",
      },
    ],
    emoji: "🐄",
    zone: "Zona Norte",
    mainActivity: "agricultura",
    transportation: [
      {
        type: "terrestre",
        description: "Acceso por carretera desde Turbo, Antioquia",
        availability: "media",
      },
      {
        type: "fluvial",
        description: "Transporte por el río Atrato",
        availability: "alta",
      },
    ],
    weather: {
      averageTemp: "27°C",
      rainySeasons: ["Mayo-Junio", "Octubre-Noviembre"],
      bestTimeToVisit: "Enero a Abril",
    },
    imageUrl: "https://example.com/images/unguia.jpg",
  },
];
