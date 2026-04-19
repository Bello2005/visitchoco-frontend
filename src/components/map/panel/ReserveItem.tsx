import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Shield } from "lucide-react";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";

interface ReserveItemProps {
  reserve: IndigenousReserve;
  isSelected?: boolean;
  isFavorite?: boolean;
  onClick: () => void;
  onToggleFavorite?: (id: string) => void;
}

export const ReserveItem: React.FC<ReserveItemProps> = ({
  reserve,
  isSelected = false,
  isFavorite = false,
  onClick,
  onToggleFavorite,
}) => {
  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(String(reserve.id));
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
      className={`group relative w-full text-left rounded-xl p-2.5 cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
        isSelected
          ? "bg-white ring-1 ring-amber-200 shadow-sm"
          : "hover:bg-white hover:ring-1 hover:ring-gray-200/80"
      }`}
      aria-label={reserve.name}
    >
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-amber-500" aria-hidden />
      )}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center flex-shrink-0 ring-1 ring-amber-100/60">
          <Shield size={16} className="text-amber-600" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold truncate ${isSelected ? "text-amber-900" : "text-gray-800"}`}>
            {reserve.name}
          </p>
          {reserve.indigenous_people && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5">
              {reserve.indigenous_people}
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
              isSelected ? "text-amber-500" : "text-gray-300 group-hover:text-gray-500"
            }`}
            strokeWidth={2}
          />
        </div>
      </div>
    </motion.div>
  );
};
