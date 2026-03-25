import React, { useEffect, useState } from "react";
import type { Municipality } from "../../../services/municipality.service";
import type { WeatherData } from "../../../services/weather.service";
import { weatherService } from "../../../services/weather.service";
import { api } from "../../../services/api.service";

interface MunicipalityDetailProps {
  municipality: Municipality;
}

type Tab = "general" | "clima" | "transporte" | "poblacion" | "fiestas" | "cultura";

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

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: "Info" },
    { id: "clima", label: "Clima" },
    { id: "transporte", label: "Cómo llegar" },
    { id: "poblacion", label: "Población" },
    { id: "fiestas", label: "Fiestas" },
    { id: "cultura", label: "Cultura" },
  ];

  const imagePosition: Record<string, string> = {
    "acandi.jpg":              "center 60%",
    "nuqui.jpg":               "center 65%",
    "condoto.jpg":             "center 50%",
    "bajo-baudo.jpg":          "center 40%",
    "bahia-solano.jpg":        "center 45%",
    "bojaya.jpg":              "center 50%",
    "riosucio.jpg":            "center 50%",
    "bagado.jpg":              "center 40%",
    "atrato.jpg":              "center 55%",
    "carmen-del-darien.jpg":   "center 45%",
    "medio-atrato.jpg":        "center 50%",
    "medio-baudo.jpg":         "center 50%",
    "lloro.jpg":               "center 60%",
    "unguia.jpg":              "center 50%",
    "certegui.jpg":            "center 30%",
    "quibdo.jpg":              "center 25%",
    "el-carmen-de-atrato.jpg": "center 35%",
    "canton-de-san-pablo.jpg": "center 50%",
    "tado.jpg":                "center 45%",
  };
  const imgFilename = municipality.image_url?.split("/").pop() ?? "";
  const objPosition = imagePosition[imgFilename] ?? "center 50%";

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-none relative h-48 overflow-hidden">
        {municipality.image_url ? (
          <img
            src={municipality.image_url}
            alt={municipality.name}
            className="w-full h-full object-cover"
            style={{ objectPosition: objPosition }}
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
        {/* Weather badge inside hero */}
        {weatherData?.main && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-md rounded-2xl px-3 py-1.5">
            {weatherData.weather?.[0]?.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                alt={weatherData.weather[0].description}
                className="w-6 h-6"
              />
            )}
            <span className="text-sm font-bold text-white">
              {Math.round(weatherData.main.temp)}°C
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-none mx-4 mt-3">
        <div className="flex gap-0.5 overflow-x-auto bg-gray-50 rounded-2xl p-1" style={{ scrollbarWidth: "none" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? "bg-white shadow-sm text-teal-700 font-semibold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
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
            <div className="grid grid-cols-2 gap-2.5">
              {municipality.zone && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3 border border-teal-100/50">
                  <span className="text-lg">📍</span>
                  <p className="text-[10px] text-gray-500 mt-1">Zona</p>
                  <p className="text-sm font-bold text-teal-800">{municipality.zone}</p>
                </div>
              )}
              {municipality.main_activity && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3 border border-teal-100/50">
                  <span className="text-lg">💼</span>
                  <p className="text-[10px] text-gray-500 mt-1">Actividad principal</p>
                  <p className="text-sm font-bold text-teal-800">{municipality.main_activity}</p>
                </div>
              )}
              {municipality.lat && municipality.lon && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3 border border-teal-100/50">
                  <span className="text-lg">🌐</span>
                  <p className="text-[10px] text-gray-500 mt-1">Coordenadas</p>
                  <p className="text-sm font-bold text-teal-800">{Number(municipality.lat).toFixed(2)}°, {Number(municipality.lon).toFixed(2)}°</p>
                </div>
              )}
              {municipality.cod_dane && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3 border border-teal-100/50">
                  <span className="text-lg">🏷️</span>
                  <p className="text-[10px] text-gray-500 mt-1">Código DANE</p>
                  <p className="text-sm font-bold text-teal-800">{municipality.cod_dane}</p>
                </div>
              )}
            </div>
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

        {activeTab === "fiestas" && (
          <FiestasTab municipalityId={municipality.id} />
        )}

        {activeTab === "cultura" && (
          <CulturaTab municipioNombre={municipality.name} />
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

interface FestivalItem {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  municipality_name: string;
}

const FiestasTab: React.FC<{ municipalityId: number }> = ({ municipalityId }) => {
  const [items, setItems] = useState<FestivalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/festivals/municipality/${municipalityId}`)
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [municipalityId]);

  if (loading)
    return (
      <div className="space-y-3 p-1">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );

  if (items.length === 0)
    return (
      <div className="text-center py-10 text-gray-400">
        <span className="text-4xl">🎉</span>
        <p className="text-sm mt-3 font-medium">Información de fiestas próximamente</p>
      </div>
    );

  return (
    <div className="space-y-3 pb-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-4"
        >
          <p className="text-sm font-bold text-purple-900">{item.name}</p>
          {item.start_date && (
            <p className="text-xs text-purple-600 mt-1">
              📅 {item.start_date}{item.end_date ? ` — ${item.end_date}` : ""}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

interface PatrimonioItem {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion_corta: string;
  descripcion_larga: string;
  ambito: string;
  fecha_declaracion: string;
  organizacion_gestora: string;
  fecha_celebracion: string;
  elementos_clave: string[];
  municipio_nombre: string;
}

interface MaterialItem {
  id: number;
  entidad_custodia: string;
  numero_bienes: number;
}
interface RntData {
  total_activos: number;
  hoteles: number;
  fincas_turisticas: number;
  hostales: number;
  agencias_viajes: number;
  guias_turismo: number;
  viviendas_turisticas: number;
}

const CulturaTab: React.FC<{ municipioNombre: string }> = ({ municipioNombre }) => {
  const [items, setItems] = useState<PatrimonioItem[]>([]);
  const [material, setMaterial] = useState<MaterialItem[]>([]);
  const [rnt, setRnt] = useState<RntData | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enc = encodeURIComponent(municipioNombre);
    Promise.all([
      api.get(`/api/patrimonio/inmaterial/${enc}`).then((r) => r.data).catch(() => []),
      api.get(`/api/patrimonio/material/${enc}`).then((r) => r.data).catch(() => []),
      api.get(`/api/patrimonio/rnt/${enc}`).then((r) => r.data).catch(() => null),
    ]).then(([pciData, matData, rntData]) => {
      setItems(Array.isArray(pciData) ? pciData : []);
      setMaterial(Array.isArray(matData) ? matData : []);
      setRnt(rntData ?? null);
    }).finally(() => setLoading(false));
  }, [municipioNombre]);

  if (loading)
    return (
      <div className="space-y-3 p-1">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );

  if (!rnt && items.length === 0 && material.length === 0)
    return (
      <div className="text-center py-10 text-gray-400">
        <span className="text-4xl">🏛️</span>
        <p className="text-sm mt-3 font-medium">Información cultural próximamente</p>
        <p className="text-xs mt-1 text-gray-300">
          Estamos documentando el patrimonio de este municipio
        </p>
      </div>
    );

  return (
    <div className="space-y-5 pb-4">
      {/* RNT — Oferta turística */}
      {rnt && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Oferta turística registrada
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-teal-50 border border-teal-100">
              <span className="text-lg mb-1">🏨</span>
              <span className="text-lg font-bold text-teal-700">{rnt.total_activos}</span>
              <span className="text-xs text-gray-400 text-center mt-0.5">Total RNT activos</span>
            </div>
            {rnt.hoteles > 0 && (
              <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-lg mb-1">🏩</span>
                <span className="text-lg font-bold text-gray-700">{rnt.hoteles}</span>
                <span className="text-xs text-gray-400 text-center mt-0.5">Hoteles</span>
              </div>
            )}
            {rnt.fincas_turisticas > 0 && (
              <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-lg mb-1">🌿</span>
                <span className="text-lg font-bold text-gray-700">{rnt.fincas_turisticas}</span>
                <span className="text-xs text-gray-400 text-center mt-0.5">Fincas turísticas</span>
              </div>
            )}
            {rnt.hostales > 0 && (
              <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-lg mb-1">🛏️</span>
                <span className="text-lg font-bold text-gray-700">{rnt.hostales}</span>
                <span className="text-xs text-gray-400 text-center mt-0.5">Hostales</span>
              </div>
            )}
            {rnt.agencias_viajes > 0 && (
              <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-lg mb-1">✈️</span>
                <span className="text-lg font-bold text-gray-700">{rnt.agencias_viajes}</span>
                <span className="text-xs text-gray-400 text-center mt-0.5">Agencias de viajes</span>
              </div>
            )}
            {rnt.guias_turismo > 0 && (
              <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-lg mb-1">🧭</span>
                <span className="text-lg font-bold text-gray-700">{rnt.guias_turismo}</span>
                <span className="text-xs text-gray-400 text-center mt-0.5">Guías certificados</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">Fuente: RNT - MinCIT 2025</p>
        </section>
      )}

      {/* Patrimonio material */}
      {material.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Bienes patrimoniales
          </h3>
          <div className="space-y-2">
            {material.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-3"
              >
                <span className="text-2xl">⛪</span>
                <div>
                  <p className="text-sm font-medium text-stone-800">{item.entidad_custodia}</p>
                  <p className="text-xs text-stone-500">{item.numero_bienes} bienes en SIPA</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PCI — Patrimonio inmaterial */}
      {items.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Patrimonio cultural inmaterial
          </h3>
          <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border overflow-hidden border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50"
        >
          <button
            className="w-full text-left p-4"
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <span
                  className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${
                    item.ambito.includes("UNESCO")
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-200 text-amber-800"
                  }`}
                >
                  {item.ambito.includes("UNESCO") ? "🌍 UNESCO" : "🇨🇴 Patrimonio Nacional"}
                </span>
                <p className="text-sm font-bold text-amber-900 leading-tight">{item.titulo}</p>
                <p className="text-xs text-amber-600 mt-0.5">{item.subtitulo}</p>
              </div>
              <span
                className={`text-amber-400 text-lg transition-transform duration-200 ${
                  expanded === item.id ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-2 leading-relaxed">
              {item.descripcion_corta}
            </p>
          </button>

          {expanded === item.id && (
            <div className="px-4 pb-4 space-y-4 border-t border-amber-100 pt-3">
              <p className="text-xs text-amber-900 leading-relaxed">{item.descripcion_larga}</p>

              <div className="space-y-2">
                {item.fecha_declaracion && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm">📅</span>
                    <div>
                      <p className="text-xs font-semibold text-amber-700">Declaración</p>
                      <p className="text-xs text-amber-600">{item.fecha_declaracion}</p>
                    </div>
                  </div>
                )}
                {item.organizacion_gestora && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm">🏛️</span>
                    <div>
                      <p className="text-xs font-semibold text-amber-700">Organización gestora</p>
                      <p className="text-xs text-amber-600">{item.organizacion_gestora}</p>
                    </div>
                  </div>
                )}
                {item.fecha_celebracion && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm">🗓️</span>
                    <div>
                      <p className="text-xs font-semibold text-amber-700">Cuándo</p>
                      <p className="text-xs text-amber-600">{item.fecha_celebracion}</p>
                    </div>
                  </div>
                )}
              </div>

              {item.elementos_clave?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-2">Elementos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.elementos_clave.map((el, i) => (
                      <span
                        key={i}
                        className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full"
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.municipio_nombre === "Chocó" && (
                <p className="text-xs text-amber-500 italic">
                  Esta manifestación está presente en todo el departamento del Chocó
                </p>
              )}

              <p className="text-xs text-gray-400">Fuente: Ministerio de Culturas 2025</p>
            </div>
          )}
        </div>
      ))}
          </div>
        </section>
      )}
    </div>
  );
};
