import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, MapPin } from "lucide-react";
import type { SubregionMeta } from "../../../utils/subregionData";

interface SubregionCardProps {
  meta: SubregionMeta;
  count: number;
  onClick: () => void;
  isSelected?: boolean;
  className?: string;
}

export const SubregionCard: React.FC<SubregionCardProps> = ({
  meta,
  count,
  onClick,
  isSelected = false,
  className,
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`group relative w-full text-left rounded-2xl overflow-hidden ring-1 ${
        isSelected ? `ring-2 ${meta.ringClass}` : "ring-gray-200/60"
      } ${meta.cardBg} transition-shadow duration-200 hover:shadow-lg hover:shadow-gray-900/5 ${
        className ?? ""
      }`}
      aria-label={`Subregión ${meta.label}, ${count} municipios`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${meta.gradientFrom} ${meta.gradientVia} ${meta.gradientTo} opacity-70 pointer-events-none`}
      />
      <div className="relative flex flex-col p-4 min-h-[148px]">
        <div className="flex items-start justify-between mb-auto">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-white/70"
            style={{ background: "rgba(255,255,255,0.65)" }}
            aria-hidden
          >
            <meta.Icon size={20} strokeWidth={1.75} style={{ color: meta.primaryHex }} />
          </div>
          <ChevronRight
            size={16}
            className="text-gray-500/70 group-hover:text-gray-800 group-hover:translate-x-0.5 transition-all"
            strokeWidth={2}
          />
        </div>
        <div className="mt-3">
          <h3
            className="text-[15px] font-semibold leading-tight tracking-tight"
            style={{ color: meta.primaryHex }}
          >
            {meta.label}
          </h3>
          <p className="text-[11px] text-gray-600/90 line-clamp-2 mt-1 leading-snug">
            {meta.shortDescription}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-gray-500">
            <MapPin size={10} strokeWidth={2.25} />
            <span>{count} {count === 1 ? "municipio" : "municipios"}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
