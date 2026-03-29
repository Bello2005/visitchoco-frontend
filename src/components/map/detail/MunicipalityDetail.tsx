import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Briefcase, Globe, Tag,
  CloudSun, Thermometer, Droplets, Wind, ArrowDown, ArrowUp,
  Car, Info, Navigation,
  Users, User, Building2, Trees,
  Hotel, Building, Leaf, BedDouble, Plane, Compass, Home,
  Landmark, Church, Calendar, CalendarDays, Shield,
  ChevronDown, ChevronRight, Music,
  type LucideIcon,
} from "lucide-react";
import type { Municipality } from "../../../services/municipality.service";
import type { WeatherData } from "../../../services/weather.service";
import { weatherService } from "../../../services/weather.service";
import { api } from "../../../services/api.service";

interface MunicipalityDetailProps {
  municipality: Municipality;
}

type Tab = "general" | "clima" | "transporte" | "demografia" | "turismo" | "cultura";

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

  const tabs: { id: Tab; label: string; Icon: LucideIcon }[] = [
    { id: "general",    label: "Info",       Icon: Info       },
    { id: "clima",      label: "Clima",      Icon: CloudSun   },
    { id: "transporte", label: "Llegar",     Icon: Navigation },
    { id: "demografia", label: "Demografía", Icon: Users      },
    { id: "turismo",    label: "Turismo",    Icon: Hotel      },
    { id: "cultura",    label: "Cultura",    Icon: Landmark   },
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
    <div className="flex flex-col flex-1 min-h-0">
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
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              {municipality.emoji ? (
                <span className="text-5xl drop-shadow-sm">{municipality.emoji}</span>
              ) : (
                <MapPin size={40} className="text-white/80 drop-shadow" />
              )}
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
          <h2 className="text-lg font-bold text-white leading-tight drop-shadow">{municipality.name}</h2>
          {municipality.zone && (
            <span className="text-xs text-white/80 font-medium">{municipality.zone}</span>
          )}
        </div>
        {/* Weather badge — oculto cuando el tab activo ya es Clima */}
        {weatherData?.main && activeTab !== "clima" && (
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

      {/* Tabs — grilla 3×2 con icono + label */}
      <div className="flex-none px-4 mt-3">
        <div className="grid grid-cols-3 gap-1.5">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  group flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl
                  border transition-all duration-150 select-none
                  ${isActive
                    ? "bg-teal-50 border-teal-200 shadow-sm"
                    : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm"
                  }
                `}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2 : 1.75}
                  className={`transition-colors duration-150 ${
                    isActive ? "text-teal-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span
                  className={`text-[11px] leading-none transition-colors duration-150 ${
                    isActive
                      ? "text-teal-700 font-semibold"
                      : "text-gray-400 font-medium group-hover:text-gray-600"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar" style={{ scrollbarWidth: "thin" }}>
        {activeTab === "general" && (
          <div className="space-y-4">
            {municipality.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{municipality.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              {municipality.zone && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3 border border-teal-100/50">
                  <MapPin size={16} className="text-teal-500" />
                  <p className="text-[10px] text-gray-500 mt-1">Zona</p>
                  <p className="text-sm font-bold text-teal-800">{municipality.zone}</p>
                </div>
              )}
              {municipality.main_activity && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3 border border-teal-100/50">
                  <Briefcase size={16} className="text-teal-500" />
                  <p className="text-[10px] text-gray-500 mt-1">Actividad principal</p>
                  <p className="text-sm font-bold text-teal-800">{municipality.main_activity}</p>
                </div>
              )}
              {municipality.lat && municipality.lon && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3 border border-teal-100/50">
                  <Globe size={16} className="text-teal-500" />
                  <p className="text-[10px] text-gray-500 mt-1">Coordenadas</p>
                  <p className="text-sm font-bold text-teal-800">{Number(municipality.lat).toFixed(2)}°, {Number(municipality.lon).toFixed(2)}°</p>
                </div>
              )}
              {municipality.cod_dane && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3 border border-teal-100/50">
                  <Tag size={16} className="text-teal-500" />
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

        {activeTab === "demografia" && (
          <DemografiaTab
            population={municipality.population}
            codDane={municipality.cod_dane}
          />
        )}

        {activeTab === "turismo" && (
          <TurismoTab municipioNombre={municipality.name} />
        )}

        {activeTab === "cultura" && (
          <CulturaTab municipioNombre={municipality.name} municipalityId={municipality.id} />
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
        <CloudSun size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm mt-2">Datos de clima no disponibles</p>
      </div>
    );
  }
  const stats: { label: string; value: string; Icon: LucideIcon }[] = [
    { label: "Temperatura", value: `${Math.round(data.main.temp)}°C`,       Icon: Thermometer },
    { label: "Sensación",   value: `${Math.round(data.main.feels_like)}°C`, Icon: Thermometer },
    { label: "Humedad",     value: `${data.main.humidity}%`,                Icon: Droplets    },
    { label: "Viento",      value: `${data.wind?.speed ?? "–"} m/s`,        Icon: Wind        },
    { label: "Mín",         value: `${Math.round(data.main.temp_min)}°C`,   Icon: ArrowDown   },
    { label: "Máx",         value: `${Math.round(data.main.temp_max)}°C`,   Icon: ArrowUp     },
  ];
  return (
    <div className="space-y-3">
      {data.weather?.[0] && (
        <div className="flex items-center gap-3 bg-sky-50 rounded-2xl px-4 py-3">
          <img
            src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
            alt={data.weather[0].description}
            className="w-12 h-12"
          />
          <div>
            <p className="text-sm font-semibold text-sky-800 capitalize">{data.weather[0].description}</p>
            <p className="text-2xl font-bold text-sky-700">{Math.round(data.main.temp)}°C</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center bg-sky-50/60 rounded-xl p-3">
            <s.Icon size={18} className="text-sky-400 mb-1" />
            <span className="text-base font-bold text-sky-700">{s.value}</span>
            <span className="text-xs text-gray-500 mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>
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
        <Car size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm mt-2">Información de transporte no disponible</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {list.map((t, idx) => (
        <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
          <Car size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{t.mode}</p>
            <p className="text-sm text-gray-600 mt-0.5">{t.details}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

interface EthnicGroup {
  grupo: string;
  porcentaje: number;
}

const ETHNIC_COLORS: Record<string, string> = {
  Afrodescendiente: "#0D9488",
  Indígena:         "#D97706",
  Mestizo:          "#6366F1",
  Blanco:           "#64748B",
};
const ETHNIC_COLOR_DEFAULT = "#94A3B8";

interface PopulationDetail {
  total: number;
  men: number;
  women: number;
  cabecera_municipal?: number;
  centros_poblados_rural_disperso?: number;
}

const DemografiaTab: React.FC<{ population: unknown; codDane: string }> = ({
  population,
  codDane,
}) => {
  const [ethnicData, setEthnicData] = useState<EthnicGroup[]>([]);
  const [detail, setDetail] = useState<PopulationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!codDane) return;
    setLoading(true);
    Promise.all([
      api.get(`/api/ethnic-distribution/${codDane}`).then((r) => r.data).catch(() => []),
      api.get(`/api/population/${codDane}`).then((r) => r.data).catch(() => null),
    ]).then(([ethnicRes, popRes]) => {
      setEthnicData(Array.isArray(ethnicRes) ? ethnicRes : []);
      setDetail(popRes ?? null);
    }).finally(() => setLoading(false));
  }, [codDane]);

  const populationNumber = Number(population) > 0 ? Number(population) : null;

  if (loading) {
    return (
      <div className="space-y-3 pt-2">
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!populationNumber) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Users size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm mt-2">Dato poblacional próximamente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sección 1 — Hero total */}
      <section className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 flex flex-col items-center">
        <p className="text-3xl font-bold text-teal-700">
          {populationNumber.toLocaleString("es-CO")}
        </p>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">habitantes</p>
        <p className="text-[10px] text-gray-400 mt-1">Proyección DANE 2026</p>
      </section>

      {/* Sección 2 — Distribución por sexo */}
      {detail && detail.total > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Distribución por sexo
          </h3>
          <div className="space-y-3">
            {([
              { Icon: User, label: "Hombres", value: detail.men,   barClass: "bg-teal-500", iconClass: "text-teal-500" },
              { Icon: User, label: "Mujeres", value: detail.women, barClass: "bg-pink-400", iconClass: "text-pink-400" },
            ] as { Icon: LucideIcon; label: string; value: number; barClass: string; iconClass: string }[]).map((row) => {
              const pct = Math.round((row.value / detail.total) * 100);
              return (
                <div key={row.label} className="flex items-center gap-2">
                  <row.Icon size={14} className={`flex-shrink-0 ${row.iconClass}`} />
                  <span className="text-xs text-gray-600 w-16 flex-shrink-0">{row.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${row.barClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-16 text-right">
                    {row.value.toLocaleString("es-CO")}
                  </span>
                  <span className="text-[10px] text-gray-400 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Sección 3 — Distribución territorial */}
      {detail && detail.cabecera_municipal != null && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Distribución territorial
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <Building2 size={16} className="text-teal-500" />
              <p className="text-sm font-bold text-teal-700 mt-1">
                {(detail.cabecera_municipal ?? 0).toLocaleString("es-CO")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Cabecera municipal</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <Trees size={16} className="text-green-600" />
              <p className="text-sm font-bold text-green-700 mt-1">
                {(detail.centros_poblados_rural_disperso ?? 0).toLocaleString("es-CO")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Rural disperso</p>
            </div>
          </div>
        </section>
      )}

      {/* Distribución étnica */}
      {ethnicData.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Distribución étnica
          </h3>
          <div className="space-y-3">
            {ethnicData.map((group) => {
              const color = ETHNIC_COLORS[group.grupo] ?? ETHNIC_COLOR_DEFAULT;
              return (
                <div key={group.grupo}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700">{group.grupo}</span>
                    <span className="text-xs text-gray-500">{group.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${group.porcentaje}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">Fuente: DANE / CNPV 2018</p>
        </section>
      )}
    </div>
  );
};

interface RntData {
  total_activos: number;
  hoteles: number;
  fincas_turisticas: number;
  hostales: number;
  agencias_viajes: number;
  guias_turismo: number;
  viviendas_turisticas: number;
}

const TurismoTab: React.FC<{ municipioNombre: string }> = ({ municipioNombre }) => {
  const [rnt, setRnt] = useState<RntData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/rnt/${encodeURIComponent(municipioNombre)}`)
      .then((r) => setRnt(r.data ?? null))
      .catch(() => setRnt(null))
      .finally(() => setLoading(false));
  }, [municipioNombre]);

  if (loading) {
    return (
      <div className="space-y-3 p-1">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!rnt) {
    return (
      <div className="text-center py-10 text-gray-400">
        <Hotel size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm mt-3 font-medium">Sin oferta turística registrada</p>
        <p className="text-xs mt-1 text-gray-300">
          No hay prestadores activos en el RNT para este municipio
        </p>
      </div>
    );
  }

  const rntItems: { Icon: LucideIcon; value: number; label: string; highlight: boolean }[] = [
    { Icon: Hotel,     value: rnt.total_activos,      label: "Total RNT activos",  highlight: true  },
    ...(rnt.hoteles > 0              ? [{ Icon: Building,   value: rnt.hoteles,              label: "Hoteles",              highlight: false }] : []),
    ...(rnt.fincas_turisticas > 0    ? [{ Icon: Leaf,       value: rnt.fincas_turisticas,    label: "Fincas turísticas",    highlight: false }] : []),
    ...(rnt.hostales > 0             ? [{ Icon: BedDouble,  value: rnt.hostales,             label: "Hostales",             highlight: false }] : []),
    ...(rnt.agencias_viajes > 0      ? [{ Icon: Plane,      value: rnt.agencias_viajes,      label: "Agencias de viajes",   highlight: false }] : []),
    ...(rnt.guias_turismo > 0        ? [{ Icon: Compass,    value: rnt.guias_turismo,        label: "Guías certificados",   highlight: false }] : []),
    ...(rnt.viviendas_turisticas > 0 ? [{ Icon: Home,       value: rnt.viviendas_turisticas, label: "Viviendas turísticas", highlight: false }] : []),
  ];

  const isOdd = rntItems.length % 2 !== 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {rntItems.map((item, idx) => (
          <div
            key={item.label}
            className={`flex flex-col items-center p-3 rounded-2xl border ${
              item.highlight ? "bg-teal-50 border-teal-100" : "bg-gray-50 border-gray-100"
            }${isOdd && idx === rntItems.length - 1 ? " col-span-2 w-1/2 mx-auto" : ""}`}
          >
            <item.Icon
              size={18}
              className={`mb-1 ${item.highlight ? "text-teal-500" : "text-gray-400"}`}
            />
            <span className={`text-lg font-bold ${item.highlight ? "text-teal-700" : "text-gray-700"}`}>
              {item.value}
            </span>
            <span className="text-xs text-gray-400 text-center mt-0.5">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">Fuente: RNT - MinCIT 2025</p>
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

const CulturaTab: React.FC<{ municipioNombre: string; municipalityId: number }> = ({ municipioNombre, municipalityId }) => {
  const [items, setItems] = useState<PatrimonioItem[]>([]);
  const [material, setMaterial] = useState<MaterialItem[]>([]);
  const [festivals, setFestivals] = useState<{ id: number; name: string; start_date: string; end_date: string }[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enc = encodeURIComponent(municipioNombre);
    Promise.all([
      api.get(`/api/patrimonio/inmaterial/${enc}`).then((r) => r.data).catch(() => []),
      api.get(`/api/patrimonio/material/${enc}`).then((r) => r.data).catch(() => []),
      api.get(`/api/festivals/municipality/${municipalityId}`).then((r) => r.data).catch(() => []),
    ]).then(([pciData, matData, festData]) => {
      setItems(Array.isArray(pciData) ? pciData : []);
      setMaterial(Array.isArray(matData) ? matData : []);
      setFestivals(Array.isArray(festData) ? festData : []);
    }).finally(() => setLoading(false));
  }, [municipioNombre, municipalityId]);

  if (loading)
    return (
      <div className="space-y-3 p-1">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );

  if (items.length === 0 && material.length === 0 && festivals.length === 0)
    return (
      <div className="text-center py-10 text-gray-400">
        <Landmark size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm mt-3 font-medium">Información cultural próximamente</p>
        <p className="text-xs mt-1 text-gray-300">
          Estamos documentando el patrimonio de este municipio
        </p>
      </div>
    );

  return (
    <div className="space-y-5 pb-4">
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
                <Church size={20} className="text-stone-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-stone-800">{item.entidad_custodia}</p>
                  <p className="text-xs text-stone-500">{item.numero_bienes} bienes en SIPA</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fiestas y festivales */}
      {festivals.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Fiestas y festivales
          </h3>
          <div className="space-y-2">
            {festivals.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-4"
              >
                <p className="text-sm font-bold text-purple-900">{item.name}</p>
                {item.start_date && (
                  <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                    <Calendar size={11} />
                    {item.start_date}{item.end_date ? ` — ${item.end_date}` : ""}
                  </p>
                )}
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
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${
                          item.ambito.includes("UNESCO")
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-200 text-amber-800"
                        }`}
                      >
                        {item.ambito.includes("UNESCO")
                          ? <><Globe size={10} /> UNESCO</>
                          : <><Shield size={10} /> Patrimonio Nacional</>
                        }
                      </span>
                      <p className="text-sm font-bold text-amber-900 leading-tight">{item.titulo}</p>
                      <p className="text-xs text-amber-600 mt-0.5">{item.subtitulo}</p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-amber-400 flex-shrink-0 transition-transform duration-200 ${
                        expanded === item.id ? "rotate-180" : ""
                      }`}
                    />
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
                          <Calendar size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-700">Declaración</p>
                            <p className="text-xs text-amber-600">{item.fecha_declaracion}</p>
                          </div>
                        </div>
                      )}
                      {item.organizacion_gestora && (
                        <div className="flex items-start gap-2">
                          <Landmark size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-700">Organización gestora</p>
                            <p className="text-xs text-amber-600">{item.organizacion_gestora}</p>
                          </div>
                        </div>
                      )}
                      {item.fecha_celebracion && (
                        <div className="flex items-start gap-2">
                          <CalendarDays size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
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

      <div className="pt-2 pb-1 space-y-2">
        <a
          href="/cultura"
          className="flex items-center justify-between w-full px-4 py-3
                     rounded-2xl bg-amber-50 border border-amber-100
                     text-amber-700 hover:bg-amber-100 transition-colors"
        >
          <span className="text-xs font-semibold">
            Ver patrimonio cultural completo
          </span>
          <ChevronRight size={14} />
        </a>
        {festivals.length > 0 && (
          <Link
            to={`/fiesta?municipio=${encodeURIComponent(municipioNombre)}`}
            className="flex items-center justify-between w-full px-4 py-3
                       rounded-2xl bg-purple-50 border border-purple-100
                       text-purple-700 hover:bg-purple-100 transition-colors mt-2"
          >
            <div className="flex items-center gap-2">
              <Music size={14} />
              <span className="text-xs font-semibold">Ver fiestas en el calendario</span>
            </div>
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
};
