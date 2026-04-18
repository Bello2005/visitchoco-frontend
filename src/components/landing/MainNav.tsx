import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Home,
  MapPinned,
  PawPrint,
  Landmark,
  BookOpen,
  MountainSnow,
  PartyPopper,
  Search,
  type LucideIcon,
} from "lucide-react";
import SearchModal from "./SearchModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavLink = {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
};

// ─── Nav data ─────────────────────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { id: "inicio",   label: "Inicio",   href: "/",         Icon: Home         },
  { id: "mapa",     label: "Mapa",     href: "/mapa",     Icon: MapPinned    },
  { id: "fauna",    label: "Fauna",    href: "/animales", Icon: PawPrint     },
  { id: "cultura",  label: "Cultura",  href: "/cultura",  Icon: Landmark     },
  { id: "historia", label: "Historia", href: "/historia", Icon: BookOpen     },
  { id: "turismo",  label: "Turismo",  href: "/turismo",  Icon: MountainSnow },
  { id: "fiestas",  label: "Fiestas",  href: "/fiesta",   Icon: PartyPopper  },
];

// 6 items visible in mobile bottom tab
const MOBILE_LINKS = NAV_LINKS.filter(({ id }) =>
  ["inicio", "mapa", "fauna", "cultura", "historia", "fiestas"].includes(id)
);

// ─── Shared pill glass style ───────────────────────────────────────────────────

const PILL_STYLE: React.CSSProperties = {
  background: "rgba(10,10,10,0.84)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.06)",
};

const VC_BADGE_STYLE: React.CSSProperties = {
  background: "rgba(52,211,153,0.15)",
  border: "1px solid rgba(52,211,153,0.30)",
};

// ─── Exported layout helpers (used by page wrappers) ─────────────────────────

export const MAIN_NAV_DESKTOP_PT_CLASS = "lg:pt-20";
export const MAIN_NAV_MOBILE_BOTTOM_CLASS = "pb-14";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MainNavProps {
  /** Override active item id. Derived from pathname when omitted. */
  active?: string;
  /** Reserved for future auth flow — currently unused. */
  onLogin?: () => void | Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MainNav({ active, onLogin: _onLogin }: MainNavProps) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Derive active id from prop or current pathname
  const activeId = useMemo<string>(() => {
    if (active) return active.toLowerCase();
    const path = location.pathname;
    if (path === "/") return "inicio";
    for (const link of NAV_LINKS) {
      if (link.href !== "/" && path.startsWith(link.href)) return link.id;
    }
    return "";
  }, [active, location.pathname]);

  // Scroll-collapse for desktop pill (≥1024px)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MOBILE — bottom tab bar                    < 768px
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-[2000]"
        aria-label="Navegación principal"
        style={{
          background: "rgba(10,10,10,0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.32)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-stretch justify-around h-14">
          {MOBILE_LINKS.map(({ id, label, href, Icon }) => {
            const isActive = activeId === id;
            return (
              <a
                key={id}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 no-underline transition-colors duration-150"
                style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)" }}
              >
                {/* Active indicator — top bar */}
                {isActive && (
                  <span
                    className="absolute top-0 inset-x-[30%] h-0.5 rounded-full bg-emerald-400"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-medium leading-none truncate">
                  {label}
                </span>
              </a>
            );
          })}

          {/* Search — último item del tab bar */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar"
            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 border-none bg-transparent cursor-pointer transition-colors duration-150"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <Search size={21} strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[10px] font-medium leading-none truncate">
              Buscar
            </span>
          </button>
        </div>
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TABLET — pill solo iconos           768px – 1023px
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div
        className="hidden md:flex lg:hidden fixed top-3 left-1/2 -translate-x-1/2 z-[2000]"
      >
        <nav
          className="flex items-center gap-0.5 px-2 rounded-2xl h-11"
          style={PILL_STYLE}
          aria-label="Navegación principal"
        >
          {/* Logo — badge only */}
          <a
            href="/"
            className="flex items-center justify-center w-7 h-7 rounded-lg mr-1 shrink-0"
            style={VC_BADGE_STYLE}
            title="VisitChocó — Inicio"
          >
            <span className="text-emerald-400 font-black text-xs leading-none">
              VC
            </span>
          </a>

          <div className="w-px h-5 bg-white/10 mx-0.5" aria-hidden="true" />

          {/* Nav items — icon only */}
          {NAV_LINKS.map(({ id, label, href, Icon }) => {
            const isActive = activeId === id;
            return (
              <a
                key={id}
                href={href}
                title={label}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-white/[0.12] text-white"
                    : "text-white/55 hover:text-white/90 hover:bg-white/[0.08]"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.75} aria-hidden="true" />
              </a>
            );
          })}

          <div className="w-px h-5 bg-white/10 mx-0.5" aria-hidden="true" />

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            title="Buscar"
            aria-label="Buscar"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-white/55 hover:text-white/90 hover:bg-white/[0.08] transition-all duration-150"
          >
            <Search size={15} aria-hidden="true" />
          </button>
        </nav>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          DESKTOP — pill completo + scroll-collapse    ≥ 1024px
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div
        className="hidden lg:flex fixed top-3 left-1/2 -translate-x-1/2 z-[2000]"
      >
        <nav
          className="flex items-center gap-1 px-3 rounded-2xl h-12"
          style={PILL_STYLE}
          aria-label="Navegación principal"
        >
          {/* Logo — badge + wordmark */}
          <a
            href="/"
            className="flex items-center gap-2 pr-3 mr-1 border-r border-white/10 shrink-0"
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={VC_BADGE_STYLE}
            >
              <span className="text-emerald-400 font-black text-xs leading-none">
                VC
              </span>
            </div>
            <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">
              Visit<span className="text-emerald-400">Chocó</span>
            </span>
          </a>

          {/* Nav links with scroll-collapse labels */}
          {NAV_LINKS.map(({ id, label, href, Icon }) => {
            const isActive = activeId === id;
            return (
              <a
                key={id}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-white/[0.12] text-white"
                    : "text-white/60 hover:text-white/90 hover:bg-white/[0.08]"
                }`}
              >
                <Icon size={14} strokeWidth={isActive ? 2.5 : 1.75} aria-hidden="true" />
                <span
                  className="whitespace-nowrap overflow-hidden transition-all duration-200"
                  style={{
                    maxWidth: scrolled ? 0 : 56,
                    opacity: scrolled ? 0 : 1,
                    marginLeft: scrolled ? 0 : undefined,
                  }}
                >
                  {label}
                </span>
              </a>
            );
          })}

          <div className="w-px h-5 bg-white/10 mx-1" aria-hidden="true" />

          {/* Search + ⌘K */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/10 text-xs font-medium transition-all duration-150"
            aria-label="Buscar"
          >
            <Search size={14} aria-hidden="true" />
            <span
              className="whitespace-nowrap"
              style={{
                maxWidth: scrolled ? 0 : 28,
                opacity: scrolled ? 0 : 1,
                overflow: "hidden",
                transition: "all 200ms",
              }}
            >
              ⌘K
            </span>
          </button>
        </nav>
      </div>

      {/* ── SearchModal — global ──────────────────────────────────────────── */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
