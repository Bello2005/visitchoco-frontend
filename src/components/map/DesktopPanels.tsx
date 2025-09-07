import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Municipality } from "../../services/municipality.service";
import type { IndigenousReserve } from "../../services/indigenousReserve.service";
import type { FilterCategory } from "../../types/filters";
import type { WeatherData } from "../../services/weather.service";

// Interfaz para los datos de transporte que vienen como JSONB de la base de datos
interface TransportationData {
  type: string;
  description?: string;
  schedule?: string;
  price?: string;
}

import { weatherService } from "../../services/weather.service";
import SimpleMunicipalitiesList from "../map/SimpleMunicipalitiesList";
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
  const selectedFilter = currentFilter || "general";

  // Efecto para manejar la selección desde el mapa
  React.useEffect(() => {
    if (selectedMunicipality) {
      setIsExternalSelection(true);
    } else {
      setIsExternalSelection(false);
    }
  }, [selectedMunicipality]);

  // Efecto para cargar datos del clima
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (selectedMunicipality?.lat && selectedMunicipality?.lon) {
        try {
          const data = await weatherService.getCurrentWeather(
            Number(selectedMunicipality.lat),
            Number(selectedMunicipality.lon)
          );
          setWeatherData(data);
        } catch (error) {
          console.error("Error fetching weather:", error);
          setWeatherData(null);
        }
      } else {
        setWeatherData(null);
      }
    };

    fetchWeatherData();
  }, [selectedMunicipality?.lat, selectedMunicipality?.lon]);

  // Filtrar municipios según el término de búsqueda
  const filteredMunicipalities = municipalities.filter((municipality) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      municipality.name.toLowerCase().includes(searchLower) ||
      municipality.description
        ?.toString()
        .toLowerCase()
        .includes(searchLower) ||
      municipality.zone?.toLowerCase().includes(searchLower) ||
      municipality.main_activity?.toLowerCase().includes(searchLower)
    );
  });

  const renderList = () => {
    // Si el filtro actual es de reservas indígenas
    if (currentFilter === "indigenous") {
      if (!reserves || reserves.length === 0) {
        return (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">🏺</div>
            <p className="text-gray-500">
              No hay reservas indígenas disponibles
            </p>
          </div>
        );
      }

      // Filtrar reservas según el término de búsqueda
      const filteredReserves = reserves.filter((reserve) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase().trim();
        return (
          reserve.name.toLowerCase().includes(searchLower) ||
          reserve.indigenous_people?.toLowerCase().includes(searchLower)
        );
      });

      if (filteredReserves.length === 0) {
        return (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">🔍</div>
            <p className="text-gray-500">
              No se encontraron reservas que coincidan con "{searchTerm}"
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
        <div className="space-y-2 overflow-y-auto px-0.5 -mx-1">
          {filteredReserves.map((reserve) => (
            <motion.button
              key={reserve.id}
              onClick={() => onSelectReserve?.(reserve)}
              className={`group w-full p-3 rounded-xl text-left transition-all duration-200 
                ${
                  selectedReserve?.id === reserve.id
                    ? "bg-white text-gray-900"
                    : "bg-gray-300/40 text-gray-700 hover:bg-gray-200/50"
                }
                focus:outline-none`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{reserve.name}</h3>
                  {selectedReserve?.id === reserve.id && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-blue-600"
                    >
                      →
                    </motion.span>
                  )}
                </div>
                {reserve.indigenous_people && (
                  <p className="text-sm text-gray-500">
                    Pueblo: {reserve.indigenous_people}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    // Para otros filtros, mostrar la lista de municipios
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

  // Helper para parsear y mostrar medios de transporte
  const renderTransportation = (transportationRaw: any) => {
    let transportationArr: { mode: string; details: string }[] = [];
    if (typeof transportationRaw === "string") {
      try {
        transportationArr = JSON.parse(transportationRaw.replace(/\"/g, '"'));
      } catch {
        return <span className="text-gray-400">No disponible</span>;
      }
    } else if (Array.isArray(transportationRaw)) {
      transportationArr = transportationRaw;
    }
    if (!transportationArr.length)
      return <span className="text-gray-400">No disponible</span>;
    return (
      <ul className="space-y-2">
        {transportationArr.map((t, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-xl">🚗</span>
            <div>
              <span className="font-semibold text-gray-700">{t.mode}:</span>{" "}
              <span className="text-gray-600">{t.details}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  // Helper para dirección del viento
  function getWindDirection(deg: number) {
    const dirs = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  return (
    <>
      {/* Panel de lista (Desktop) */}
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
          {/* Header con título y botón de reset */}
          <div className="px-4 py-3 border-b border-gray-200/30">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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

          {/* Contenido con scroll */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar"
            style={
              {
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(156, 163, 175, 0.3) transparent",
              } as React.CSSProperties
            }
          >
            {/* Renderizamos la lista según el filtro seleccionado */}
            {renderList()}
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
            className="bg-white/98 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/40 p-5 space-y-4 max-h-[700px] overflow-y-auto transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] hover:border-gray-200/60 focus-within:shadow-[0_8px_40px_rgb(0,0,0,0.16)] focus-within:border-sky-200/60 custom-scrollbar motion-safe:animate-fadeIn"
            tabIndex={0}
          >
            <div className="bg-gradient-to-br from-sky-50 via-blue-50/30 to-transparent -mx-5 -mt-5 px-5 pt-5 pb-6 rounded-t-3xl border-b border-sky-100/30">
              {currentFilter === "indigenous" && selectedReserve ? (
                <IndigenousReserveDetails reserve={selectedReserve} />
              ) : currentFilter === "ethnic" ? (
                <EthnicFilter
                  selectedMunicipality={selectedMunicipality ?? undefined}
                />
              ) : selectedMunicipality ? (
                <div className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 via-white to-sky-100 rounded-3xl shadow-2xl p-8 border border-blue-200/40 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-extrabold text-blue-800 flex items-center gap-2">
                        <span role="img" aria-label="location">
                          📍
                        </span>{" "}
                        {selectedMunicipality.name}, CO
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedMunicipality.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold shadow animate-pulse">
                        Verificado
                      </span>
                      <span className="mt-1 text-gray-400 text-xs">
                        {selectedMunicipality.zone}
                      </span>
                    </div>
                  </div>
                  {weatherData &&
                    weatherData.main &&
                    weatherData.weather &&
                    weatherData.weather[0] && (
                      <div className="flex items-center gap-6 mb-6">
                        <img
                          src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                          alt={weatherData.weather[0].description}
                          className="w-16 h-16 drop-shadow-lg"
                        />
                        <div>
                          <span className="text-5xl font-bold text-blue-700">
                            {Math.round(weatherData.main.temp)}°C
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            Sensación:{" "}
                            <span className="font-semibold">
                              {Math.round(weatherData.main.feels_like)}°C
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {weatherData.weather[0].description}
                          </p>
                        </div>
                      </div>
                    )}
                  {weatherData && weatherData.main && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex flex-col items-center bg-white/60 rounded-xl p-3 shadow">
                        <span className="text-lg font-bold text-blue-600">
                          {weatherData.main.humidity}%
                        </span>
                        <span className="text-xs text-gray-500">Humedad</span>
                      </div>
                      <div className="flex flex-col items-center bg-white/60 rounded-xl p-3 shadow">
                        <span className="text-lg font-bold text-blue-600">
                          {weatherData.main.pressure}hPa
                        </span>
                        <span className="text-xs text-gray-500">Presión</span>
                      </div>
                      <div className="flex flex-col items-center bg-white/60 rounded-xl p-3 shadow">
                        <span className="text-lg font-bold text-blue-600">
                          {weatherData.wind.speed}m/s
                        </span>
                        <span className="text-xs text-gray-500">Viento</span>
                      </div>
                      <div className="flex flex-col items-center bg-white/60 rounded-xl p-3 shadow">
                        <span className="text-lg font-bold text-blue-600">
                          {weatherData.visibility
                            ? (weatherData.visibility / 1000).toFixed(1)
                            : "N/A"}
                          km
                        </span>
                        <span className="text-xs text-gray-500">
                          Visibilidad
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-white/60 rounded-xl p-3 shadow">
                        <span className="text-lg font-bold text-blue-600">
                          {weatherData.uvi ?? "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">UV</span>
                      </div>
                      <div className="flex flex-col items-center bg-white/60 rounded-xl p-3 shadow">
                        <span className="text-lg font-bold text-blue-600">
                          {weatherData.main.temp_min}°C
                        </span>
                        <span className="text-xs text-gray-500">
                          Punto de rocío
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span role="img" aria-label="activity">
                        🏖️
                      </span>{" "}
                      Actividad principal
                    </h3>
                    <p className="text-base text-gray-700 font-medium mb-2">
                      {selectedMunicipality.main_activity}
                    </p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span role="img" aria-label="transport">
                        🚗
                      </span>{" "}
                      Medios de transporte
                    </h3>
                    {renderTransportation(selectedMunicipality.transportation)}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span role="img" aria-label="population">
                        🧑‍🤝‍🧑
                      </span>{" "}
                      Población
                    </h3>
                    {selectedMunicipality.population &&
                    Array.isArray(selectedMunicipality.population) &&
                    selectedMunicipality.population.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left border border-gray-200 rounded-xl">
                          <thead className="bg-blue-50">
                            <tr>
                              <th className="px-3 py-2 font-semibold text-gray-700">
                                Año
                              </th>
                              <th className="px-3 py-2 font-semibold text-gray-700">
                                Total
                              </th>
                              <th className="px-3 py-2 font-semibold text-gray-700">
                                Hombres
                              </th>
                              <th className="px-3 py-2 font-semibold text-gray-700">
                                Mujeres
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMunicipality.population.map(
                              (row: any, idx: number) => (
                                <tr
                                  key={idx}
                                  className="border-t border-gray-100"
                                >
                                  <td className="px-3 py-2">
                                    {row.year ?? "-"}
                                  </td>
                                  <td className="px-3 py-2">
                                    {row.total ?? "-"}
                                  </td>
                                  <td className="px-3 py-2">
                                    {row.male ?? "-"}
                                  </td>
                                  <td className="px-3 py-2">
                                    {row.female ?? "-"}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <span className="text-gray-400">No disponible</span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesktopPanels;
