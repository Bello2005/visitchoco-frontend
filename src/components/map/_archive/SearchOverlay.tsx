import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Municipality } from "../../../services/municipality.service";
import type { IndigenousReserve } from "../../../services/indigenousReserve.service";

interface SearchOverlayProps {
  municipalities: Municipality[];
  reserves: IndigenousReserve[];
  onSelectMunicipality: (m: Municipality) => void;
  onSelectReserve: (r: IndigenousReserve) => void;
  onClose: () => void;
  className?: string;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  municipalities,
  reserves,
  onSelectMunicipality,
  onSelectReserve,
  onClose,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const matchedMunicipalities = q
    ? municipalities.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.zone?.toLowerCase().includes(q)
      )
    : [];

  const matchedReserves = q
    ? reserves.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.indigenous_people?.toLowerCase().includes(q)
      )
    : [];

  const hasResults = matchedMunicipalities.length > 0 || matchedReserves.length > 0;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className={`fixed inset-0 ${className}`}
        style={{ zIndex: 2400, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Search panel */}
      <motion.div
        className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4"
        style={{ zIndex: 2500 }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
          }}
        >
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar municipios, reservas indígenas..."
            className="flex-1 text-base text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors ml-1 flex-shrink-0"
          >
            Esc
          </button>
        </div>

        {/* Results */}
        {q && (
          <div
            className="mt-2 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              maxHeight: "55vh",
              overflowY: "auto",
            }}
          >
            {!hasResults ? (
              <div className="text-center py-10 text-gray-400">
                <span className="text-3xl">🔍</span>
                <p className="text-sm mt-2">Sin resultados para "{query}"</p>
              </div>
            ) : (
              <>
                {matchedMunicipalities.length > 0 && (
                  <ResultSection title="Municipios" icon="🏘️">
                    {matchedMunicipalities.slice(0, 6).map((m) => (
                      <ResultItem
                        key={m.id}
                        icon={m.emoji || "📍"}
                        title={m.name}
                        subtitle={m.zone || m.description?.slice(0, 60)}
                        onClick={() => onSelectMunicipality(m)}
                      />
                    ))}
                  </ResultSection>
                )}
                {matchedReserves.length > 0 && (
                  <ResultSection title="Reservas Indígenas" icon="🏺">
                    {matchedReserves.slice(0, 4).map((r) => (
                      <ResultItem
                        key={r.id}
                        icon="🏺"
                        title={r.name}
                        subtitle={r.indigenous_people ? `Pueblo ${r.indigenous_people}` : undefined}
                        onClick={() => onSelectReserve(r)}
                      />
                    ))}
                  </ResultSection>
                )}
              </>
            )}
          </div>
        )}

        {/* Hint when empty */}
        {!q && (
          <div
            className="mt-2 px-4 py-3 rounded-2xl text-sm text-gray-400 text-center"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          >
            Escribe para buscar entre {municipalities.length} municipios y {reserves.length} reservas
          </div>
        )}
      </motion.div>
    </>
  );
};

const ResultSection: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div>
    <div className="px-4 py-2 flex items-center gap-1.5 border-b border-gray-100/60">
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</span>
    </div>
    <div>{children}</div>
  </div>
);

const ResultItem: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
}> = ({ icon, title, subtitle, onClick }) => (
  <motion.button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors duration-150 text-left"
    whileTap={{ scale: 0.99 }}
  >
    <span className="text-xl flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>
      )}
    </div>
    <svg
      className="w-4 h-4 text-gray-300 flex-shrink-0 ml-auto"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </motion.button>
);
