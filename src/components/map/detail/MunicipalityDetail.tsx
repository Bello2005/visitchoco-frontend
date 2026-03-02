import React, { useEffect, useState } from "react";
import type { Municipality } from "../../../services/municipality.service";
import type { WeatherData } from "../../../services/weather.service";
import { weatherService } from "../../../services/weather.service";

interface MunicipalityDetailProps {
  municipality: Municipality;
}

type Tab = "general" | "clima" | "transporte" | "poblacion";

export const MunicipalityDetail: React.FC<MunicipalityDetailProps> = ({
  municipality,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (!municipality?.lat || !municipality?.lon) return;
    setWeatherLoading(true);
    setWeatherData(null);
    weatherService
      .getCurrentWeather(Number(municipality.lat), Number(municipality.lon))
      .then((data) => setWeatherData(data))
      .catch(() => setWeatherData(null))
      .finally(() => setWeatherLoading(false));
  }, [municipality?.lat, municipality?.lon]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "general", label: "General", icon: "📍" },
    { id: "clima", label: "Clima", icon: "🌤️" },
    { id: "transporte", label: "Cómo llegar", icon: "🚗" },
    { id: "poblacion", label: "Población", icon: "👥" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-none relative h-32 overflow-hidden">
        {municipality.image_url ? (
          <img
            src={municipality.image_url}
            alt={municipality.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, #0D9488 0%, #059669 50%, #0369a1 100%)`,
            }}
          >
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-5xl drop-shadow-sm">{municipality.emoji || "📍"}</span>
            </div>
          </div>
        )}
        {/* Gradient overlay at bottom for readability */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Name + zone over hero */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
          <h2 className="text-lg font-bold text-white leading-tight drop-shadow">{municipality.name}</h2>
          {municipality.zone && (
            <span className="text-xs text-white/80 font-medium">{municipality.zone}</span>
          )}
        </div>
      </div>

      {/* Weather badge (below hero) */}
      <div className="flex-none px-4 pt-3 pb-0">
        {weatherLoading && (
          <div className="h-9 bg-gray-100 rounded-xl animate-pulse" />
        )}
        {weatherData?.main && (
          <div className="flex items-center gap-2 px-3 py-2 bg-sky-50/80 rounded-xl border border-sky-100/60">
            {weatherData.weather?.[0]?.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                alt={weatherData.weather[0].description}
                className="w-7 h-7"
              />
            )}
            <span className="text-xl font-bold text-sky-700">
              {Math.round(weatherData.main.temp)}°C
            </span>
            <span className="text-xs text-sky-600 capitalize flex-1">
              {weatherData.weather?.[0]?.description}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-none px-4 pt-3 pb-0">
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar" style={{ scrollbarWidth: "thin" }}>
        {activeTab === "general" && (
          <div className="space-y-4">
            {municipality.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{municipality.description}</p>
            )}
            {municipality.main_activity && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Actividad principal
                </h3>
                <p className="text-sm text-gray-700 font-medium">{municipality.main_activity}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "clima" && (
          <WeatherTab data={weatherData} loading={weatherLoading} />
        )}

        {activeTab === "transporte" && (
          <TransportTab transportation={municipality.transportation} />
        )}

        {activeTab === "poblacion" && (
          <PopulationTab population={municipality.population} />
        )}
      </div>
    </div>
  );
};

const WeatherTab: React.FC<{ data: WeatherData | null; loading: boolean }> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data?.main) {
    return (
      <div className="text-center py-8 text-gray-400">
        <span className="text-3xl">🌤️</span>
        <p className="text-sm mt-2">Datos de clima no disponibles</p>
      </div>
    );
  }
  const stats = [
    { label: "Temperatura", value: `${Math.round(data.main.temp)}°C`, icon: "🌡️" },
    { label: "Sensación", value: `${Math.round(data.main.feels_like)}°C`, icon: "🤔" },
    { label: "Humedad", value: `${data.main.humidity}%`, icon: "💧" },
    { label: "Presión", value: `${data.main.pressure} hPa`, icon: "📊" },
    { label: "Viento", value: `${data.wind?.speed ?? "–"} m/s`, icon: "💨" },
    { label: "Visibilidad", value: data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : "–", icon: "👁️" },
    { label: "Nubosidad", value: `${data.clouds?.all ?? "–"}%`, icon: "☁️" },
    { label: "UV", value: `${data.uvi ?? "–"}`, icon: "☀️" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center bg-sky-50/60 rounded-xl p-3">
          <span className="text-lg mb-1">{s.icon}</span>
          <span className="text-base font-bold text-sky-700">{s.value}</span>
          <span className="text-xs text-gray-500 mt-0.5">{s.label}</span>
        </div>
      ))}
    </div>
  );
};

const TransportTab: React.FC<{ transportation: unknown }> = ({ transportation }) => {
  let list: { mode: string; details: string }[] = [];
  if (typeof transportation === "string") {
    try {
      list = JSON.parse(transportation);
    } catch {
      // ignore
    }
  } else if (Array.isArray(transportation)) {
    list = transportation as { mode: string; details: string }[];
  }

  if (!list.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <span className="text-3xl">🚗</span>
        <p className="text-sm mt-2">Información de transporte no disponible</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {list.map((t, idx) => (
        <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
          <span className="text-xl flex-shrink-0">🚗</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{t.mode}</p>
            <p className="text-sm text-gray-600 mt-0.5">{t.details}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

const PopulationTab: React.FC<{ population: unknown }> = ({ population }) => {
  if (!Array.isArray(population) || population.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <span className="text-3xl">👥</span>
        <p className="text-sm mt-2">Datos de población no disponibles</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-teal-50/80">
            <th className="px-3 py-2 text-left font-semibold text-teal-800 text-xs">Año</th>
            <th className="px-3 py-2 text-left font-semibold text-teal-800 text-xs">Total</th>
            <th className="px-3 py-2 text-left font-semibold text-teal-800 text-xs">Hombres</th>
            <th className="px-3 py-2 text-left font-semibold text-teal-800 text-xs">Mujeres</th>
          </tr>
        </thead>
        <tbody>
          {(population as { year?: number; total?: number; male?: number; female?: number }[]).map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
              <td className="px-3 py-2 text-gray-700">{row.year ?? "–"}</td>
              <td className="px-3 py-2 text-gray-700 font-medium">{row.total?.toLocaleString() ?? "–"}</td>
              <td className="px-3 py-2 text-gray-600">{row.male?.toLocaleString() ?? "–"}</td>
              <td className="px-3 py-2 text-gray-600">{row.female?.toLocaleString() ?? "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
