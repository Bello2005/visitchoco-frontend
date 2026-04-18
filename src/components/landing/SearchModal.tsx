import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Home,
  MapPinned,
  PawPrint,
  Landmark,
  BookOpen,
  MountainSnow,
  PartyPopper,
  X,
} from "lucide-react";

const QUICK_LINKS = [
  { id: "inicio",   label: "Inicio",   path: "/",         icon: Home,         accent: "#1a5c45", desc: "Landing · presentación del Chocó"     },
  { id: "mapa",     label: "Mapa",     path: "/mapa",     icon: MapPinned,    accent: "#0D9488", desc: "31 municipios · reservas indígenas"    },
  { id: "animales", label: "Fauna",    path: "/animales", icon: PawPrint,     accent: "#34D399", desc: "577 aves · ballenas · jaguares"        },
  { id: "cultura",  label: "Cultura",  path: "/cultura",  icon: Landmark,     accent: "#F59E0B", desc: "PES · Chirimía · patrimonio inmaterial" },
  { id: "historia", label: "Historia", path: "/historia", icon: BookOpen,     accent: "#B45309", desc: "Cimarronaje · personajes · Atrato"     },
  { id: "turismo",  label: "Turismo",  path: "/turismo",  icon: MountainSnow, accent: "#0EA5E9", desc: "Destinos · ballenas · RNT"             },
  { id: "fiestas",  label: "Fiestas",  path: "/fiestas",  icon: PartyPopper,  accent: "#F59E0B", desc: "San Pacho UNESCO · calendario"         },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PANEL_STYLE: React.CSSProperties = {
  background: "#0c0c0c",
  border: "0.5px solid rgba(255,255,255,0.10)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)",
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, QUICK_LINKS.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        const target = QUICK_LINKS[activeIndex];
        if (target) { navigate(target.path); onClose(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, activeIndex, navigate, onClose]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  // Shared inner content — reutilizado en ambos layouts
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
          placeholder="Buscar municipio, especie, historia..."
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

      {/* Results / Quick links */}
      {!query ? (
        <>
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/25 font-medium px-1">
              Explorar
            </span>
          </div>
          {/* Scrollable list — key for responsive height */}
          <div className="overflow-y-auto overscroll-contain pb-2"
            style={{ maxHeight: "min(55dvh, 420px)" }}
          >
            {QUICK_LINKS.map((link, idx) => {
              const Icon = link.icon;
              const isHighlighted = idx === activeIndex;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavigation(link.path)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className="w-full flex items-center gap-3 px-4 md:px-5 py-3 cursor-pointer border-none text-left outline-none transition-colors"
                  style={{
                    background: isHighlighted ? "rgba(255,255,255,0.05)" : "transparent",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                    style={{ background: `${link.accent}1a` }}
                  >
                    <Icon size={15} style={{ color: link.accent }} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white/85 leading-snug">
                      {link.label}
                    </div>
                    <div className="text-[11px] text-white/35 truncate leading-snug">
                      {link.desc}
                    </div>
                  </div>
                  <span className="text-white/20 text-[12px] shrink-0" aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="px-5 py-10 flex flex-col items-center gap-3">
          <Search size={28} className="text-white/15" aria-hidden="true" />
          <p className="text-white/35 text-sm text-center">
            Búsqueda completa próximamente
          </p>
          <p className="text-white/20 text-xs text-center">
            Estamos indexando municipios, fauna, cultura e historia del Chocó
          </p>
        </div>
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
          ↑↓ navegar · ↵ ir · esc cerrar
        </span>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
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

          {/* ── MOBILE bottom sheet — < 768px ─────────────────────────────── */}
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
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-white/15" />
            </div>
            {innerContent}
          </motion.div>

          {/* ── TABLET + DESKTOP centered dialog — ≥ 768px ────────────────── */}
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
