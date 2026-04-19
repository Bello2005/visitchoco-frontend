import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Heart } from "lucide-react";
import type { Municipality } from "../../../services/municipality.service";
import type { SubregionKey } from "../../../utils/subregionFromMunicipio";
import { municipioToSubregion } from "../../../utils/subregionFromMunicipio";
import { SUBREGION_META } from "../../../utils/subregionData";

const PCI_UNESCO = new Set(["Quibdó"]);
const PCI_NACIONAL = new Set(["Medio San Juan"]);

interface MunicipalityCardProps {
  municipality: Municipality;
  isSelected?: boolean;
  isFavorite?: boolean;
  onClick: () => void;
  onToggleFavorite?: (slug: string) => void;
  showSubregionBadge?: boolean;
  distanceKm?: number;
  compact?: boolean;
}

export const MunicipalityCard: React.FC<MunicipalityCardProps> = ({
  municipality,
  isSelected = false,
  isFavorite = false,
  onClick,
  onToggleFavorite,
  showSubregionBadge = false,
  distanceKm,
  compact = false,
}) => {
  const sub: SubregionKey = municipioToSubregion(municipality.name);
  const meta = SUBREGION_META[sub];

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(municipality.slug);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`group relative w-full text-left rounded-xl cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${
        isSelected
          ? "bg-white ring-1 ring-gray-200 shadow-sm"
          : "hover:bg-white hover:ring-1 hover:ring-gray-200/80"
      } ${compact ? "p-2" : "p-2.5"}`}
      aria-label={municipality.name}
    >
      {isSelected && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 rounded-full"
          style={{ background: meta.primaryHex }}
          aria-hidden
        />
      )}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          {municipality.image_url ? (
            <img
              src={municipality.image_url}
              alt=""
              className={`${compact ? "w-11 h-11" : "w-14 h-14"} rounded-xl object-cover`}
              loading="lazy"
            />
          ) : (
            <div
              className={`${compact ? "w-11 h-11" : "w-14 h-14"} rounded-xl flex items-center justify-center ${meta.cardBg}`}
              aria-hidden
            >
              {municipality.emoji ? (
                <span className="text-2xl">{municipality.emoji}</span>
              ) : (
                <meta.Icon size={compact ? 18 : 22} strokeWidth={1.75} style={{ color: meta.primaryHex }} />
              )}
            </div>
          )}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white"
            style={{ background: meta.primaryHex }}
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p
              className={`text-sm font-semibold truncate ${
                isSelected ? "text-gray-900" : "text-gray-800"
              }`}
            >
              {municipality.name}
            </p>
            {PCI_UNESCO.has(municipality.name) && (
              <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-px rounded-full font-semibold tracking-wide flex-shrink-0">
                UNESCO
              </span>
            )}
            {PCI_NACIONAL.has(municipality.name) && (
              <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-px rounded-full font-semibold tracking-wide flex-shrink-0">
                PCI
              </span>
            )}
            {showSubregionBadge && (
              <span
                className={`text-[9px] ${meta.badgeBg} ${meta.badgeText} px-1.5 py-px rounded-full font-medium flex-shrink-0`}
              >
                {meta.label}
              </span>
            )}
          </div>
          {municipality.description?.trim() ? (
            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
              {municipality.description}
            </p>
          ) : municipality.main_activity ? (
            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5 capitalize">
              {municipality.main_activity.toLowerCase()}
            </p>
          ) : (
            <p className="text-[11px] text-gray-300 italic mt-0.5">Próximamente</p>
          )}
          {typeof distanceKm === "number" && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              a {distanceKm < 1 ? "<1" : distanceKm.toFixed(0)} km
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onToggleFavorite && (
            <button
              onClick={handleFav}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 ${
                isFavorite
                  ? "text-rose-500"
                  : "text-gray-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 focus:opacity-100"
              }`}
              aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              aria-pressed={isFavorite}
            >
              <Heart size={14} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2} />
            </button>
          )}
          <ChevronRight
            size={14}
            className={`transition-colors ${
              isSelected ? "text-gray-500" : "text-gray-300 group-hover:text-gray-500"
            }`}
            strokeWidth={2}
          />
        </div>
      </div>
    </motion.div>
  );
};
