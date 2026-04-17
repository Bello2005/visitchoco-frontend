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
  { id: "inicio", label: "Inicio", path: "/", icon: Home, accent: "#1a5c45", desc: "Landing · presentación del Chocó" },
  { id: "mapa", label: "Mapa", path: "/mapa", icon: MapPinned, accent: "#0D9488", desc: "31 municipios · reservas indígenas" },
  { id: "animales", label: "Fauna", path: "/animales", icon: PawPrint, accent: "#34D399", desc: "577 aves · ballenas · jaguares" },
  { id: "cultura", label: "Cultura", path: "/cultura", icon: Landmark, accent: "#F59E0B", desc: "PES · Chirimía · patrimonio inmaterial" },
  { id: "historia", label: "Historia", path: "/historia", icon: BookOpen, accent: "#B45309", desc: "Cimarronaje · personajes · Atrato" },
  { id: "turismo", label: "Turismo", path: "/turismo", icon: MountainSnow, accent: "#0EA5E9", desc: "Destinos · ballenas · RNT" },
  { id: "fiestas", label: "Fiestas", path: "/fiestas", icon: PartyPopper, accent: "#F59E0B", desc: "San Pacho UNESCO · calendario" },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
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
        if (target) {
          navigate(target.path);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, activeIndex, navigate, onClose]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

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
            style={{ background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)" }}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[3001] overflow-hidden"
            style={{
              top: "12%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(620px, 92vw)",
              background: "#0c0c0c",
              border: "0.5px solid rgba(255,255,255,0.10)",
              borderRadius: 18,
              boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
            >
              <Search size={17} className="text-white/35 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                placeholder="Buscar municipio, especie, historia, cultura..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/25 text-base"
              />
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/60 transition-colors shrink-0 border-none bg-transparent cursor-pointer p-1"
              >
                <X size={15} />
              </button>
              <span
                className="hidden sm:block text-[11px] text-white/25 shrink-0 font-mono px-1.5 py-0.5 rounded"
                style={{ border: "0.5px solid rgba(255,255,255,0.12)" }}
              >
                esc
              </span>
            </div>

            {!query ? (
              <>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/25 font-medium px-1">
                    Explorar
                  </span>
                </div>
                <div className="pb-3">
                  {QUICK_LINKS.map((link, idx) => {
                    const Icon = link.icon;
                    const isHighlighted = idx === activeIndex;
                    return (
                      <button
                        key={link.id}
                        onClick={() => handleNavigation(link.path)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className="w-full flex items-center gap-3 px-5 py-2.5 cursor-pointer border-none text-left outline-none transition-colors"
                        style={{
                          background: isHighlighted
                            ? "rgba(255,255,255,0.05)"
                            : "transparent",
                        }}
                      >
                        <div
                          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                          style={{ background: `${link.accent}1a` }}
                        >
                          <Icon size={14} style={{ color: link.accent }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-white/85">
                            {link.label}
                          </div>
                          <div className="text-[11px] text-white/35 truncate">
                            {link.desc}
                          </div>
                        </div>
                        <span className="text-white/20 text-[12px] shrink-0">→</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="px-5 py-10 flex flex-col items-center gap-3">
                <Search size={28} className="text-white/15" />
                <p className="text-white/35 text-sm text-center">
                  Búsqueda completa próximamente
                </p>
                <p className="text-white/20 text-xs text-center">
                  Estamos indexando municipios, fauna, cultura e historia del Chocó
                </p>
              </div>
            )}

            <div
              className="flex items-center justify-between px-5 py-2.5"
              style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="text-[11px] text-white/20 font-serif"
                style={{ fontFamily: "Georgia, serif" }}
              >
                VisitChocó · Chocó, Colombia
              </span>
              <span className="text-[11px] text-white/20 hidden sm:block">
                ↑↓ navegar · ↵ ir · esc cerrar
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
