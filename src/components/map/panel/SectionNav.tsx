import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPinned,
  PawPrint,
  Landmark,
  BookOpen,
  MountainSnow,
  PartyPopper,
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

const EDGE_MASK =
  "linear-gradient(to right, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%)";

export const SectionNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      aria-label="Secciones principales"
      className="flex-none min-w-0 px-4 pb-2.5"
    >
      <div
        className="section-nav-scroll flex flex-nowrap items-center gap-0.5 overflow-x-auto overflow-y-hidden overscroll-x-contain -mx-1 px-1 py-0.5"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
        role="tablist"
      >
        {SECTIONS.map((section) => {
          const isActive = location.pathname === section.path;
          return (
            <Link
              key={section.id}
              to={section.path}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors duration-150 ${
                isActive
                  ? "text-teal-700"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="section-nav-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-teal-50 to-teal-100/90 ring-1 ring-teal-500/20"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  aria-hidden
                />
              )}
              <section.Icon
                size={14}
                strokeWidth={2.25}
                className="relative z-10"
              />
              <span className="relative z-10">{section.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
