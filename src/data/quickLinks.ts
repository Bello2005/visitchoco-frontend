import {
  Home,
  MapPinned,
  PawPrint,
  Landmark,
  BookOpen,
  MountainSnow,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

export interface QuickLink {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  accent: string;
  desc: string;
}

export const QUICK_LINKS: QuickLink[] = [
  { id: "inicio",   label: "Inicio",   path: "/",         icon: Home,         accent: "#1a5c45", desc: "Landing · presentación del Chocó"     },
  { id: "mapa",     label: "Mapa",     path: "/mapa",     icon: MapPinned,    accent: "#0D9488", desc: "31 municipios · reservas indígenas"    },
  { id: "animales", label: "Fauna",    path: "/animales", icon: PawPrint,     accent: "#34D399", desc: "577 aves · ballenas · jaguares"        },
  { id: "cultura",  label: "Cultura",  path: "/cultura",  icon: Landmark,     accent: "#F59E0B", desc: "PES · Chirimía · patrimonio inmaterial" },
  { id: "historia", label: "Historia", path: "/historia", icon: BookOpen,     accent: "#B45309", desc: "Cimarronaje · personajes · Atrato"     },
  { id: "turismo",  label: "Turismo",  path: "/turismo",  icon: MountainSnow, accent: "#0EA5E9", desc: "Destinos · ballenas · RNT"             },
  { id: "fiestas",  label: "Fiestas",  path: "/fiestas",  icon: PartyPopper,  accent: "#F59E0B", desc: "San Pacho UNESCO · calendario"         },
];
