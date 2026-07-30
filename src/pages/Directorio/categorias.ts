import {
  BedDouble,
  UtensilsCrossed,
  Flame,
  Compass,
  MapPinned,
  CakeSlice,
  Wine,
  Store,
  type LucideIcon,
} from "lucide-react";

/** Values idénticos a los del admin */
export interface CategoriaDef {
  value: string;
  label: string;
  Icon: LucideIcon;
  accent: string;
  /** gradiente para placeholders de foto */
  gradient: string;
}

export const CATEGORIAS: CategoriaDef[] = [
  { value: "hotel",          label: "Hotel",             Icon: BedDouble,       accent: "#0ea5e9", gradient: "linear-gradient(135deg, #082f49 0%, #0c4a6e 55%, #075985 100%)" },
  { value: "restaurante",    label: "Restaurante",       Icon: UtensilsCrossed, accent: "#f59e0b", gradient: "linear-gradient(135deg, #451a03 0%, #78350f 55%, #92400e 100%)" },
  { value: "fritanga",       label: "Fritanga",          Icon: Flame,           accent: "#ef4444", gradient: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 55%, #991b1b 100%)" },
  { value: "agencia_viajes", label: "Agencia de viajes", Icon: Compass,         accent: "#10b981", gradient: "linear-gradient(135deg, #022c22 0%, #064e3b 55%, #065f46 100%)" },
  { value: "guia_turismo",   label: "Guía de turismo",   Icon: MapPinned,       accent: "#8b5cf6", gradient: "linear-gradient(135deg, #2e1065 0%, #4c1d95 55%, #5b21b6 100%)" },
  { value: "pasteleria",     label: "Pastelería",        Icon: CakeSlice,       accent: "#ec4899", gradient: "linear-gradient(135deg, #500724 0%, #831843 55%, #9d174d 100%)" },
  { value: "viche_licores",  label: "Viche & licores",   Icon: Wine,            accent: "#84cc16", gradient: "linear-gradient(135deg, #1a2e05 0%, #365314 55%, #3f6212 100%)" },
  { value: "otro",           label: "Otro",              Icon: Store,           accent: "#64748b", gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%)" },
];

const FALLBACK = CATEGORIAS[CATEGORIAS.length - 1];

export function categoriaDef(value: string | null | undefined): CategoriaDef {
  return CATEGORIAS.find((c) => c.value === value) ?? FALLBACK;
}
