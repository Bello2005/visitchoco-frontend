import { useMemo } from "react";
import {
  MapPinned,
  PawPrint,
  PartyPopper,
  MountainSnow,
  Landmark,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export interface MainNavProps {
  active?: "mapa" | "fauna" | "cultura" | "historia" | "turismo" | "fiestas" | string;
  initialQuery?: string;
  onLogin?: () => void | Promise<void>;
}

const NAV_LINKS: { id: string; label: string; href: string; Icon: LucideIcon }[] = [
  { id: "mapa",     label: "Mapa",     href: "/mapa",     Icon: MapPinned    },
  { id: "fauna",    label: "Fauna",    href: "/animales", Icon: PawPrint     },
  { id: "cultura",  label: "Cultura",  href: "/cultura",  Icon: Landmark     },
  { id: "historia", label: "Historia", href: "/historia", Icon: BookOpen     },
  { id: "turismo",  label: "Turismo",  href: "/turismo",  Icon: MountainSnow },
  { id: "fiestas",  label: "Fiestas",  href: "/fiesta",   Icon: PartyPopper  },
];

export function MainNav({ active = "" }: MainNavProps) {
  const activeId = useMemo(() => (active ?? "").toLowerCase(), [active]);
  const resolvedActive = activeId === "animales" ? "fauna" : activeId;

  return (
    <>
      {/* ── DESKTOP HEADER (md+) ───────────────────────── */}
      <header className="hidden md:block sticky top-0 z-50">
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

        <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between gap-4">

              {/* Logo */}
              <a href="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                  <span className="font-black text-sm">VC</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold tracking-tight text-gray-900 leading-none">
                    Visit<span className="text-emerald-600">Chocó</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-medium leading-none mt-0.5">
                    Naturaleza · Cultura · Mar
                  </span>
                </div>
              </a>

              {/* Nav links */}
              <ul className="flex items-center gap-0.5">
                {NAV_LINKS.map(({ id, label, href, Icon }) => {
                  const isActive = resolvedActive === id;
                  return (
                    <li key={id}>
                      <a
                        href={href}
                        className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                          isActive
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          size={15}
                          strokeWidth={isActive ? 2.5 : 1.75}
                          className={isActive ? "text-emerald-600" : "text-gray-400"}
                        />
                        <span className="hidden lg:inline">{label}</span>
                        {isActive && (
                          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-500" />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>

              {/* Login (oculto hasta activar auth)
              <a
                href="/login"
                className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <LogIn size={14} />
                <span>Entrar</span>
              </a>
              */}

            </div>
          </div>
        </nav>
      </header>

      {/* ── MOBILE BOTTOM TAB BAR (< md) ──────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-[2000] bg-white/95 backdrop-blur-md border-t border-gray-100"
        style={{
          boxShadow: "0 -1px 0 rgba(0,0,0,0.06), 0 -4px 16px rgba(0,0,0,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-stretch justify-around h-14">
          {NAV_LINKS.map(({ id, label, href, Icon }) => {
            const isActive = resolvedActive === id;
            return (
              <a
                key={id}
                href={href}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 transition-colors duration-150 ${
                  isActive ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 h-0.5 bg-emerald-500 rounded-full"
                    style={{ width: "40%", left: "30%" }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className={`text-[10px] font-medium truncate leading-none ${
                  isActive ? "text-emerald-600" : "text-gray-400"
                }`}>
                  {label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
