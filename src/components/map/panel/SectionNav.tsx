import React from "react";
import { Link, useLocation } from "react-router-dom";

const SECTIONS = [
  { id: "mapa", label: "Mapa", icon: "🗺️", path: "/mapa" },
  { id: "animales", label: "Animales", icon: "🦋", path: "/animales" },
  { id: "turismo", label: "Turismo", icon: "🏖️", path: "/turismo" },
  { id: "fiestas", label: "Fiestas", icon: "🎭", path: "/fiesta" },
];

export const SectionNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex-none px-4 pb-2">
      <div className="flex items-center gap-1">
        {SECTIONS.map((section) => {
          const isActive = location.pathname === section.path;
          return (
            <Link
              key={section.id}
              to={section.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/80"
              }`}
            >
              <span className="text-sm">{section.icon}</span>
              <span>{section.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
