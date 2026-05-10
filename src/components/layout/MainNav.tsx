import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import {
  MapPinned, PawPrint, PartyPopper, MountainSnow, Landmark, BookOpen,
  Search, Command, Home as HomeIcon, type LucideIcon,
} from "lucide-react";
import { Logo } from "../brand/Logo";
import { cn } from "../../lib/cn";
import { ease, dur } from "../../lib/motion";
import { SearchModal } from "./SearchModal";

export const NAV_DESKTOP_OFFSET = 88;
export const NAV_MOBILE_OFFSET  = 56;

// Backward-compat exports
export const MAIN_NAV_DESKTOP_PT_CLASS = "lg:pt-20";
export const MAIN_NAV_MOBILE_BOTTOM_CLASS = "pb-14";

interface NavLink {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  description: string;
}

const NAV_LINKS: NavLink[] = [
  { id: "home",     label: "Inicio",   href: "/",         Icon: HomeIcon,     description: "Portada y descubrimiento" },
  { id: "mapa",     label: "Mapa",     href: "/mapa",     Icon: MapPinned,    description: "31 municipios · 125 resguardos" },
  { id: "fauna",    label: "Fauna",    href: "/animales", Icon: PawPrint,     description: "577 aves · ballenas · jaguares" },
  { id: "cultura",  label: "Cultura",  href: "/cultura",  Icon: Landmark,     description: "PES UNESCO · chirimía · gastronomía" },
  { id: "historia", label: "Historia", href: "/historia", Icon: BookOpen,     description: "500 años · cimarronaje · Atrato" },
  { id: "turismo",  label: "Turismo",  href: "/turismo",  Icon: MountainSnow, description: "Costa · selva · 602 prestadores RNT" },
  { id: "fiestas",  label: "Fiestas",  href: "/fiesta",   Icon: PartyPopper,  description: "37 fiestas · 12 meses · UNESCO" },
];

function getActiveId(pathname: string): string {
  if (pathname === "/")                  return "home";
  if (pathname.startsWith("/mapa"))      return "mapa";
  if (pathname.startsWith("/animales"))  return "fauna";
  if (pathname.startsWith("/cultura"))   return "cultura";
  if (pathname.startsWith("/historia"))  return "historia";
  if (pathname.startsWith("/turismo"))   return "turismo";
  if (pathname.startsWith("/fiesta"))    return "fiestas";
  return "";
}

interface MainNavProps {
  initialQuery?: string;
  /** @deprecated */
  active?: string;
  onLogin?: () => void;
}

export function MainNav({ initialQuery = "" }: MainNavProps) {
  const { pathname } = useLocation();
  const activeId = useMemo(() => getActiveId(pathname), [pathname]);
  const reduce = useReducedMotion();

  const [scrolled, setScrolled]     = useState(false);
  const [scrollDir, setScrollDir]   = useState<"up" | "down">("up");
  const [lastY, setLastY]           = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 60);
    if (y > 80) setScrollDir(y > lastY ? "down" : "up");
    setLastY(y);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ───── DESKTOP FLOATING PILL ────────────────────────────── */}
      <motion.header
        className="hidden md:flex fixed inset-x-0 top-3 z-[2000] justify-center px-6 pointer-events-none"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { duration: dur.slow, ease: ease.out }}
      >
        <motion.nav
          aria-label="Principal"
          className={cn(
            "pointer-events-auto flex items-center gap-1 rounded-full border",
            "border-white/[0.08] backdrop-blur-2xl",
            "shadow-[0_8px_32px_rgba(0,0,0,0.18)]",
          )}
          style={{
            background:
              "linear-gradient(180deg, rgba(14,16,18,0.78) 0%, rgba(14,16,18,0.86) 100%)",
          }}
          animate={{
            height: scrolled ? 44 : 52,
            paddingLeft:  scrolled ? 8  : 12,
            paddingRight: scrolled ? 8  : 12,
          }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
        >
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full px-2 py-1 text-white/90 hover:text-white transition-colors"
            aria-label="VisitChocó — inicio"
          >
            <Logo className="text-current" markOnly={scrolled} />
          </Link>

          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />

          <ul className="flex items-center gap-0.5">
            {NAV_LINKS.filter((l) => l.id !== "home").map(({ id, label, href, Icon }) => {
              const isActive = activeId === id;
              return (
                <li key={id}>
                  <Link
                    to={href}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-3 py-1.5",
                      "text-[13px] font-medium transition-colors",
                      isActive
                        ? "text-white"
                        : "text-white/60 hover:text-white/90",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && !reduce && (
                      <motion.span
                        layoutId="navActive"
                        className="absolute inset-0 rounded-full bg-white/10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      size={14}
                      className={cn("relative z-10", isActive && "text-[var(--accent-fg)]")}
                      strokeWidth={isActive ? 2.25 : 1.75}
                    />
                    <motion.span
                      className="relative z-10 overflow-hidden whitespace-nowrap"
                      animate={{ width: scrolled ? 0 : "auto", opacity: scrolled ? 0 : 1 }}
                      transition={reduce ? { duration: 0 } : { duration: dur.fast, ease: ease.out }}
                    >
                      {label}
                    </motion.span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5",
              "text-[13px] font-medium text-white/60 hover:text-white",
              "border border-white/10 hover:border-white/20",
              "transition-colors",
            )}
            aria-label="Abrir búsqueda (Cmd+K)"
          >
            <Search size={13} strokeWidth={2} />
            <motion.span
              className="overflow-hidden flex items-center gap-1.5"
              animate={{ width: scrolled ? 0 : "auto", opacity: scrolled ? 0 : 1 }}
              transition={reduce ? { duration: 0 } : { duration: dur.fast, ease: ease.out }}
            >
              Buscar
              <kbd className="ml-1 hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono text-white/40">
                <Command size={9} /> K
              </kbd>
            </motion.span>
          </button>
        </motion.nav>
      </motion.header>

      {/* ───── MOBILE TOP BAR ──────────────────────────────────── */}
      <header className="md:hidden fixed inset-x-0 top-0 z-[2000] h-12 flex items-center justify-between px-4 backdrop-blur-xl bg-[rgba(14,16,18,0.78)] border-b border-white/[0.06]">
        <Link to="/" className="text-white/90" aria-label="Inicio">
          <Logo className="text-current" />
        </Link>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="p-2 -mr-2 text-white/70 hover:text-white"
          aria-label="Buscar"
        >
          <Search size={18} strokeWidth={2} />
        </button>
      </header>

      {/* ───── MOBILE BOTTOM TAB BAR ──────────────────────────── */}
      <motion.nav
        aria-label="Secciones"
        className="md:hidden fixed inset-x-0 bottom-0 z-[2000] h-14 backdrop-blur-xl bg-[rgba(14,16,18,0.86)] border-t border-white/[0.06]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        animate={{ y: scrollDir === "down" && scrolled ? 64 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
      >
        <ul className="flex h-full items-stretch justify-around">
          {NAV_LINKS.filter((l) => l.id !== "home").slice(0, 6).map(({ id, label, href, Icon }) => {
            const isActive = activeId === id;
            return (
              <li key={id} className="flex-1 min-w-0">
                <Link
                  to={href}
                  className={cn(
                    "relative flex h-full flex-col items-center justify-center gap-0.5",
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-white" : "text-white/50 hover:text-white/80",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && !reduce && (
                    <motion.span
                      layoutId="bottomDot"
                      className="absolute top-1 h-0.5 w-8 rounded-full bg-[var(--accent-fg)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} className={isActive ? "text-[var(--accent-fg)]" : ""} />
                  <span className="leading-none truncate max-w-[3.5rem]">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.nav>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        initialQuery={initialQuery}
        navLinks={NAV_LINKS}
      />
    </>
  );
}
