import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MapPinned, PawPrint, Landmark, BookOpen, MountainSnow, PartyPopper,
  type LucideIcon,
} from "lucide-react";

const SECTIONS: { id: string; label: string; Icon: LucideIcon; path: string }[] = [
  { id: "mapa",     label: "Mapa",     Icon: MapPinned,    path: "/mapa"     },
  { id: "fauna",    label: "Fauna",    Icon: PawPrint,     path: "/animales" },
  { id: "cultura",  label: "Cultura",  Icon: Landmark,     path: "/cultura"  },
  { id: "historia", label: "Historia", Icon: BookOpen,     path: "/historia" },
  { id: "turismo",  label: "Turismo",  Icon: MountainSnow, path: "/turismo"  },
  { id: "fiestas",  label: "Fiestas",  Icon: PartyPopper,  path: "/fiesta"   },
];

/** Coincide con el panel (UnifiedPanel) para que el fade no destaque */
const FADE_PANEL =
  "linear-gradient(to left, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.55) 45%, transparent 100%)";
const FADE_PANEL_LEFT =
  "linear-gradient(to right, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.55) 45%, transparent 100%)";

const SCROLL_EPS = 3;

export const SectionNav: React.FC = () => {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);

  const updateFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    setFadeLeft(scrollLeft > SCROLL_EPS);
    setFadeRight(maxScroll > SCROLL_EPS && scrollLeft < maxScroll - SCROLL_EPS);
  }, []);

  useLayoutEffect(() => {
    updateFade();
  }, [updateFade, location.pathname]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateFade());
    ro.observe(el);
    window.addEventListener("resize", updateFade);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateFade);
    };
  }, [updateFade]);

  return (
    <div className="flex-none min-w-0 px-4 pb-2">
      <div className="relative -mx-4 min-w-0 px-4">
        {fadeLeft && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 sm:w-12"
            style={{ background: FADE_PANEL_LEFT }}
            aria-hidden
          />
        )}
        {fadeRight && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 sm:w-12"
            style={{ background: FADE_PANEL }}
            aria-hidden
          />
        )}
        <div
          ref={scrollRef}
          onScroll={updateFade}
          className="section-nav-scroll flex flex-nowrap items-center gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {SECTIONS.map((section) => {
            const isActive = location.pathname === section.path;
            return (
              <Link
                key={section.id}
                to={section.path}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/80"
                }`}
              >
                <section.Icon size={13} />
                <span>{section.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
