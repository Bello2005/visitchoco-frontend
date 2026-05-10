import { useEffect } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, type LucideIcon } from "lucide-react";
import { dur, ease } from "../../lib/motion";
import { cn } from "../../lib/cn";

interface NavLink {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  description: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
  navLinks: NavLink[];
}

export function SearchModal({ open, onClose, initialQuery, navLinks }: SearchModalProps) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[3000] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduce ? { duration: 0 } : { duration: dur.fast }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" aria-hidden />

          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{    opacity: 0, y: -8, scale: 0.97 }}
            transition={reduce ? { duration: 0 } : { duration: dur.base, ease: ease.out }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full max-w-xl",
              "rounded-2xl border border-white/10 bg-carbon-950 shadow-[0_24px_64px_rgba(0,0,0,0.5)]",
              "overflow-hidden",
            )}
          >
            <Command label="Búsqueda VisitChocó" shouldFilter loop>
              <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
                <Search size={16} className="text-white/40 shrink-0" />
                <Command.Input
                  autoFocus
                  defaultValue={initialQuery}
                  placeholder="Buscar municipios, fiestas, gastronomía…"
                  className={cn(
                    "flex-1 bg-transparent py-4 text-[15px] text-white placeholder:text-white/30",
                    "outline-none",
                  )}
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono text-white/40">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto px-2 py-2">
                <Command.Empty className="px-4 py-12 text-center">
                  <p className="text-white/40 text-sm">
                    Búsqueda completa próximamente.
                  </p>
                  <p className="text-white/20 text-xs mt-1">
                    Mientras tanto, navega por las secciones abajo.
                  </p>
                </Command.Empty>

                <Command.Group
                  heading="Secciones"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-eyebrow [&_[cmdk-group-heading]]:text-white/30"
                >
                  {navLinks.map(({ id, label, href, Icon, description }) => (
                    <Command.Item
                      key={id}
                      value={`${label} ${description}`}
                      onSelect={() => { navigate(href); onClose(); }}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer",
                        "data-[selected=true]:bg-white/[0.06]",
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[var(--accent-fg)] group-data-[selected=true]:bg-[var(--accent-bg)]">
                        <Icon size={16} strokeWidth={1.75} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{label}</p>
                        <p className="text-xs text-white/40 truncate">{description}</p>
                      </span>
                      <ArrowRight size={14} className="text-white/20 group-data-[selected=true]:text-white/60 transition-colors" />
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] text-[11px] text-white/30">
                <span>VisitChocó · Quibdó</span>
                <span className="flex items-center gap-2">
                  <kbd className="font-mono">↑↓</kbd> navegar
                  <kbd className="font-mono">↵</kbd> abrir
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
