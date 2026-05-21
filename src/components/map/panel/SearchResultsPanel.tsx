import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import type { Municipality } from "../../../services/municipality.service";
import type { SubregionKey } from "../../../utils/subregionFromMunicipio";
import { municipioToSubregion } from "../../../utils/subregionFromMunicipio";
import { SUBREGION_META, SUBREGION_ORDER } from "../../../utils/subregionData";
import { QUICK_LINKS } from "../../../data/quickLinks";
import { useSearchNavigation } from "../../../hooks/useSearchNavigation";

const normalize = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

interface SearchResultsPanelProps {
  query: string;
  municipalities: Municipality[];
  onSelectMunicipality: (m: Municipality) => void;
  onSelectSubregion: (key: SubregionKey) => void;
  onClose: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: Math.min(i, 8) * 0.03, duration: 0.22, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] },
  }),
};

export const SearchResultsPanel: React.FC<SearchResultsPanelProps> = ({
  query,
  municipalities,
  onSelectMunicipality,
  onSelectSubregion,
  onClose,
}) => {
  const navigate = useNavigate();
  const q = normalize(query);

  const subregionHits = useMemo(() =>
    q ? SUBREGION_ORDER.filter((k) => normalize(SUBREGION_META[k].label).includes(q)).slice(0, 5) : [],
    [q]
  );

  const municipalityHits = useMemo(() =>
    q
      ? municipalities
          .filter((m) =>
            normalize(m.name).includes(q) ||
            normalize(m.description ?? "").includes(q) ||
            normalize(m.main_activity ?? "").includes(q)
          )
          .slice(0, 6)
      : [],
    [municipalities, q]
  );

  const sectionHits = useMemo(() =>
    q ? QUICK_LINKS.filter((l) => normalize(l.label + " " + l.desc).includes(q)) : QUICK_LINKS,
    [q]
  );

  // Build flat list for keyboard nav
  type FlatItem =
    | { type: "subregion"; key: SubregionKey }
    | { type: "municipality"; m: Municipality }
    | { type: "section"; link: (typeof QUICK_LINKS)[0] };

  const flatItems = useMemo<FlatItem[]>(() => {
    if (!q) return QUICK_LINKS.map((link) => ({ type: "section" as const, link }));
    return [
      ...subregionHits.map((key) => ({ type: "subregion" as const, key })),
      ...municipalityHits.map((m) => ({ type: "municipality" as const, m })),
      ...sectionHits.map((link) => ({ type: "section" as const, link })),
    ];
  }, [q, subregionHits, municipalityHits, sectionHits]);

  const handleEnter = (idx: number) => {
    const item = flatItems[idx];
    if (!item) return;
    if (item.type === "subregion") { onSelectSubregion(item.key); onClose(); }
    else if (item.type === "municipality") { onSelectMunicipality(item.m); onClose(); }
    else { navigate(item.link.path); onClose(); }
  };

  const { activeIndex, setActiveIndex } = useSearchNavigation({
    isActive: true,
    totalItems: flatItems.length,
    onEnter: handleEnter,
    onEscape: onClose,
  });

  const isEmpty = q && subregionHits.length === 0 && municipalityHits.length === 0 && sectionHits.length === 0;

  const content = (
    <div
      id="search-results-panel"
      role="listbox"
      aria-label="Resultados de búsqueda"
      className="flex flex-col h-full overflow-y-auto"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(156,163,175,0.25) transparent" }}
    >
      {isEmpty ? (
        <EmptyState query={query} />
      ) : (
        <div className="px-3 py-3 space-y-0.5">
          {/* ── Quick links (no query) ── */}
          {!q && (
            <>
              <SectionLabel>Explorar</SectionLabel>
              {QUICK_LINKS.map((link, i) => {
                const Icon = link.icon;
                const flatIdx = i;
                return (
                  <ResultRow
                    key={link.id}
                    index={i}
                    isActive={activeIndex === flatIdx}
                    onHover={() => setActiveIndex(flatIdx)}
                    onClick={() => { navigate(link.path); onClose(); }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${link.accent}1a` }}
                    >
                      <Icon size={15} style={{ color: link.accent }} strokeWidth={1.75} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-800 leading-snug">{link.label}</p>
                      <p className="text-[11px] text-gray-400 truncate leading-snug">{link.desc}</p>
                    </div>
                    <span className="text-gray-300 text-[12px]" aria-hidden>→</span>
                  </ResultRow>
                );
              })}
            </>
          )}

          {/* ── Subregions ── */}
          {q && subregionHits.length > 0 && (
            <>
              <SectionLabel>Regiones</SectionLabel>
              {subregionHits.map((key, i) => {
                const meta = SUBREGION_META[key];
                const SubIcon = meta.Icon;
                const flatIdx = i;
                return (
                  <ResultRow
                    key={key}
                    index={i}
                    isActive={activeIndex === flatIdx}
                    onHover={() => setActiveIndex(flatIdx)}
                    onClick={() => { onSelectSubregion(key); onClose(); }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.primaryHex}18` }}
                    >
                      <SubIcon size={15} strokeWidth={1.75} style={{ color: meta.primaryHex }} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-800 leading-snug">{meta.label}</p>
                      <p className="text-[11px] text-gray-400 truncate leading-snug">{meta.shortDescription}</p>
                    </div>
                    <span className="text-gray-300 text-[12px]" aria-hidden>→</span>
                  </ResultRow>
                );
              })}
            </>
          )}

          {/* ── Municipalities ── */}
          {q && municipalityHits.length > 0 && (
            <>
              <SectionLabel>Municipios</SectionLabel>
              {municipalityHits.map((m, i) => {
                const sub = municipioToSubregion(m.name);
                const meta = SUBREGION_META[sub];
                const SubIcon = meta.Icon;
                const flatIdx = subregionHits.length + i;
                return (
                  <ResultRow
                    key={m.id}
                    index={i}
                    isActive={activeIndex === flatIdx}
                    onHover={() => setActiveIndex(flatIdx)}
                    onClick={() => { onSelectMunicipality(m); onClose(); }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.primaryHex}18` }}
                    >
                      <SubIcon size={14} strokeWidth={1.75} style={{ color: meta.primaryHex }} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-800 leading-snug">{m.name}</p>
                      <p className="text-[11px] text-gray-400 truncate leading-snug flex items-center gap-1">
                        <MapPin size={9} aria-hidden />{meta.label}
                      </p>
                    </div>
                    <span className="text-gray-300 text-[12px]" aria-hidden>→</span>
                  </ResultRow>
                );
              })}
            </>
          )}

          {/* ── Site sections ── */}
          {q && sectionHits.length > 0 && (
            <>
              <SectionLabel>Secciones</SectionLabel>
              {sectionHits.map((link, i) => {
                const Icon = link.icon;
                const flatIdx = subregionHits.length + municipalityHits.length + i;
                return (
                  <ResultRow
                    key={link.id}
                    index={i}
                    isActive={activeIndex === flatIdx}
                    onHover={() => setActiveIndex(flatIdx)}
                    onClick={() => { navigate(link.path); onClose(); }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${link.accent}1a` }}
                    >
                      <Icon size={14} style={{ color: link.accent }} strokeWidth={1.75} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-800 leading-snug">{link.label}</p>
                      <p className="text-[11px] text-gray-400 truncate leading-snug">{link.desc}</p>
                    </div>
                    <span className="text-gray-300 text-[12px]" aria-hidden>→</span>
                  </ResultRow>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Footer hint */}
      <div className="flex-none mt-auto px-4 py-2 border-t border-gray-100/60">
        <p className="text-[10px] text-gray-300 hidden sm:block">
          ↑↓ navegar · ↵ {q ? "abrir" : "ir"} · esc cerrar
        </p>
      </div>
    </div>
  );

  return (
    <motion.div
      key="search-results"
      className="flex-1 min-h-0 flex flex-col"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } }}
      exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
    >
      {content}
    </motion.div>
  );
};

/* ─── helpers ───────────────────────────────────────────────── */

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-2 pb-1">
    {children}
  </p>
);

const ResultRow: React.FC<{
  children: React.ReactNode;
  index: number;
  isActive: boolean;
  onHover: () => void;
  onClick: () => void;
}> = ({ children, index, isActive, onHover, onClick }) => (
  <motion.button
    role="option"
    aria-selected={isActive}
    onClick={onClick}
    onMouseEnter={onHover}
    custom={index}
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-colors duration-100 ${
      isActive ? "bg-gray-100/80" : "hover:bg-gray-50/80"
    }`}
  >
    {children}
  </motion.button>
);

const EmptyState: React.FC<{ query: string }> = ({ query }) => (
  <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Search size={16} className="text-gray-400" strokeWidth={1.75} />
    </div>
    <p className="text-xs text-gray-500">Sin resultados para</p>
    <p className="text-xs font-medium text-gray-700 mt-0.5">"{query}"</p>
  </div>
);
