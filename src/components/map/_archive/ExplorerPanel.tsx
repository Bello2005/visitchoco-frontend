import React from "react";
import { motion } from "framer-motion";
import type { Municipality } from "../../../services/municipality.service";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";
import type { FilterCategory } from "../../../types/filters";

interface ExplorerPanelProps {
  municipalities: Municipality[];
  reserves: IndigenousReserve[];
  currentFilter: FilterCategory;
  selectedMunicipality: Municipality | null;
  selectedReserve: IndigenousReserve | null;
  onSelectMunicipality: (m: Municipality) => void;
  onSelectReserve: (r: IndigenousReserve) => void;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  className?: string;
}

const panelVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const listContainerVariants = {
  visible: { transition: { staggerChildren: 0.04 } },
};
const listItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

export const ExplorerPanel: React.FC<ExplorerPanelProps> = ({
  municipalities,
  reserves,
  currentFilter,
  selectedMunicipality,
  selectedReserve,
  onSelectMunicipality,
  onSelectReserve,
  onClose,
  searchQuery,
  onSearchChange,
  className = "",
}) => {
  const isIndigenous = currentFilter === "indigenous";
  const q = searchQuery.toLowerCase().trim();

  const filteredMunicipalities = municipalities.filter((m) => {
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.zone?.toLowerCase().includes(q) ||
      m.main_activity?.toLowerCase().includes(q)
    );
  });

  const filteredReserves = reserves.filter((r) => {
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.indigenous_people?.toLowerCase().includes(q)
    );
  });

  const count = isIndigenous ? filteredReserves.length : filteredMunicipalities.length;
  const totalCount = isIndigenous ? reserves.length : municipalities.length;

  return (
    <motion.div
      className={`absolute top-0 left-0 h-full w-[340px] flex flex-col overflow-hidden ${className}`}
      style={{ zIndex: 1400 }}
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        className="flex flex-col h-full"
        style={{
          background: "rgba(255,255,255,0.90)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.4)",
          boxShadow: "4px 0 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex-none px-4 pt-5 pb-3 border-b border-gray-100/60">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                {isIndigenous ? "Reservas Indígenas" : "Municipios del Chocó"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {count === totalCount
                  ? `${totalCount} ${isIndigenous ? "reservas" : "municipios"}`
                  : `${count} de ${totalCount} resultados`}
              </p>
            </div>
            <motion.button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors duration-150"
              whileTap={{ scale: 0.9 }}
              aria-label="Cerrar panel"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isIndigenous ? "Buscar reserva..." : "Buscar municipio..."}
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-300 placeholder-gray-400 transition-all duration-200"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div
          className="flex-1 overflow-y-auto p-3 custom-scrollbar"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(156,163,175,0.3) transparent" }}
        >
          {isIndigenous ? (
            filteredReserves.length === 0 ? (
              <EmptyState onClear={() => onSearchChange("")} query={searchQuery} />
            ) : (
              <motion.ul
                className="space-y-1"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredReserves.map((reserve) => (
                  <motion.li key={reserve.id} variants={listItemVariants}>
                    <ReserveItem
                      reserve={reserve}
                      isSelected={selectedReserve?.id === reserve.id}
                      onClick={() => onSelectReserve(reserve)}
                    />
                  </motion.li>
                ))}
              </motion.ul>
            )
          ) : filteredMunicipalities.length === 0 ? (
            <EmptyState onClear={() => onSearchChange("")} query={searchQuery} />
          ) : (
            <motion.ul
              className="space-y-1"
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredMunicipalities.map((m) => (
                <motion.li key={m.id} variants={listItemVariants}>
                  <MunicipalityItem
                    municipality={m}
                    isSelected={selectedMunicipality?.id === m.id}
                    onClick={() => onSelectMunicipality(m)}
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MunicipalityItem: React.FC<{
  municipality: Municipality;
  isSelected: boolean;
  onClick: () => void;
}> = ({ municipality, isSelected, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`w-full px-3 py-2.5 rounded-xl text-left transition-colors duration-150 relative ${
      isSelected
        ? "bg-gradient-to-r from-teal-50 to-transparent"
        : "hover:bg-gray-50/80"
    }`}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
  >
    {isSelected && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-teal-500 rounded-full" />
    )}
    <div className="flex items-center gap-2.5 pl-1">
      <span className="text-lg flex-shrink-0">{municipality.emoji || "📍"}</span>
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${isSelected ? "text-teal-700" : "text-gray-800"}`}>
          {municipality.name}
        </p>
        {municipality.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            {municipality.description}
          </p>
        )}
      </div>
      <motion.span
        className={`flex-shrink-0 text-xs ${isSelected ? "text-teal-500" : "text-gray-300"}`}
        animate={{ rotate: isSelected ? 90 : 0 }}
      >
        →
      </motion.span>
    </div>
  </motion.button>
);

const ReserveItem: React.FC<{
  reserve: IndigenousReserve;
  isSelected: boolean;
  onClick: () => void;
}> = ({ reserve, isSelected, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`w-full px-3 py-2.5 rounded-xl text-left transition-colors duration-150 relative ${
      isSelected
        ? "bg-gradient-to-r from-amber-50 to-transparent"
        : "hover:bg-gray-50/80"
    }`}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
  >
    {isSelected && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-amber-500 rounded-full" />
    )}
    <div className="flex items-center gap-2.5 pl-1">
      <span className="text-lg flex-shrink-0">🏺</span>
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${isSelected ? "text-amber-700" : "text-gray-800"}`}>
          {reserve.name}
        </p>
        {reserve.indigenous_people && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {reserve.indigenous_people}
          </p>
        )}
      </div>
    </div>
  </motion.button>
);

const EmptyState: React.FC<{ onClear: () => void; query: string }> = ({ onClear, query }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <span className="text-3xl mb-3">🔍</span>
    <p className="text-sm text-gray-500 mb-1">Sin resultados para</p>
    <p className="text-sm font-medium text-gray-700 mb-4">"{query}"</p>
    <button
      onClick={onClear}
      className="px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors duration-150"
    >
      Limpiar búsqueda
    </button>
  </div>
);
