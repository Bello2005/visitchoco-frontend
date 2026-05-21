import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Heart, Shield, Sparkles, Navigation, RotateCw, Lock, WifiOff } from "lucide-react";
import type { Municipality } from "../../../services/municipality.service";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";
import type { FilterCategory } from "../../../types/filters";
import type { SubregionKey } from "../../../utils/subregionFromMunicipio";
import type { GeoCoords, GeoStatus } from "../../../hooks/useGeolocation";
import { distanceKm } from "../../../hooks/useGeolocation";
import { SUBREGION_META, SUBREGION_ORDER, getSubregionCounts } from "../../../utils/subregionData";
import { SubregionCard } from "./SubregionCard";
import { MunicipalityCard } from "./MunicipalityCard";
import { ReserveItem } from "./ReserveItem";

interface HomeViewProps {
  municipalities: Municipality[];
  reserves: IndigenousReserve[];
  currentFilter: FilterCategory;
  searchQuery: string;
  selectedReserve: IndigenousReserve | null;
  onSelectSubregion: (key: SubregionKey) => void;
  onSelectMunicipality: (m: Municipality) => void;
  onSelectReserve: (r: IndigenousReserve) => void;
  onFilterChange: (f: FilterCategory) => void;
  favoriteMunicipalitySlugs: string[];
  favoriteReserveIds: string[];
  onToggleFavoriteMunicipality: (slug: string) => void;
  onToggleFavoriteReserve: (id: string) => void;
  geoCoords: GeoCoords | null;
  geoStatus: GeoStatus;
  onRequestLocation: () => void;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

export const HomeView: React.FC<HomeViewProps> = ({
  municipalities,
  reserves,
  currentFilter,
  searchQuery,
  selectedReserve,
  onSelectSubregion,
  onSelectMunicipality,
  onSelectReserve,
  onFilterChange,
  favoriteMunicipalitySlugs,
  favoriteReserveIds,
  onToggleFavoriteMunicipality,
  onToggleFavoriteReserve,
  geoCoords,
  geoStatus,
  onRequestLocation,
}) => {
  const q = (searchQuery ?? "").toLowerCase().trim();

  const subregionCounts = useMemo(() => getSubregionCounts(municipalities), [municipalities]);

  const favoriteMunicipalities = useMemo(
    () =>
      favoriteMunicipalitySlugs
        .map((s) => municipalities.find((m) => m.slug === s))
        .filter((m): m is Municipality => !!m),
    [favoriteMunicipalitySlugs, municipalities]
  );

  const nearbyMunicipalities = useMemo(() => {
    if (!geoCoords) return [];
    return [...municipalities]
      .map((m) => ({
        m,
        km: distanceKm(geoCoords, { lat: m.lat, lng: m.lon }),
      }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 3);
  }, [geoCoords, municipalities]);

  // Indigenous filter view: reserves list directly
  if (currentFilter === "indigenous") {
    const filtered = reserves.filter((r) => {
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.indigenous_people?.toLowerCase().includes(q)
      );
    });

    return (
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-6"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(156,163,175,0.25) transparent" }}
      >
        <button
          onClick={() => onFilterChange("general")}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-800 mb-3 -ml-1 px-1.5 py-1 rounded-md hover:bg-gray-100/70 transition-colors"
        >
          <ArrowLeft size={12} strokeWidth={2.25} />
          <span>Volver a explorar</span>
        </button>
        <SectionHeader
          icon={<Shield size={13} strokeWidth={2} className="text-amber-600" />}
          title="Reservas indígenas"
          subtitle={`${filtered.length} ${filtered.length === 1 ? "territorio" : "territorios"} ancestrales`}
        />
        {filtered.length === 0 ? (
          <EmptyBlock query={searchQuery} />
        ) : (
          <ul className="space-y-1">
            {filtered.map((r) => (
              <li key={r.id}>
                <ReserveItem
                  reserve={r}
                  isSelected={selectedReserve?.id === r.id}
                  isFavorite={favoriteReserveIds.includes(String(r.id))}
                  onClick={() => onSelectReserve(r)}
                  onToggleFavorite={onToggleFavoriteReserve}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Default home
  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-6"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(156,163,175,0.25) transparent" }}
    >
      {/* Intro */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="mb-5"
      >
        <h1 className="text-[22px] font-serif font-medium tracking-tight text-gray-900 leading-tight">
          Explora el Chocó
        </h1>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Biodiversidad, cultura y mar Pacífico en 31 municipios.
        </p>
      </motion.div>

      {/* Cerca de mí */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="mb-5"
      >
        <SectionHeader
          icon={<Navigation size={13} strokeWidth={2} className="text-teal-600" />}
          title="Cerca de ti"
        />
        {geoStatus === "granted" && nearbyMunicipalities.length > 0 ? (
          <ul className="space-y-0.5">
            {nearbyMunicipalities.map(({ m, km }) => (
              <li key={m.id}>
                <MunicipalityCard
                  municipality={m}
                  isFavorite={favoriteMunicipalitySlugs.includes(m.slug)}
                  onClick={() => onSelectMunicipality(m)}
                  onToggleFavorite={onToggleFavoriteMunicipality}
                  showSubregionBadge
                  distanceKm={km}
                  compact
                />
              </li>
            ))}
          </ul>
        ) : (
          <NearbyCTA geoStatus={geoStatus} onRequest={onRequestLocation} />
        )}
      </motion.section>

      {/* Favoritos */}
      {favoriteMunicipalities.length > 0 && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mb-5"
        >
          <SectionHeader
            icon={<Heart size={13} strokeWidth={2} className="text-rose-500" fill="currentColor" />}
            title="Favoritos"
            subtitle={`${favoriteMunicipalities.length} guardados`}
          />
          <ul className="space-y-0.5">
            {favoriteMunicipalities.slice(0, 5).map((m) => (
              <li key={m.id}>
                <MunicipalityCard
                  municipality={m}
                  isFavorite
                  onClick={() => onSelectMunicipality(m)}
                  onToggleFavorite={onToggleFavoriteMunicipality}
                  showSubregionBadge
                  compact
                />
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* Regiones */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={3}
        className="mb-5"
      >
        <SectionHeader
          icon={<Compass size={13} strokeWidth={2} className="text-gray-600" />}
          title="Regiones"
          subtitle="5 subregiones · 31 municipios"
        />
        <div className="grid grid-cols-2 gap-2">
          {SUBREGION_ORDER.map((k, index) => {
            const isOddLastCard =
              SUBREGION_ORDER.length % 2 === 1 &&
              index === SUBREGION_ORDER.length - 1;
            return (
              <SubregionCard
                key={k}
                meta={SUBREGION_META[k]}
                count={subregionCounts[k]}
                onClick={() => onSelectSubregion(k)}
                className={isOddLastCard ? "col-span-2 max-w-sm justify-self-center" : undefined}
              />
            );
          })}
        </div>
      </motion.section>

      {/* Pueblos con herencia ancestral */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={4}
      >
        <button
          onClick={() => onFilterChange("indigenous")}
          className="w-full flex items-center gap-3 rounded-2xl p-3.5 text-left bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 ring-1 ring-amber-100/60 hover:ring-amber-200 transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center shadow-sm flex-shrink-0">
            <Sparkles size={18} strokeWidth={1.75} className="text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Pueblos con herencia ancestral
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
              {reserves.length} reservas indígenas reconocidas
            </p>
          </div>
          <svg
            className="w-4 h-4 text-amber-600/70 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </motion.section>
    </div>
  );
};

const SectionHeader: React.FC<{
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className="flex items-end justify-between mb-2 px-0.5">
    <div className="flex items-center gap-1.5">
      {icon}
      <h2 className="text-[11px] font-semibold tracking-wide text-gray-700 uppercase">
        {title}
      </h2>
    </div>
    {subtitle && <span className="text-[10px] text-gray-400">{subtitle}</span>}
  </div>
);

const NearbyCTA: React.FC<{
  geoStatus: GeoStatus;
  onRequest: () => void;
}> = ({ geoStatus, onRequest }) => {
  const isRetryable =
    geoStatus === "denied" || geoStatus === "error" || geoStatus === "unsupported";
  const isLoading = geoStatus === "prompt";

  const theme = (() => {
    switch (geoStatus) {
      case "denied":
        return {
          bg: "from-rose-50 to-amber-50",
          ring: "ring-rose-100/70 hover:ring-rose-200",
          iconBg: "text-rose-500",
          Icon: Lock,
          title: "Permiso denegado",
          subtitle:
            "Habilita la ubicación para este sitio desde los ajustes del navegador y vuelve a intentarlo.",
        };
      case "unsupported":
        return {
          bg: "from-gray-50 to-slate-50",
          ring: "ring-gray-200/70 hover:ring-gray-300",
          iconBg: "text-gray-500",
          Icon: WifiOff,
          title: "Navegador sin soporte",
          subtitle: "Tu navegador no permite geolocalización.",
        };
      case "error":
        return {
          bg: "from-amber-50 to-orange-50",
          ring: "ring-amber-100/70 hover:ring-amber-200",
          iconBg: "text-amber-600",
          Icon: WifiOff,
          title: "No pudimos ubicarte",
          subtitle:
            "Revisa tu conexión o el GPS. Abre el sitio en https:// o en localhost para permitir la ubicación.",
        };
      case "prompt":
        return {
          bg: "from-teal-50 to-emerald-50",
          ring: "ring-teal-100/60",
          iconBg: "text-teal-600",
          Icon: Navigation,
          title: "Ubicando…",
          subtitle: "Estamos leyendo tu posición.",
        };
      default:
        return {
          bg: "from-teal-50 to-emerald-50",
          ring: "ring-teal-100/60 hover:ring-teal-200",
          iconBg: "text-teal-600",
          Icon: Navigation,
          title: "Activa tu ubicación",
          subtitle: "Encuentra los municipios más cercanos a ti.",
        };
    }
  })();

  const { Icon } = theme;

  return (
    <button
      onClick={onRequest}
      disabled={isLoading}
      aria-busy={isLoading}
      className={`w-full flex items-center gap-3 rounded-xl p-3 text-left bg-gradient-to-br ${theme.bg} ring-1 ${theme.ring} transition-all disabled:opacity-80 disabled:cursor-progress`}
    >
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon
          size={14}
          strokeWidth={2}
          className={`${theme.iconBg} ${isLoading ? "animate-pulse" : ""}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-800">{theme.title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
          {theme.subtitle}
        </p>
      </div>
      {isRetryable && (
        <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 bg-white/80 ring-1 ring-gray-200/70 rounded-full px-2 py-1">
          <RotateCw size={10} strokeWidth={2.5} />
          Reintentar
        </span>
      )}
    </button>
  );
};

const EmptyBlock: React.FC<{ query: string }> = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl bg-gray-50/60">
    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <p className="text-xs text-gray-500">Sin resultados para</p>
    <p className="text-xs font-medium text-gray-800 mt-0.5">"{query}"</p>
  </div>
);
