export type SubregionKey = "atrato" | "san_juan" | "baudo" | "pacifico_norte" | "darien";

const MUNICIPIO_SUBREGION: Record<string, SubregionKey> = {
  Quibdó: "atrato",
  Bagadó: "atrato",
  Istmina: "atrato",
  Condoto: "atrato",
  Cértegui: "atrato",
  "Medio Atrato": "atrato",
  Atrato: "atrato",
  "San José del Palmar": "san_juan",
  Tadó: "san_juan",
  "Unión Panamericana": "san_juan",
  Lloró: "san_juan",
  Bojayá: "san_juan",
  "Medio San Juan": "san_juan",
  Nuquí: "pacifico_norte",
  "Bahía Solano": "pacifico_norte",
  Juradó: "pacifico_norte",
  "Río Quito": "pacifico_norte",
  Unguía: "darien",
  Acandí: "darien",
  Riosucio: "darien",
  "Bajo Baudó": "baudo",
  Pizarro: "baudo",
};

export function municipioToSubregion(municipio: string | null | undefined): SubregionKey {
  if (typeof municipio !== "string") return "atrato";
  const key = municipio.trim();
  if (!key) return "atrato";
  const base = key.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return MUNICIPIO_SUBREGION[key] ?? MUNICIPIO_SUBREGION[base] ?? "atrato";
}

export function subregionDotClass(sub: SubregionKey): string {
  switch (sub) {
    case "atrato":
      return "bg-amber-500";
    case "san_juan":
      return "bg-emerald-500";
    case "baudo":
      return "bg-blue-500";
    case "pacifico_norte":
      return "bg-purple-500";
    case "darien":
      return "bg-orange-500";
    default:
      return "bg-amber-500";
  }
}

export function subregionLabel(sub: SubregionKey): string {
  switch (sub) {
    case "atrato":
      return "Atrato";
    case "san_juan":
      return "San Juan";
    case "baudo":
      return "Baudó";
    case "pacifico_norte":
      return "Pacífico Norte";
    case "darien":
      return "Darién";
    default:
      return "Atrato";
  }
}
