import React from "react";
import type { FilterCategory } from "../../../types/filters";

interface FilterChipsProps {
  currentFilter: FilterCategory;
  onFilterChange: (f: FilterCategory) => void;
}

const FILTERS: { id: FilterCategory; label: string }[] = [
  { id: "general", label: "General" },
  { id: "indigenous", label: "Reservas" },
  { id: "ethnic", label: "Etnias" },
  { id: "tourism", label: "Turismo" },
  { id: "animals", label: "Fauna" },
  { id: "festivals", label: "Cultura" },
];

export const FilterChips: React.FC<FilterChipsProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex-none px-4 pb-3">
      <div
        className="flex items-center gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {FILTERS.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-teal-500 text-white shadow-sm"
                  : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/80"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
