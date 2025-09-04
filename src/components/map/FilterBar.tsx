import React, { useState } from "react";
import type { Filter, FilterCategory } from "../../types/filters";
import { motion, AnimatePresence } from "framer-motion";

interface FilterBarProps {
  selectedFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  onSearch: (searchTerm: string) => void;
  searchValue?: string; // Valor controlado desde fuera
  isExternalSelection?: boolean; // Indica si la selección vino del mapa
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedFilter,
  onFilterChange,
  onSearch,
  searchValue: externalSearchValue = "",
  isExternalSelection = false,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [internalSearchValue, setInternalSearchValue] =
    useState(externalSearchValue);
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);
  const [lastExternalFilter, setLastExternalFilter] =
    useState<FilterCategory | null>(null);

  // Sincronizar el valor interno con el externo
  React.useEffect(() => {
    setInternalSearchValue(externalSearchValue);
  }, [externalSearchValue]);

  // Efecto para manejar la selección externa
  React.useEffect(() => {
    if (isExternalSelection && selectedFilter !== lastExternalFilter) {
      setLastExternalFilter(selectedFilter);
      // Aseguramos que el filtro sea visible scrollando hasta él
      const filterElement = document.getElementById(`filter-${selectedFilter}`);
      if (filterElement) {
        filterElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedFilter, isExternalSelection, lastExternalFilter]);

  const filters: Filter[] = [
    {
      id: "general",
      name: "Vista General",
      category: "general",
      icon: "🏠",
      description: "Descubre la esencia del Chocó",
    },
    {
      id: "indigenous",
      name: "Reservas Indígenas",
      category: "indigenous",
      icon: "🏺",
      description: "Zonas protegidas de comunidades indígenas",
    },
    {
      id: "ethnic",
      name: "Distribución Étnica",
      category: "ethnic",
      icon: "👥",
      description: "Población y etnias",
    },
    {
      id: "tourism",
      name: "Destinos",
      category: "tourism",
      icon: "🏖️",
      description: "Experiencias únicas",
    },
    {
      id: "animals",
      name: "Biodiversidad",
      category: "animals",
      icon: "🐋",
      description: "Riqueza natural",
    },
    {
      id: "festivals",
      name: "Cultura Viva",
      category: "festivals",
      icon: "🎭",
      description: "Tradición y celebración",
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInternalSearchValue(value);
    onSearch(value);
  };

  return (
    <div className="px-4 py-3">
      {/* Search Bar - Más compacta y con mejor contraste */}
      <div className="relative mb-4">
        <input
          type="text"
          value={internalSearchValue}
          placeholder="Buscar en el Chocó..."
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="w-full h-10 pl-10 pr-4 text-sm bg-white/95 border border-gray-200 
                   rounded-lg shadow-sm transition-all duration-200
                   focus:ring-1 focus:ring-blue-400 focus:border-blue-400
                   placeholder:text-gray-400"
        />
        <svg
          className={`absolute left-3 top-[13px] w-4 h-4 transition-colors duration-200
                     ${isSearchFocused ? "text-blue-500" : "text-gray-400"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Filter Bar - Diseño más compacto y eficiente */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter.category;
          const isActiveAndExternal = isSelected && isExternalSelection;
          const buttonClass = isSelected
            ? "relative flex items-center gap-2 px-3 py-2 min-w-fit rounded-lg border transition-all duration-200 bg-blue-50 border-blue-200 text-blue-700"
            : "relative flex items-center gap-2 px-3 py-2 min-w-fit rounded-lg border transition-all duration-200 bg-white border-gray-200 text-gray-700 hover:bg-gray-50";

          return (
            <motion.button
              id={`filter-${filter.category}`}
              key={filter.id}
              onClick={() => onFilterChange(filter.category)}
              onMouseEnter={() => setHoveredFilter(filter.id)}
              onMouseLeave={() => setHoveredFilter(null)}
              animate={
                isActiveAndExternal
                  ? {
                      scale: [1, 1.05, 1],
                      transition: { duration: 0.3 },
                    }
                  : undefined
              }
              className={buttonClass}
            >
              <span className="text-lg" role="img" aria-label={filter.name}>
                {filter.icon}
              </span>
              <span className="text-sm font-medium whitespace-nowrap">
                {filter.name}
              </span>

              <AnimatePresence>
                {hoveredFilter === filter.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-1/2 transform -translate-x-1/2 mt-16 
                             px-3 py-2 bg-gray-800 text-white text-xs rounded-lg
                             shadow-lg z-50 whitespace-nowrap"
                  >
                    {filter.description}
                    <div
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                                  border-4 border-transparent border-b-gray-800"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {isActiveAndExternal && (
                <motion.span
                  className="absolute inset-0 border-2 rounded-lg border-blue-400"
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 1, repeat: 1 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Estilos para ocultar scrollbar */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `,
        }}
      />
    </div>
  );
};
