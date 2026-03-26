import React from "react";
import type { Municipality } from "../../../services/municipality.service";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";
import type { FilterCategory } from "../../../types/filters";

interface ItemListProps {
  municipalities: Municipality[];
  reserves: IndigenousReserve[];
  currentFilter: FilterCategory;
  selectedMunicipality: Municipality | null;
  selectedReserve: IndigenousReserve | null;
  searchQuery: string;
  onSelectMunicipality: (m: Municipality) => void;
  onSelectReserve: (r: IndigenousReserve) => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  municipalities,
  reserves,
  currentFilter,
  selectedMunicipality,
  selectedReserve,
  searchQuery,
  onSelectMunicipality,
  onSelectReserve,
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

  const items = isIndigenous ? filteredReserves : filteredMunicipalities;
  const total = isIndigenous ? reserves.length : municipalities.length;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Count header */}
      <div className="flex-none px-4 pb-2">
        <p className="text-xs text-gray-400">
          {items.length === total
            ? `${total} ${isIndigenous ? "reservas" : "municipios"}`
            : `${items.length} de ${total} resultados`}
        </p>
      </div>

      {/* Scrollable list */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(156,163,175,0.25) transparent" }}
      >
        {items.length === 0 ? (
          <EmptyState query={searchQuery} />
        ) : isIndigenous ? (
          <ul className="space-y-1">
            {filteredReserves.map((reserve) => (
              <li key={reserve.id}>
                <ReserveItem
                  reserve={reserve}
                  isSelected={selectedReserve?.id === reserve.id}
                  onClick={() => onSelectReserve(reserve)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-1">
            {filteredMunicipalities.map((m) => (
              <li key={m.id}>
                <MunicipalityItem
                  municipality={m}
                  isSelected={selectedMunicipality?.id === m.id}
                  onClick={() => onSelectMunicipality(m)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const MunicipalityItem: React.FC<{
  municipality: Municipality;
  isSelected: boolean;
  onClick: () => void;
}> = ({ municipality, isSelected, onClick }) => {
  const PCI_UNESCO = ["Quibdó"];
  const PCI_NACIONAL = ["Medio San Juan"];

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-3 rounded-lg text-left transition-all duration-150 relative group ${
        isSelected
          ? "bg-teal-50/80"
          : "hover:bg-gray-50/80"
      }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-teal-500 rounded-full" />
      )}
      <div className="flex items-center gap-2.5">
        {municipality.image_url ? (
          <img
            src={municipality.image_url}
            alt={municipality.name}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl bg-teal-50">
            {municipality.emoji || "📍"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <p className={`text-sm font-medium truncate ${isSelected ? "text-teal-700" : "text-gray-800"}`}>
              {municipality.name}
            </p>
            {PCI_UNESCO.includes(municipality.name) && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-1 font-semibold flex-shrink-0">
                UNESCO
              </span>
            )}
            {PCI_NACIONAL.includes(municipality.name) && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0">
                PCI
              </span>
            )}
          </div>
        {municipality.description?.trim() ? (
          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
            {municipality.description}
          </p>
        ) : (
          <p className="text-[11px] text-[#6b7280] italic mt-0.5">
            Próximamente
          </p>
        )}
      </div>
      <svg
        className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
          isSelected ? "text-teal-400" : "text-gray-300 group-hover:text-gray-400"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
  );
};

const ReserveItem: React.FC<{
  reserve: IndigenousReserve;
  isSelected: boolean;
  onClick: () => void;
}> = ({ reserve, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full px-3 py-3 rounded-lg text-left transition-all duration-150 relative group ${
      isSelected
        ? "bg-amber-50/80"
        : "hover:bg-gray-50/80"
    }`}
  >
    {isSelected && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-amber-500 rounded-full" />
    )}
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
        <span className="text-xs">🏺</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${isSelected ? "text-amber-700" : "text-gray-800"}`}>
          {reserve.name}
        </p>
        {reserve.indigenous_people && (
          <p className="text-[11px] text-gray-400 truncate mt-0.5">
            {reserve.indigenous_people}
          </p>
        )}
      </div>
      <svg
        className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
          isSelected ? "text-amber-400" : "text-gray-300 group-hover:text-gray-400"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

const EmptyState: React.FC<{ query: string }> = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <p className="text-sm text-gray-500">Sin resultados para</p>
    <p className="text-sm font-medium text-gray-700 mt-0.5">"{query}"</p>
  </div>
);
