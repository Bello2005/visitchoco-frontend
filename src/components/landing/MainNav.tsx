import { Fragment, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPinned,
  PawPrint,
  PartyPopper,
  MountainSnow,
  Search,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

export interface MainNavProps {
  active?: "mapa" | "animales" | "turismo" | "fiesta" | string;
  initialQuery?: string;
}

const NAV_LINKS = [
  { id: "mapa", label: "Mapa", href: "/mapa", icon: MapPinned },
  { id: "animales", label: "Animales", href: "/animales", icon: PawPrint },
  { id: "turismo", label: "Turismo", href: "/turismo", icon: MountainSnow },
  { id: "fiesta", label: "Fiesta", href: "/fiesta", icon: PartyPopper },
] as const;

export function MainNav({
  active = "",
  initialQuery = "",
}: MainNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState(initialQuery);
  const [focusSearch, setFocusSearch] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!q || q.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const pool = [
          "Bahía Solano",
          "Nuquí",
          "Capurganá",
          "Avistamiento de ballenas",
          "Parque Nacional Utría",
          "Catedral de Istmina",
          "Río Atrato",
        ];
        const filtered = pool
          .filter((s) => s.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 6);
        if (!ignore) setSuggestions(filtered);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [q]);

  const activeId = useMemo(() => (active ?? "").toLowerCase(), [active]);

  return (
    <header className="sticky top-0 z-50">
      <div
        aria-hidden
        className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
      />

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        Saltar al contenido
      </a>

      <nav
        role="navigation"
        aria-label="Navegación principal"
        className="bg-[#FFFFFF] border-b border-gray-200 shadow-sm"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-1 md:gap-2">
            <a href="/" className="group inline-flex items-center gap-2">
              <div className="relative">
                <span className="absolute -inset-1 rounded-2xl bg-emerald-400/30 blur-md opacity-0 group-hover:opacity-100 transition" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <span className="font-black">VC</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-gray-900">
                  Visit
                  <span className="text-emerald-600">Chocó</span>
                </span>
                <span className="text-[11px] uppercase tracking-wider text-emerald-600 font-medium">
                  Naturaleza · Cultura · Mar
                </span>
              </div>
            </a>

            <ul className="hidden xl:flex items-center gap-1">
              {NAV_LINKS.map(({ id, label, href, icon: Icon }) => {
                const isActive = activeId === id;
                return (
                  <li key={id}>
                    <a
                      href={href}
                      className="relative group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
                    >
                      <Icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                      <span>{label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="active-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-emerald-50"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 40,
                          }}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <div className="relative hidden xl:block">
                <div
                  className={`flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-emerald-500/60 hover:bg-gray-100 ${
                    focusSearch ? "ring-2 ring-emerald-500/60" : ""
                  }`}
                >
                  <Search className="h-4 w-4 opacity-60" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onFocus={() => setFocusSearch(true)}
                    onBlur={() => setFocusSearch(false)}
                    placeholder="Buscar lugares, fauna, eventos…"
                    className="w-64 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                    aria-label="Buscar en VisitChocó"
                  />
                  {q && (
                    <button
                      onClick={() => setQ("")}
                      className="rounded-full px-2 text-xs text-emerald-700/70 hover:bg-emerald-100"
                      aria-label="Limpiar búsqueda"
                    >
                      Esc
                    </button>
                  )}
                </div>

                {suggestions.length > 0 && (
                  <div className="absolute right-0 mt-2 w-[28rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <ul>
                      {suggestions.map((s) => (
                        <li key={s}>
                          <a
                            href={`/buscar?q=${encodeURIComponent(s)}`}
                            className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                          >
                            {s}
                          </a>
                        </li>
                      ))}
                      {loading && (
                        <li className="px-4 py-2 text-xs text-gray-500">
                          Buscando…
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <a
                href="/login"
                className="hidden xl:inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <LogIn className="h-4 w-4" />
                <span className="whitespace-nowrap">Iniciar sesión</span>
              </a>

              <button
                className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 xl:hidden"
                aria-label="Abrir menú"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Transition.Root show={mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={setMobileOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                    <div className="flex h-full flex-col bg-white shadow-xl">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow">
                              <span className="font-black">VC</span>
                            </div>
                            <span className="text-base font-extrabold text-gray-900">
                              VisitChocó
                            </span>
                          </div>
                          <button
                            onClick={() => setMobileOpen(false)}
                            className="rounded-full p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            aria-label="Cerrar menú"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                              value={q}
                              onChange={(e) => setQ(e.target.value)}
                              placeholder="Buscar lugares, fauna, eventos…"
                              className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
                            />
                          </div>
                          {suggestions.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {suggestions.map((s) => (
                                <li key={s}>
                                  <a
                                    href={`/buscar?q=${encodeURIComponent(s)}`}
                                    className="block rounded-lg px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    {s}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <ul className="mt-6 space-y-1">
                          {NAV_LINKS.map(({ id, label, href, icon: Icon }) => {
                            const isActive = activeId === id;
                            return (
                              <li key={id}>
                                <a
                                  href={href}
                                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition hover:bg-gray-50 ${
                                    isActive
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "text-gray-900"
                                  }`}
                                  onClick={() => setMobileOpen(false)}
                                >
                                  <Icon className="h-5 w-5" />
                                  <span>{label}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>

                        <div className="mt-6">
                          <a
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
                          >
                            <LogIn className="h-5 w-5" />
                            Iniciar sesión
                          </a>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </header>
  );
}
