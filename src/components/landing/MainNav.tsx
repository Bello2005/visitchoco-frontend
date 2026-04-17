import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MapPinned,
  PawPrint,
  Landmark,
  BookOpen,
  MountainSnow,
  PartyPopper,
  Search,
  Leaf,
} from "lucide-react";
import SearchModal from "./SearchModal";

const NAV_ITEMS = [
  {
    id: "inicio",
    label: "Inicio",
    path: "/",
    icon: Home,
    accent: "#1a5c45",
    accentRgb: "26,92,69",
  },
  {
    id: "mapa",
    label: "Mapa",
    path: "/mapa",
    icon: MapPinned,
    accent: "#0D9488",
    accentRgb: "13,148,136",
  },
  {
    id: "animales",
    label: "Fauna",
    path: "/animales",
    icon: PawPrint,
    accent: "#34D399",
    accentRgb: "52,211,153",
  },
  {
    id: "cultura",
    label: "Cultura",
    path: "/cultura",
    icon: Landmark,
    accent: "#F59E0B",
    accentRgb: "245,158,11",
  },
  {
    id: "historia",
    label: "Historia",
    path: "/historia",
    icon: BookOpen,
    accent: "#B45309",
    accentRgb: "180,83,9",
  },
  {
    id: "turismo",
    label: "Turismo",
    path: "/turismo",
    icon: MountainSnow,
    accent: "#0EA5E9",
    accentRgb: "14,165,233",
  },
  {
    id: "fiestas",
    label: "Fiestas",
    path: "/fiestas",
    icon: PartyPopper,
    accent: "#F59E0B",
    accentRgb: "245,158,11",
  },
] as const;

type NavId = typeof NAV_ITEMS[number]["id"];

export const MAIN_NAV_DESKTOP_PT_CLASS = "md:pt-20";
export const MAIN_NAV_MOBILE_TOP_CLASS = "pt-12";
export const MAIN_NAV_MOBILE_BOTTOM_CLASS = "pb-14";

export interface MainNavProps {
  active?: NavId | string;
  initialQuery?: string;
  onLogin?: () => void | Promise<void>;
}

export function MainNav(_props: MainNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const lastScrollY = useRef(0);
  const [bottomBarVisible, setBottomBarVisible] = useState(true);

  const activeItem = useMemo(() => {
    return NAV_ITEMS.find((item) =>
      item.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.path)
    ) ?? null;
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);

      if (y > lastScrollY.current + 8 && y > 120) {
        setBottomBarVisible(false);
      } else if (y < lastScrollY.current - 8) {
        setBottomBarVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const rgb = activeItem?.accentRgb ?? "26,92,69";
    const [r, g, b] = rgb.split(",");
    document.documentElement.style.setProperty("--nav-accent-r", r.trim());
    document.documentElement.style.setProperty("--nav-accent-g", g.trim());
    document.documentElement.style.setProperty("--nav-accent-b", b.trim());
    document.documentElement.style.setProperty(
      "--nav-accent",
      activeItem?.accent ?? "#1a5c45"
    );
  }, [activeItem]);

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
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-[2000] justify-center pt-3 px-4 pointer-events-none">
        <motion.nav
          className="pointer-events-auto flex items-center gap-1 px-2 py-1.5"
          animate={{
            borderRadius: scrolled ? 9999 : 16,
            height: scrolled ? 44 : 58,
            paddingTop: scrolled ? 4 : 8,
            paddingBottom: scrolled ? 4 : 8,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
          style={{
            background: `linear-gradient(135deg,
              rgba(var(--nav-accent-r), var(--nav-accent-g), var(--nav-accent-b), 0.07) 0%,
              rgba(10, 10, 10, 0.86) 100%)`,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "0.5px solid rgba(255,255,255,0.09)",
            boxShadow: `0 0 0 1px rgba(var(--nav-accent-r), var(--nav-accent-g), var(--nav-accent-b), 0.1),
                        0 8px 40px rgba(0,0,0,0.45)`,
          }}
        >
          <Link
            to="/"
            className="flex items-center gap-1.5 pl-2 pr-3 shrink-0 group"
          >
            <motion.div
              animate={{ color: activeItem?.accent ?? "#1a5c45" }}
              transition={{ duration: 0.4 }}
            >
              <Leaf size={13} />
            </motion.div>
            <motion.span
              className="font-serif text-white tracking-wide"
              animate={{ fontSize: scrolled ? 13 : 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              VisitChocó
            </motion.span>
          </Link>

          <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem?.id === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer border-none bg-transparent outline-none"
                animate={{
                  paddingLeft: scrolled ? 10 : 12,
                  paddingRight: scrolled ? 10 : 12,
                  paddingTop: scrolled ? 5 : 7,
                  paddingBottom: scrolled ? 5 : 7,
                  backgroundColor: isActive
                    ? `rgba(${item.accentRgb}, 0.14)`
                    : "transparent",
                }}
                whileHover={{
                  backgroundColor: isActive
                    ? `rgba(${item.accentRgb}, 0.18)`
                    : "rgba(255,255,255,0.06)",
                }}
                transition={{ duration: 0.15 }}
                title={item.label}
              >
                <motion.div
                  animate={{
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.68)",
                    scale: scrolled ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <Icon size={scrolled ? 17 : 15} />
                </motion.div>

                <AnimatePresence>
                  {!scrolled && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 2 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="text-[9px] font-medium tracking-widest uppercase overflow-hidden"
                      style={{
                        color: isActive ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.50)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}

          <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />

          <motion.button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center rounded-lg text-white/45 hover:text-white/80 transition-colors cursor-pointer border-none bg-transparent outline-none"
            animate={{
              padding: scrolled ? "5px 14px 5px 10px" : "7px 16px 7px 10px",
            }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            title="Buscar (⌘K)"
          >
            <Search size={14} />
            {!scrolled && (
              <span className="ml-1.5 text-[9px] tracking-widest uppercase font-medium text-white/35">
                ⌘K
              </span>
            )}
          </motion.button>
        </motion.nav>
      </div>

      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[2000] flex items-center justify-between px-4 h-12"
        style={{
          background: "rgba(10, 10, 10, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.08)",
        }}
      >
        <Link to="/" className="flex items-center gap-1.5">
          <Leaf size={11} style={{ color: activeItem?.accent ?? "#1a5c45" }} />
          <span
            className="text-white text-sm tracking-wide"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            VisitChocó
          </span>
        </Link>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/45 border-none bg-transparent cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "0.5px solid rgba(255,255,255,0.12)",
          }}
        >
          <Search size={13} />
          <span className="text-[12px] text-white/35">Buscar...</span>
        </button>
      </div>

      <motion.div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[2000] flex items-center"
        animate={{ y: bottomBarVisible ? 0 : 80 }}
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
        style={{
          height: 56,
          paddingBottom: "env(safe-area-inset-bottom)",
          background: "rgba(10, 10, 10, 0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "0.5px solid rgba(255,255,255,0.09)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem?.id === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full border-none bg-transparent cursor-pointer outline-none"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={21}
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.68)",
                    transition: "color 0.2s ease",
                  }}
                />
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="dot"
                      layoutId="bottomDot"
                      className="absolute -bottom-1.5 w-1 h-1 rounded-full"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      style={{ backgroundColor: item.accent }}
                    />
                  )}
                </AnimatePresence>
              </div>
              <span
                className="text-[9px] font-medium tracking-wider uppercase"
                style={{
                  color: isActive ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.50)",
                  transition: "color 0.2s ease",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </motion.div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
