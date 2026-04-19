import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface PanelHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isSearchActive: boolean;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClose,
  inputRef,
  isSearchActive,
}) => {
  const shortcutLabel = useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl+K";
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
      navigator.platform ??
      navigator.userAgent;
    const isApple = /Mac|iPhone|iPad|iPod/i.test(platform);
    return isApple ? "⌘K" : "Ctrl+K";
  }, []);

  const handleX = () => {
    if (isSearchActive) {
      onSearchChange("");
      onClose(); // onClose here means "close search / close panel" - caller decides
    } else {
      onClose();
    }
  };

  return (
    <div className="flex-none px-4 pt-4 pb-2.5">
      <div className="flex items-center gap-2.5">
        {/* Logo */}
        <Link to="/" aria-label="Ir al inicio" className="flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -3 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-emerald-600 flex items-center justify-center"
            style={{
              boxShadow: "0 2px 8px rgba(6,95,70,0.20), inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            <span className="text-white text-[11px] font-bold tracking-tight">VC</span>
          </motion.div>
        </Link>

        {/* Search input */}
        <label
          className={`relative flex-1 flex items-center gap-2 h-10 px-3 rounded-full transition-all duration-200 ${
            isSearchActive
              ? "bg-white ring-2 ring-teal-400/50 shadow-[0_0_0_4px_rgba(20,184,166,0.08)]"
              : "bg-gray-100/70 ring-1 ring-gray-200/60 hover:bg-gray-100"
          }`}
        >
          <Search
            size={15}
            strokeWidth={2.25}
            className={`flex-shrink-0 transition-colors ${isSearchActive ? "text-teal-500" : "text-gray-500"}`}
          />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            placeholder="Buscar municipio o región"
            autoComplete="off"
            spellCheck={false}
            aria-label="Buscar municipio o región"
            aria-expanded={isSearchActive}
            aria-controls="search-results-panel"
            aria-autocomplete="list"
            className="flex-1 min-w-0 bg-transparent text-[13px] font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
          />
          {!isSearchActive && (
            <span className="hidden sm:inline-flex flex-shrink-0 text-[10px] text-gray-400 font-mono px-1.5 py-0.5 rounded bg-white/80 ring-1 ring-gray-200/70 pointer-events-none">
              {shortcutLabel}
            </span>
          )}
        </label>

        {/* Close — always one X */}
        <motion.button
          onClick={handleX}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 transition-colors duration-150"
          aria-label={isSearchActive ? "Cerrar búsqueda" : "Cerrar panel"}
        >
          <X size={17} strokeWidth={2.25} />
        </motion.button>
      </div>
    </div>
  );
};
