import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FilterCategory } from "../../../types/filters";

interface FilterRailProps {
  currentFilter: FilterCategory;
  onFilterChange: (f: FilterCategory) => void;
  isExplorerOpen: boolean;
  isMobile: boolean;
  className?: string;
}

const FILTERS: { id: FilterCategory; icon: string; label: string }[] = [
  { id: "general", icon: "🏠", label: "Vista General" },
  { id: "indigenous", icon: "🏺", label: "Reservas Indígenas" },
  { id: "ethnic", icon: "👥", label: "Distribución Étnica" },
  { id: "tourism", icon: "🏖️", label: "Destinos" },
  { id: "animals", icon: "🐋", label: "Biodiversidad" },
  { id: "festivals", icon: "🎭", label: "Cultura Viva" },
];

export const FilterRail: React.FC<FilterRailProps> = ({
  currentFilter,
  onFilterChange,
  isExplorerOpen,
  isMobile,
  className = "",
}) => {
  if (isMobile) {
    return (
      <div
        className={`absolute bottom-0 left-0 right-0 ${className}`}
        style={{ zIndex: 1500 }}
      >
        <div
          className="mx-3 mb-3 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            scrollbarWidth: "none",
          }}
        >
          {FILTERS.map((f) => (
            <MobileFilterButton
              key={f.id}
              filter={f}
              isActive={currentFilter === f.id}
              onClick={() => onFilterChange(f.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop: vertical rail on left, shifts right when explorer is open
  return (
    <motion.div
      className={`absolute top-1/2 -translate-y-1/2 ${className}`}
      style={{ zIndex: 1500 }}
      animate={{ left: isExplorerOpen ? 356 : 16 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div
        className="p-1.5 rounded-2xl flex flex-col gap-1"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        }}
      >
        {FILTERS.map((f) => (
          <DesktopFilterButton
            key={f.id}
            filter={f}
            isActive={currentFilter === f.id}
            onClick={() => onFilterChange(f.id)}
          />
        ))}
      </div>
    </motion.div>
  );
};

const DesktopFilterButton: React.FC<{
  filter: { id: FilterCategory; icon: string; label: string };
  isActive: boolean;
  onClick: () => void;
}> = ({ filter, isActive, onClick }) => (
  <div className="relative group">
    <motion.button
      onClick={onClick}
      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-colors duration-200 ${
        isActive
          ? "bg-teal-50 shadow-sm"
          : "hover:bg-gray-100/80 text-gray-600"
      }`}
      style={
        isActive
          ? {
              boxShadow: "0 0 0 2px rgba(13,148,136,0.4)",
            }
          : {}
      }
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={filter.label}
    >
      {filter.icon}
    </motion.button>
    {/* Tooltip */}
    <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
      <div
        className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {filter.label}
      </div>
    </div>
  </div>
);

const MobileFilterButton: React.FC<{
  filter: { id: FilterCategory; icon: string; label: string };
  isActive: boolean;
  onClick: () => void;
}> = ({ filter, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-teal-500 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100/80"
    }`}
    whileTap={{ scale: 0.95 }}
  >
    <span>{filter.icon}</span>
    <AnimatePresence>
      {isActive && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="overflow-hidden whitespace-nowrap text-xs"
        >
          {filter.label}
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);
