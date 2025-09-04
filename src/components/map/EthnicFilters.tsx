import React from "react";
import { ethnicDistributionService } from "../../services/ethnicDistribution.service";

interface EthnicFiltersProps {
  selectedRaceCodes: string[];
  onRaceCodeChange: (raceCodes: string[]) => void;
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export const EthnicFilters: React.FC<EthnicFiltersProps> = ({
  selectedRaceCodes,
  onRaceCodeChange,
  availableYears,
  selectedYear,
  onYearChange,
}) => {
  const raceOptions = [
    "INDIGENA",
    "AFRO",
    "ROM",
    "RAIZAL",
    "PALENQUERO",
    "NINGUNO",
    "NO_INFORMA",
  ];

  const handleRaceToggle = (raceCode: string) => {
    if (selectedRaceCodes.includes(raceCode)) {
      onRaceCodeChange(selectedRaceCodes.filter((code) => code !== raceCode));
    } else {
      onRaceCodeChange([...selectedRaceCodes, raceCode]);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/60">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">
          Filtros de Visualización
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Personaliza la visualización de datos étnicos
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Selector de Año con diseño mejorado */}
        <div className="relative">
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-gray-700">
              Año de Referencia
            </span>
            <span className="text-xs text-gray-400">Datos censales</span>
          </label>
          <div className="mt-2 relative">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="w-full pl-4 pr-10 py-2.5 text-sm text-gray-900 rounded-lg bg-white/80 border border-gray-200 
                        appearance-none hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                        transition-all duration-200"
            >
              {availableYears.map((year) => (
                <option key={year} value={year} className="py-2">
                  {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtros de Grupos Étnicos con diseño mejorado */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Grupos Étnicos
            </label>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
              {selectedRaceCodes.length} seleccionados
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {raceOptions.map((raceCode) => {
              const isSelected = selectedRaceCodes.includes(raceCode);
              return (
                <button
                  key={raceCode}
                  onClick={() => handleRaceToggle(raceCode)}
                  className={`relative group px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 
                    flex items-center gap-2.5 hover:shadow-md
                    ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-50 to-sky-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ring-2 transition-all duration-300 
                      ${
                        isSelected
                          ? "ring-blue-400 ring-offset-2"
                          : "ring-gray-300"
                      }`}
                    style={{
                      backgroundColor:
                        ethnicDistributionService.getRaceColor(raceCode),
                    }}
                  />
                  <span className="truncate flex-1">
                    {ethnicDistributionService.getRaceLabel(raceCode)}
                  </span>
                  {isSelected && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leyenda de Visualización con diseño mejorado */}
        <div className="bg-gradient-to-br from-gray-50 to-transparent rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="text-sm font-medium text-gray-700">
              Información Visual
            </h4>
          </div>
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 group">
              <div className="w-24 h-2.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded-full shadow-sm transition-all duration-300 group-hover:shadow-md" />
              <span className="text-xs text-gray-600 transition-colors group-hover:text-gray-700">
                Distribución porcentual
              </span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-6 h-6 rounded-full border-2 border-blue-500 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-blue-600" />
              <span className="text-xs text-gray-600 transition-colors group-hover:text-gray-700">
                Ubicación actual
              </span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-6 h-6 rounded-full bg-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:bg-gray-300" />
              <span className="text-xs text-gray-600 transition-colors group-hover:text-gray-700">
                Sin información disponible
              </span>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <svg
                className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="leading-relaxed">
                Los datos mostrados corresponden al censo poblacional realizado
                por el DANE. Selecciona múltiples grupos étnicos para comparar
                su distribución.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
