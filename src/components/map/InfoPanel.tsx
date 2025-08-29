import React from "react";
import type { Municipality } from "../../services/municipality.service";
import type {
  FilterType,
  IndigenousReserve,
  TouristSpot,
} from "../../types/filters";

interface InfoPanelProps {
  selectedMunicipality: Municipality;
  activeFilter?: FilterType;
  selectedReserves?: IndigenousReserve[];
  selectedSpots?: TouristSpot[];
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedMunicipality,
  activeFilter = "general",
  selectedReserves = [],
  selectedSpots = [],
}) => {
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
              title={selectedMunicipality.name}
            >
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
            <p
              className="text-sm text-gray-600 flex items-center gap-1.5 group"
              title={`Zona: ${selectedMunicipality.zone || "No especificada"}`}
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
                Zona {selectedMunicipality.zone || "No especificada"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Contenido según el filtro activo */}
      {activeFilter === "general" && (
        <div className="space-y-4">
          {selectedMunicipality.main_activity && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100/60">
              <h3 className="text-sm text-gray-500 mb-1">
                Actividad Principal
              </h3>
              <p className="text-gray-800">
                {selectedMunicipality.main_activity}
              </p>
            </div>
          )}

          {selectedMunicipality.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600">
                {selectedMunicipality.description}
              </p>
            </div>
          )}

          {/* Widget de Clima si está disponible */}
          {selectedMunicipality.weather && (
            <div className="bg-gradient-to-r from-blue-50/50 to-sky-50/50 rounded-2xl p-4 border border-blue-100/20">
              <h3 className="text-sm text-gray-500 mb-2">Clima</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {selectedMunicipality.weather.current?.temp ||
                      selectedMunicipality.weather.temperature ||
                      "N/A"}
                    °C
                  </p>
                  {selectedMunicipality.weather.current?.feels_like && (
                    <p className="text-sm text-gray-600">
                      Sensación térmica:{" "}
                      {selectedMunicipality.weather.current.feels_like}°C
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeFilter === "indigenous" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">
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
                    Población: {reserve.population.toLocaleString()} habitantes
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
