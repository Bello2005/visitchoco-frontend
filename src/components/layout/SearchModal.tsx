import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin } from "lucide-react";
import type { Municipality } from "../../services/municipality.service";
import { municipalityService } from "../../services/municipality.service";
import { SUBREGION_META, SUBREGION_ORDER } from "../../utils/subregionData";
import { municipioToSubregion } from "../../utils/subregionFromMunicipio";
import type { SubregionKey } from "../../utils/subregionFromMunicipio";
import { QUICK_LINKS } from "../../data/quickLinks";

// Module-level cache — fetched once per session, never re-fetched
let _cachedMunicipalities: Municipality[] | null = null;

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  municipalities?: Municipality[];
  onSelectMunicipality?: (m: Municipality) => void;
  onSelectSubregion?: (key: SubregionKey) => void;
}

const PANEL_STYLE: React.CSSProperties = {
  background: "#0c0c0c",
  border: "0.5px solid rgba(255,255,255,0.10)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)",
};

export default function SearchModal({
  isOpen,
  onClose,
  municipalities: municipalitiesProp,
  onSelectMunicipality,
  onSelectSubregion,
}: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [localMunicipalities, setLocalMunicipalities] = useState<Municipality[]>(
    _cachedMunicipalities ?? []
  );

  // Use prop-supplied list (map context) or self-fetched list
  const municipalities = municipalitiesProp ?? localMunicipalities;

  // Lazy-fetch on first open when no municipalities are passed in
  useEffect(() => {
    if (!isOpen || municipalitiesProp || _cachedMunicipalities) return;
    municipalityService.getAllMunicipalities().then((data) => {
      _cachedMunicipalities = data;
      setLocalMunicipalities(data);
    });
  }, [isOpen, municipalitiesProp]);

  const q = normalize(query);

  const subregionResults = q
    ? SUBREGION_ORDER.filter((k) => normalize(SUBREGION_META[k].label).includes(q)).slice(0, 3)
    : [];

  const municipalityResults = q
    ? municipalities
        .filter(
          (m) =>
            normalize(m.name).includes(q) ||
            normalize(m.description ?? "").includes(q)
        )
        .slice(0, 6)
    : [];

  const totalResults = subregionResults.length + municipalityResults.length;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const max = q ? totalResults - 1 : QUICK_LINKS.length - 1;
        setActiveIndex((i) => Math.min(i + 1, max));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        if (q) {
          const subregionIdx = activeIndex;
          const municipalityIdx = activeIndex - subregionResults.length;
          if (subregionIdx < subregionResults.length) {
            handleSelectSubregion(subregionResults[subregionIdx]);
          } else if (municipalityResults[municipalityIdx]) {
            handleSelectMunicipality(municipalityResults[municipalityIdx]);
          }
        } else {
          const target = QUICK_LINKS[activeIndex];
          if (target) { navigate(target.path); onClose(); }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeIndex, q, subregionResults, municipalityResults, navigate, onClose]);

  const handleSelectMunicipality = (m: Municipality) => {
    if (onSelectMunicipality) {
      onSelectMunicipality(m);
    } else {
      navigate(`/mapa?m=${m.slug}`);
    }
    onClose();
  };

  const handleSelectSubregion = (key: SubregionKey) => {
    if (onSelectSubregion) {
      onSelectSubregion(key);
    } else {
      navigate(`/mapa?sub=${key}`);
    }
    onClose();
  };

  const innerContent = (
    <>
      {/* Search input */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 md:px-5 md:py-4"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
      >
        <Search size={16} className="text-white/35 shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
          placeholder="Buscar municipio, región, fauna, historia…"
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/25 text-[15px] md:text-base"
        />
        <button
          onClick={onClose}
          aria-label="Cerrar buscador"
          className="text-white/30 hover:text-white/60 transition-colors shrink-0 border-none bg-transparent cursor-pointer p-1.5 rounded-lg hover:bg-white/5"
        >
          <X size={15} aria-hidden="true" />
        </button>
        <span
          className="hidden md:inline-block text-[11px] text-white/25 shrink-0 font-mono px-1.5 py-0.5 rounded"
          style={{ border: "0.5px solid rgba(255,255,255,0.12)" }}
        >
          esc
        </span>
      </div>

      {/* Results */}
      {q ? (
        totalResults > 0 ? (
          <div
            className="overflow-y-auto overscroll-contain pb-2"
            style={{ maxHeight: "min(55dvh, 420px)" }}
          >
            {/* Subregions */}
            {subregionResults.length > 0 && (
              <>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/25 font-medium px-1">
                    Regiones
                  </span>
                </div>
                {subregionResults.map((key, idx) => {
                  const meta = SUBREGION_META[key];
                  const SubIcon = meta.Icon;
                  const isHighlighted = idx === activeIndex;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectSubregion(key)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className="w-full flex items-center gap-3 px-4 md:px-5 py-3 cursor-pointer border-none text-left outline-none transition-colors"
                      style={{ background: isHighlighted ? "rgba(255,255,255,0.05)" : "transparent" }}
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                        style={{ background: `${meta.primaryHex}1a` }}
                      >
                        <SubIcon size={15} style={{ color: meta.primaryHex }} strokeWidth={1.75} aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-white/85 leading-snug">{meta.label}</div>
                        <div className="text-[11px] text-white/35 truncate leading-snug">{meta.shortDescription}</div>
                      </div>
                      <span className="text-white/20 text-[12px] shrink-0" aria-hidden>→</span>
                    </button>
                  );
                })}
              </>
            )}

            {/* Municipalities */}
            {municipalityResults.length > 0 && (
              <>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/25 font-medium px-1">
                    Municipios
                  </span>
                </div>
                {municipalityResults.map((m, idx) => {
                  const sub = municipioToSubregion(m.name);
                  const meta = SUBREGION_META[sub];
                  const SubIcon = meta.Icon;
                  const flatIdx = subregionResults.length + idx;
                  const isHighlighted = flatIdx === activeIndex;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMunicipality(m)}
                      onMouseEnter={() => setActiveIndex(flatIdx)}
                      className="w-full flex items-center gap-3 px-4 md:px-5 py-3 cursor-pointer border-none text-left outline-none transition-colors"
                      style={{ background: isHighlighted ? "rgba(255,255,255,0.05)" : "transparent" }}
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                        style={{ background: `${meta.primaryHex}1a` }}
                      >
                        <SubIcon size={15} style={{ color: meta.primaryHex }} strokeWidth={1.75} aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-white/85 leading-snug">{m.name}</div>
                        <div className="text-[11px] text-white/35 truncate leading-snug flex items-center gap-1">
                          <MapPin size={9} aria-hidden />
                          {meta.label}
                        </div>
                      </div>
                      <span className="text-white/20 text-[12px] shrink-0" aria-hidden>→</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        ) : (
          <div className="px-5 py-10 flex flex-col items-center gap-3">
            <Search size={28} className="text-white/15" aria-hidden="true" />
            <p className="text-white/35 text-sm text-center">Sin resultados para "{query}"</p>
          </div>
        )
      ) : (
        <>
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/25 font-medium px-1">
              Explorar
            </span>
          </div>
          <div className="overflow-y-auto overscroll-contain pb-2"
            style={{ maxHeight: "min(55dvh, 420px)" }}
          >
            {QUICK_LINKS.map((link, idx) => {
              const Icon = link.icon;
              const isHighlighted = idx === activeIndex;
              return (
                <button
                  key={link.id}
                  onClick={() => { navigate(link.path); onClose(); }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className="w-full flex items-center gap-3 px-4 md:px-5 py-3 cursor-pointer border-none text-left outline-none transition-colors"
                  style={{ background: isHighlighted ? "rgba(255,255,255,0.05)" : "transparent" }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                    style={{ background: `${link.accent}1a` }}
                  >
                    <Icon size={15} style={{ color: link.accent }} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white/85 leading-snug">{link.label}</div>
                    <div className="text-[11px] text-white/35 truncate leading-snug">{link.desc}</div>
                  </div>
                  <span className="text-white/20 text-[12px] shrink-0" aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 md:px-5 py-2.5"
        style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-[11px] text-white/20" style={{ fontFamily: "Georgia, serif" }}>
          VisitChocó · Chocó, Colombia
        </span>
        <span className="text-[11px] text-white/20 hidden md:block">
          ↑↓ navegar · ↵ {q ? "abrir" : "ir"} · esc cerrar
        </span>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[3000]"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          />

          {/* MOBILE bottom sheet */}
          <motion.div
            key="panel-mobile"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
            className="md:hidden fixed inset-x-0 bottom-0 z-[3001] overflow-hidden"
            style={{
              ...PANEL_STYLE,
              borderRadius: "20px 20px 0 0",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-white/15" />
            </div>
            {innerContent}
          </motion.div>

          {/* DESKTOP centered dialog */}
          <motion.div
            key="panel-desktop"
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block fixed z-[3001] overflow-hidden"
            style={{
              ...PANEL_STYLE,
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(620px, 92vw)",
              borderRadius: 18,
            }}
          >
            {innerContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
