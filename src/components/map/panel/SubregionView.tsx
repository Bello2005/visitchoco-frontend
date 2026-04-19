import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { Municipality } from "../../../services/municipality.service";
import type { SubregionKey } from "../../../utils/subregionFromMunicipio";
import { SUBREGION_META, getMunicipalitiesBySubregion } from "../../../utils/subregionData";
import { MunicipalityCard } from "./MunicipalityCard";

interface SubregionViewProps {
  subregionKey: SubregionKey;
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  searchQuery: string;
  favoriteMunicipalitySlugs: string[];
  onSelectMunicipality: (m: Municipality) => void;
  onToggleFavoriteMunicipality: (slug: string) => void;
}

export const SubregionView: React.FC<SubregionViewProps> = ({
  subregionKey,
  municipalities,
  selectedMunicipality,
  searchQuery,
  favoriteMunicipalitySlugs,
  onSelectMunicipality,
  onToggleFavoriteMunicipality,
}) => {
  const meta = SUBREGION_META[subregionKey];
  const q = searchQuery.toLowerCase().trim();

  const list = useMemo(() => {
    const base = getMunicipalitiesBySubregion(municipalities, subregionKey);
    if (!q) return base;
    return base.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.main_activity?.toLowerCase().includes(q)
    );
  }, [municipalities, subregionKey, q]);

  const total = useMemo(
    () => getMunicipalitiesBySubregion(municipalities, subregionKey).length,
    [municipalities, subregionKey]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Hero band */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`relative flex-none mx-4 mt-1 mb-3 rounded-2xl overflow-hidden ring-1 ${meta.ringClass} ${meta.cardBg}`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${meta.gradientFrom} ${meta.gradientVia} ${meta.gradientTo} opacity-80 pointer-events-none`}
        />
        <div className="relative flex items-center gap-3 p-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-white/70"
            style={{ background: "rgba(255,255,255,0.65)" }}
            aria-hidden
          >
            <meta.Icon size={22} strokeWidth={1.75} style={{ color: meta.primaryHex }} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              className="text-[17px] font-serif font-medium leading-tight tracking-tight"
              style={{ color: meta.primaryHex }}
            >
              {meta.label}
            </h2>
            <p className="text-[11px] text-gray-600 mt-0.5 leading-snug line-clamp-2">
              {meta.longDescription}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Count */}
      <div className="flex-none px-4 pb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
          Municipios
        </p>
        <span className="text-[10px] text-gray-400">
          {q ? `${list.length} de ${total}` : `${total} lugares`}
        </span>
      </div>

      {/* List */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-3 pb-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(156,163,175,0.25) transparent" }}
      >
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Sin resultados en esta región</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {list.map((m) => (
              <li key={m.id}>
                <MunicipalityCard
                  municipality={m}
                  isSelected={selectedMunicipality?.id === m.id}
                  isFavorite={favoriteMunicipalitySlugs.includes(m.slug)}
                  onClick={() => onSelectMunicipality(m)}
                  onToggleFavorite={onToggleFavoriteMunicipality}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
