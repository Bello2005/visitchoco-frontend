import React, { useState, useEffect } from "react";
import type { Municipality } from "../../services/municipality.service";
import type { IndigenousReserve } from "../../services/indigenousReserve.service";
import type { FilterCategory } from "../../types/filters";
import type { WeatherData } from "../../services/weather.service";
import { weatherService } from "../../services/weather.service";
import SimpleMunicipalitiesList from "../map/SimpleMunicipalitiesList";
import InfoPanel from "./InfoPanel";
import { IndigenousReserveDetails } from "./IndigenousReserveDetails";
import { FilterBarV2 } from "./filters/FilterBarV2";
import { EthnicFilter } from "./filters/EthnicFilter";

interface DesktopPanelsProps {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  onSelectMunicipality: (municipality: Municipality) => void;
  onReset: () => void;
  onFilterChange?: (filter: FilterCategory) => void;
  currentFilter?: FilterCategory;
  reserves?: IndigenousReserve[];
  selectedReserve?: IndigenousReserve | null;
  onSelectReserve?: (reserve: IndigenousReserve) => void;
}

export const DesktopPanels: React.FC<DesktopPanelsProps> = ({
  municipalities,
  selectedMunicipality,
  onSelectMunicipality,
  onReset,
  onFilterChange,
  currentFilter = "general",
  reserves = [],
  selectedReserve = null,
  onSelectReserve,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExternalSelection, setIsExternalSelection] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const selectedFilter = currentFilter || "general";

  // Efecto para cargar datos del clima cuando se selecciona un municipio
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (selectedMunicipality?.lat && selectedMunicipality?.lon) {
        setIsLoadingWeather(true);
        try {
          const data = await weatherService.getCurrentWeather(
            selectedMunicipality.lat,
            selectedMunicipality.lon
          );
          setWeatherData(data);
        } catch (error) {
          console.error("Error al obtener datos del clima:", error);
          setWeatherData(null);
        } finally {
          setIsLoadingWeather(false);
        }
      } else {
        setWeatherData(null);
      }
    };

    fetchWeatherData();
  }, [selectedMunicipality?.lat, selectedMunicipality?.lon]);

  // Efecto para manejar la selección desde el mapa
  React.useEffect(() => {
    if (selectedMunicipality) {
      setIsExternalSelection(true);
    } else {
      setIsExternalSelection(false);
    }
  }, [selectedMunicipality]);

  // Filtrar municipios según el término de búsqueda
  const filteredMunicipalities = municipalities.filter((municipality) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      municipality.name.toLowerCase().includes(searchLower) ||
      municipality.description?.toLowerCase().includes(searchLower) ||
      municipality.zone?.toLowerCase().includes(searchLower) ||
      municipality.main_activity?.toLowerCase().includes(searchLower)
    );
  });

  const renderMunicipalitiesList = () => {
    if (filteredMunicipalities.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">🔍</div>
          <p className="text-gray-500">
            No se encontraron municipios que coincidan con "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      );
    }

    return (
      <SimpleMunicipalitiesList
        municipalities={filteredMunicipalities}
        selectedMunicipality={selectedMunicipality}
        onSelectMunicipality={onSelectMunicipality}
      />
    );
  };

  const renderWeatherWidget = () => {
    if (!selectedMunicipality || !weatherData) return null;

    return (
      <div
        className="mt-4 bg-gradient-to-r from-blue-50/50 to-sky-50/50 rounded-2xl p-4 border border-blue-100/20 hover:border-blue-200/30 transition-all duration-300 group/weather"
        role="region"
        aria-label="Información del clima"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800 transition-colors group-hover/weather:text-gray-900">
                {weatherData.temp}°C
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600" title="Sensación térmica">
                Sensación térmica: {weatherData.feels_like}°C
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="text-sm text-gray-600" title="Nivel de humedad">
                  Humedad: {weatherData.humidity}%
                </div>
                <div
                  className="text-sm text-gray-600"
                  title="Velocidad del viento"
                >
                  • Viento: {weatherData.wind_speed} m/s
                </div>
              </div>
            </div>
          </div>
          <div
            className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-300/20 flex items-center justify-center transition-transform duration-300 group-hover/weather:scale-110 hover:rotate-45"
            aria-hidden="true"
          >
            {weatherData.icon && (
              <img
                src={weatherService.getWeatherIconUrl(weatherData.icon)}
                alt={weatherData.description}
                className="w-10 h-10"
              />
            )}
          </div>
        </div>
        {weatherData.description && (
          <div className="mt-3 space-y-2">
            <div className="text-sm text-gray-600 bg-white/50 p-2 rounded-xl border border-gray-100/60 transition-all duration-300 group-hover/weather:border-gray-200/80 group-hover/weather:bg-white/80 capitalize">
              {weatherData.description}
            </div>
            <div className="text-xs text-gray-500 text-right">
              Datos proporcionados por{" "}
              <a
                href="https://openweathermap.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition-colors"
              >
                OpenWeatherMap
              </a>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMunicipalityInfo = () => {
    if (!selectedMunicipality) return null;

    return (
      <>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 group flex items-center gap-2">
              {selectedMunicipality.emoji && (
                <span
                  className="text-2xl"
                  role="img"
                  aria-label="Emoji representativo"
                >
                  {selectedMunicipality.emoji}
                </span>
              )}
              <span className="transition-colors group-hover:text-gray-900">
                {selectedMunicipality.name}
              </span>
            </h2>
            <p className="text-sm text-gray-600 flex items-center gap-1.5 group">
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
                Zona {selectedMunicipality.zone || "No especificada"}
              </span>
            </p>
          </div>
          {selectedMunicipality.main_activity && (
            <div className="flex items-center gap-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-sm border border-gray-100/60">
                <div className="text-xs text-gray-500 mb-0.5">
                  Actividad Principal
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {selectedMunicipality.main_activity}
                </div>
              </div>
            </div>
          )}
        </div>
        {renderWeatherWidget()}
      </>
    );
  };

  const renderDetailedInfo = () => {
    if (!selectedMunicipality) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between group/info">
          <h3 className="text-lg font-semibold text-gray-800 transition-colors group-hover/info:text-gray-900 flex items-center gap-2">
            Información Detallada
            {selectedMunicipality.description && (
              <div className="relative">
                <div
                  className="h-8 w-8 rounded-full bg-sky-50 flex items-center justify-center transition-all duration-300 hover:bg-sky-100 cursor-help"
                  tabIndex={0}
                  role="button"
                  aria-label="Ver descripción"
                  title={selectedMunicipality.description}
                >
                  <svg
                    className="h-5 w-5 text-sky-600 transition-transform group-hover/info:scale-110"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-gray-50/80 to-transparent rounded-2xl p-4 transition-all duration-300 hover:from-gray-100/80 group/content">
          <div className="transition-all duration-300 group-hover/content:translate-x-1">
            <InfoPanel
              selectedMunicipality={selectedMunicipality}
              activeFilter={selectedFilter}
              weatherData={weatherData}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Panel de lista de municipios (Desktop) */}
      <div
        className="absolute top-4 left-4 z-[1000]"
        role="navigation"
        aria-label="Lista de municipios"
      >
        <div
          className="bg-gray-100/95 backdrop-blur-sm rounded-3xl
                     w-[350px] h-[650px] 
                     transition-all duration-500 
                     motion-safe:animate-fadeIn flex flex-col"
          tabIndex={0}
        >
          {/* Header con Filtros */}
          <div className="flex-none px-4 py-3 border-b border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 group">
                  <svg
                    className="w-5 h-5 text-sky-500 transition-transform group-hover:scale-110"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Chocó Interactivo
                </h2>
                <button
                  onClick={onReset}
                  className="group flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  title="Restablecer vista del mapa"
                  aria-label="Restablecer vista del mapa"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 transition-transform duration-500 group-hover:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="font-medium">{municipalities.length}</span>
                </button>
              </div>

              <FilterBarV2
                selectedFilter={selectedFilter as FilterCategory}
                searchValue={searchTerm}
                onFilterChange={(filter: FilterCategory) => {
                  onFilterChange?.(filter);
                  setIsExternalSelection(false);
                }}
                onSearch={setSearchTerm}
                isExternalSelection={isExternalSelection}
              />
            </div>
          </div>

          {/* Contenido con scroll */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
            } as React.CSSProperties}
          >
            {/* Siempre mostramos la lista de municipios en el panel izquierdo */}
            {renderMunicipalitiesList()}
          </div>
        </div>
      </div>

      {/* Panel de información (Desktop) */}
      {((currentFilter === "indigenous" && selectedReserve) ||
        currentFilter === "ethnic" ||
        (currentFilter !== "indigenous" && selectedMunicipality)) && (
        <div
          className="absolute top-4 right-4 z-[1000] w-[380px]"
          role="complementary"
          aria-label={
            currentFilter === "indigenous"
              ? "Información detallada de la reserva indígena"
              : currentFilter === "ethnic"
              ? "Distribución étnica"
              : "Información detallada del municipio"
          }
        >
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
              {currentFilter === "indigenous" && selectedReserve ? (
                <IndigenousReserveDetails reserve={selectedReserve} />
              ) : currentFilter === "ethnic" ? (
                <div className="w-full">
                  <EthnicFilter
                    selectedMunicipality={selectedMunicipality || undefined}
                  />
                </div>
              ) : (
                renderMunicipalityInfo()
              )}
            </div>

            {/* Sección de información detallada */}
            {currentFilter !== "indigenous" &&
              currentFilter !== "ethnic" &&
              selectedMunicipality &&
              renderDetailedInfo()}
          </div>
        </div>
      )}
    </>
  );
};
