import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_ACCENT: Record<string, string> = {
  "/":          "atrato",
  "/mapa":      "mapa",
  "/cultura":   "cultura",
  "/historia":  "historia",
  "/turismo":   "turismo",
  "/fiesta":    "fiestas",
  "/fiestas":   "fiestas",
  "/animales":  "fauna",
};

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const accent = ROUTE_ACCENT[pathname] ?? "atrato";
    document.documentElement.setAttribute("data-accent", accent);
  }, [pathname]);

  return <>{children}</>;
}
