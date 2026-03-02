import React from "react";
import type { Municipality } from "../../../services/municipality.service";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";
import type { FilterCategory } from "../../../types/filters";
import { MunicipalityDetail } from "../detail/MunicipalityDetail";
import { ReserveDetail } from "../detail/ReserveDetail";
import { EthnicDetail } from "../detail/EthnicDetail";

interface DetailViewProps {
  currentFilter: FilterCategory;
  selectedMunicipality: Municipality | null;
  selectedReserve: IndigenousReserve | null;
  onBack: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  currentFilter,
  selectedMunicipality,
  selectedReserve,
  onBack,
}) => {
  const renderContent = () => {
    if (currentFilter === "ethnic") {
      return (
        <EthnicDetail
          codDane={selectedMunicipality?.cod_dane}
          municipalityName={selectedMunicipality?.name}
        />
      );
    }
    if (currentFilter === "indigenous" && selectedReserve) {
      return <ReserveDetail reserve={selectedReserve} />;
    }
    if (selectedMunicipality) {
      return <MunicipalityDetail municipality={selectedMunicipality} />;
    }
    return null;
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Back button */}
      <div className="flex-none px-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors duration-150 -ml-1 py-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver a la lista</span>
        </button>
      </div>

      {/* Detail content */}
      <div className="flex-1 overflow-hidden">{content}</div>
    </div>
  );
};
