import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MapPinned, PawPrint, Landmark, BookOpen, MountainSnow, PartyPopper,
  type LucideIcon,
} from "lucide-react";

const SECTIONS: { id: string; label: string; Icon: LucideIcon; path: string }[] = [
  { id: "mapa",     label: "Mapa",     Icon: MapPinned,    path: "/mapa"     },
  { id: "fauna",    label: "Fauna",    Icon: PawPrint,     path: "/animales" },
  { id: "cultura",  label: "Cultura",  Icon: Landmark,     path: "/cultura"  },
  { id: "historia", label: "Historia", Icon: BookOpen,     path: "/historia" },
  { id: "turismo",  label: "Turismo",  Icon: MountainSnow, path: "/turismo"  },
  { id: "fiestas",  label: "Fiestas",  Icon: PartyPopper,  path: "/fiesta"   },
];

export const SectionNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex-none min-w-0 px-4 pb-2">
      <div
        className="section-nav-scroll flex flex-nowrap items-center gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1 -mx-4 px-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {SECTIONS.map((section) => {
          const isActive = location.pathname === section.path;
          return (
            <Link
              key={section.id}
              to={section.path}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/80"
              }`}
            >
              <section.Icon size={13} />
              <span>{section.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
