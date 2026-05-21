import type { LucideIcon } from "lucide-react";
import { Leaf, Gem, Waves, Mountain, Compass } from "lucide-react";
import type { Municipality } from "../services/municipality.service";
import type { SubregionKey } from "./subregionFromMunicipio";
import { municipioToSubregion } from "./subregionFromMunicipio";
import { ensureArray } from "./ensureArray";

export interface SubregionMeta {
  key: SubregionKey;
  label: string;
  Icon: LucideIcon;
  shortDescription: string;
  longDescription: string;
  primaryHex: string;
  accentHex: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  ringClass: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
}

export const SUBREGION_META: Record<SubregionKey, SubregionMeta> = {
  atrato: {
    key: "atrato",
    label: "Atrato",
    Icon: Leaf,
    shortDescription: "Corazón cultural y selvático del Chocó",
    longDescription:
      "Cuna de Quibdó y atravesada por el río Atrato —sujeto de derechos desde 2016—. Escenario vivo de chirimía, gastronomía afrochocoana y saberes ancestrales.",
    primaryHex: "#D97706",
    accentHex: "#FCD34D",
    gradientFrom: "from-amber-400/80",
    gradientVia: "via-amber-300/50",
    gradientTo: "to-orange-200/30",
    ringClass: "ring-amber-400/40",
    badgeBg: "bg-amber-100/80",
    badgeText: "text-amber-800",
    cardBg: "bg-gradient-to-br from-amber-50 to-orange-50",
  },
  san_juan: {
    key: "san_juan",
    label: "San Juan",
    Icon: Gem,
    shortDescription: "Tierra de oro, platino y ríos centenarios",
    longDescription:
      "Región minera atravesada por el río San Juan, hogar del barequeo tradicional y de comunidades afro e indígenas que han cuidado estos cauces por siglos.",
    primaryHex: "#059669",
    accentHex: "#6EE7B7",
    gradientFrom: "from-emerald-400/80",
    gradientVia: "via-emerald-300/50",
    gradientTo: "to-green-200/30",
    ringClass: "ring-emerald-400/40",
    badgeBg: "bg-emerald-100/80",
    badgeText: "text-emerald-800",
    cardBg: "bg-gradient-to-br from-emerald-50 to-green-50",
  },
  pacifico_norte: {
    key: "pacifico_norte",
    label: "Pacífico Norte",
    Icon: Waves,
    shortDescription: "Ballenas jorobadas, surf y selvas húmedas",
    longDescription:
      "Nuquí, Bahía Solano y Juradó: santuario mundial de ballenas jorobadas, playas salvajes, surf de clase mundial y selva tropical húmeda.",
    primaryHex: "#7C3AED",
    accentHex: "#C4B5FD",
    gradientFrom: "from-violet-400/80",
    gradientVia: "via-purple-300/50",
    gradientTo: "to-fuchsia-200/30",
    ringClass: "ring-violet-400/40",
    badgeBg: "bg-violet-100/80",
    badgeText: "text-violet-800",
    cardBg: "bg-gradient-to-br from-violet-50 to-purple-50",
  },
  baudo: {
    key: "baudo",
    label: "Baudó",
    Icon: Mountain,
    shortDescription: "Selvas profundas entre mar y serranía",
    longDescription:
      "Entre la Serranía del Baudó y el Pacífico. Uno de los ecosistemas más biodiversos del planeta, hogar de pueblos Embera y comunidades afro aisladas.",
    primaryHex: "#2563EB",
    accentHex: "#93C5FD",
    gradientFrom: "from-blue-400/80",
    gradientVia: "via-sky-300/50",
    gradientTo: "to-cyan-200/30",
    ringClass: "ring-blue-400/40",
    badgeBg: "bg-blue-100/80",
    badgeText: "text-blue-800",
    cardBg: "bg-gradient-to-br from-blue-50 to-sky-50",
  },
  darien: {
    key: "darien",
    label: "Darién",
    Icon: Compass,
    shortDescription: "Caribe, frontera con Panamá y biodiversidad extrema",
    longDescription:
      "Acandí, Capurganá y Sapzurro: playas del Caribe colombiano, bosque húmedo tropical y el punto donde Suramérica se encuentra con Centroamérica.",
    primaryHex: "#EA580C",
    accentHex: "#FDBA74",
    gradientFrom: "from-orange-400/80",
    gradientVia: "via-orange-300/50",
    gradientTo: "to-rose-200/30",
    ringClass: "ring-orange-400/40",
    badgeBg: "bg-orange-100/80",
    badgeText: "text-orange-800",
    cardBg: "bg-gradient-to-br from-orange-50 to-rose-50",
  },
};

export const SUBREGION_ORDER: SubregionKey[] = [
  "atrato",
  "pacifico_norte",
  "san_juan",
  "baudo",
  "darien",
];

export function getMunicipalitiesBySubregion(
  municipalities: Municipality[],
  key: SubregionKey
): Municipality[] {
  return ensureArray<Municipality>(municipalities).filter(
    (m) => municipioToSubregion(m.name) === key
  );
}

export function getSubregionCounts(
  municipalities: Municipality[]
): Record<SubregionKey, number> {
  const base: Record<SubregionKey, number> = {
    atrato: 0,
    san_juan: 0,
    baudo: 0,
    pacifico_norte: 0,
    darien: 0,
  };
  for (const m of ensureArray<Municipality>(municipalities)) {
    base[municipioToSubregion(m.name)]++;
  }
  return base;
}
