// URL base para el backend
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Rutas específicas
export const API_ROUTES = {
  municipalities: "/api/municipalities",
  municipalityBySlug: (slug: string) => `/api/municipalities/${slug}`,
};
