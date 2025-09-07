import React, { useState, useEffect } from "react";
import type { Municipality } from "../../services/municipality.service";
import type { EthnicDistribution } from "../../services/ethnicDistribution.service";
import { ethnicDistributionService } from "../../services/ethnicDistribution.service";
import { EthnicDetails } from "./EthnicDetails";
import { EthnicFilters } from "./EthnicFilters";
import type {
  FilterCategory as FilterType,
  IndigenousReserve,
  TouristSpot,
} from "../../types/filters";
import type { WeatherData } from "../../services/weather.service";

interface InfoPanelProps {
  municipality?: Municipality;
  activeFilter?: FilterType;
  selectedReserves?: IndigenousReserve[];
  selectedSpots?: TouristSpot[];
  weatherData?: WeatherData;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  municipality,
  activeFilter = "general",
  selectedReserves = [],
  selectedSpots = [],
  weatherData,
}) => {
  const [ethnicDistributions, setEthnicDistributions] = useState<
    EthnicDistribution[]
  >([]);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [selectedRaceCodes, setSelectedRaceCodes] = useState<string[]>([
    "INDIGENA",
    "AFRO",
  ]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEthnicData = async () => {
      if (municipality?.cod_dane && activeFilter === "indigenous") {
        setIsLoading(true);
        try {
          const data =
            await ethnicDistributionService.getEthnicDistributionByMunicipality(
              municipality.cod_dane
            );
          setEthnicDistributions(data);

          // Obtener años únicos disponibles
          const years = Array.from(new Set(data.map((d) => d.year))).sort(
            (a, b) => b - a
          );
          setAvailableYears(years);

          // Establecer el año más reciente disponible
          if (years.length > 0) {
            setSelectedYear(years[0]);
          }
        } catch (error) {
          console.error("Error fetching ethnic data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEthnicData();
  }, [municipality?.cod_dane, activeFilter]);

  if (!municipality) {
    return null;
  }

  return (
    <div
      className="bg-white/98 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/40 p-5 space-y-4 max-h-[700px] overflow-y-auto transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] hover:border-gray-200/60 focus-within:shadow-[0_8px_40px_rgb(0,0,0,0.16)] focus-within:border-sky-200/60 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent motion-safe:animate-fadeIn"
      tabIndex={0}
      style={
        {
          "--scrollbar-color": "rgb(229 231 235)",
          "--scrollbar-track-color": "transparent",
        } as React.CSSProperties
      }
    >
      {/* Encabezado con datos principales */}
      <div className="bg-gradient-to-br from-sky-50 via-blue-50/30 to-transparent -mx-5 -mt-5 px-5 pt-5 pb-6 rounded-t-3xl border-b border-sky-100/30">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2
              className="text-xl font-semibold text-gray-800 group flex items-center gap-2"
              title={municipality.name}
            >
              {municipality.emoji && (
                <span
                  className="text-2xl"
                  role="img"
                  aria-label="Emoji representativo"
                >
                  {municipality.emoji}
                </span>
              )}
              <span className="transition-colors group-hover:text-gray-900">
                {municipality.name}
              </span>
            </h2>
            <p
              className="text-sm text-gray-600 flex items-center gap-1.5 group"
              title={`Zona: ${municipality.zone || "No especificada"}`}
            >
              <svg
                className="w-4 h-4 text-sky-500 transition-transform group-hover:scale-110"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="transition-colors group-hover:text-gray-700">
                Zona {municipality.zone || "No especificada"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Contenido según el filtro activo */}
      {activeFilter === "general" && weatherData && (
        <div className="space-y-4">
          {municipality.main_activity && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100/60">
              <h3 className="text-sm text-gray-500 mb-1">
                Actividad Principal
              </h3>
              <p className="text-gray-800">{municipality.main_activity}</p>
            </div>
          )}

          {municipality.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600">{municipality.description}</p>
            </div>
          )}

          {/* La información del clima ahora se muestra en el panel principal */}
        </div>
      )}

      {activeFilter === "indigenous" && (
        <div className="space-y-6">
          {/* Controles y Filtros */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/60">
            <EthnicFilters
              selectedRaceCodes={selectedRaceCodes}
              onRaceCodeChange={setSelectedRaceCodes}
              availableYears={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>

          {/* Detalles de Distribución Étnica */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando datos étnicos...</p>
            </div>
          ) : ethnicDistributions.length > 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/60">
              <EthnicDetails
                distributions={ethnicDistributions.filter((d) =>
                  selectedRaceCodes.includes(d.race_code)
                )}
                year={selectedYear}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se encontraron datos étnicos para este municipio
            </div>
          )}

          {/* Reservas Indígenas */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Reservas Indígenas
            </h3>
            {selectedReserves.length > 0 ? (
              selectedReserves.map((reserve) => (
                <div
                  key={reserve.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2"
                >
                  <h4 className="font-medium text-gray-800">{reserve.name}</h4>
                  {reserve.mainEthnicGroup && (
                    <p className="text-sm text-gray-600">
                      Etnia principal: {reserve.mainEthnicGroup}
                    </p>
                  )}
                  {reserve.population && (
                    <p className="text-sm text-gray-500">
                      Población: {reserve.population.toLocaleString()}{" "}
                      habitantes
                    </p>
                  )}
                  {reserve.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {reserve.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No hay reservas indígenas registradas en este municipio.
              </p>
            )}
          </div>
        </div>
      )}

      {activeFilter === "tourism" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">
            Lugares Turísticos
          </h3>
          {selectedSpots.length > 0 ? (
            selectedSpots.map((spot) => (
              <div
                key={spot.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {spot.imageUrl && (
                  <div className="aspect-video w-full">
                    <img
                      src={spot.imageUrl}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h4 className="font-medium text-gray-800">{spot.name}</h4>
                  <p className="text-sm text-gray-500">
                    {spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}
                  </p>
                  {spot.description && (
                    <p className="text-sm text-gray-600">{spot.description}</p>
                  )}
                  {spot.location && (
                    <p className="text-sm text-gray-500">
                      Ubicación: {spot.location}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No hay lugares turísticos registrados en este municipio.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
