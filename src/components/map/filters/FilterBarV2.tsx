import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FilterCategory } from '../../../types/filters';

interface Filter {
  id: FilterCategory;
  name: string;
  icon: string;
  description: string;
  category: string;
}

interface FilterBarProps {
  selectedFilter: FilterCategory;
  searchValue: string;
  onFilterChange: (filter: FilterCategory) => void;
  onSearch: (value: string) => void;
  isExternalSelection?: boolean;
}

export const FilterBarV2: React.FC<FilterBarProps> = ({
  selectedFilter,
  searchValue,
  onFilterChange,
  onSearch,
  isExternalSelection = false,
}) => {
  const [activeFilter, setActiveFilter] = useState(selectedFilter);
  const [lastExternalFilter, setLastExternalFilter] = useState<FilterCategory | null>(null);

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
      description: "Composición étnica de la población",
    },
    {
      id: "tourism",
      name: "Destinos",
      category: "tourism",
      icon: "🏖️",
      description: "Lugares turísticos y actividades",
    },
    {
      id: "animals",
      name: "Biodiversidad",
      category: "animals",
      icon: "🐋",
      description: "Fauna y vida silvestre",
    },
    {
      id: "festivals",
      name: "Cultura Viva",
      category: "festivals",
      icon: "🎭",
      description: "Festivales y tradiciones",
    },
  ];

  useEffect(() => {
    setActiveFilter(selectedFilter);
  }, [selectedFilter]);

  useEffect(() => {
    if (isExternalSelection && selectedFilter !== lastExternalFilter) {
      setLastExternalFilter(selectedFilter);
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

  return (
    <div className="px-4 py-3">
      {/* Search input with modern design */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar en el Chocó..."
          className="w-full px-4 py-2.5 pl-10 pr-4 text-sm bg-gray-100 rounded-xl 
                     focus:outline-none placeholder-gray-500 transition-all duration-200"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
      </div>

      {/* Filter buttons with modern design */}
      <div className="grid grid-cols-2 gap-3">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            id={`filter-${filter.id}`}
            onClick={() => {
              setActiveFilter(filter.id);
              onFilterChange(filter.id);
            }}
            className={`relative group flex items-center gap-3 p-3 rounded-xl text-left
                       transition-all duration-200
                       ${
                         activeFilter === filter.id
                           ? "bg-white text-gray-900"
                           : "bg-gray-300/40 text-gray-700 hover:bg-gray-200/50"
                       }
                       focus:outline-none`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Icon */}
            <span className="text-xl">{filter.icon}</span>
            
            {/* Label */}
            <span className="text-sm font-medium flex-1">
              {filter.name}
            </span>

            {/* Arrow indicator */}
            {activeFilter === filter.id && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-blue-600"
              >
                →
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default FilterBarV2;
