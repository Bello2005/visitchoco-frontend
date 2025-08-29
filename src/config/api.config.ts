// URL base para el backend
export const API_BASE_URL = "http://localhost:8000/api";

// Rutas específicas
export const API_ROUTES = {
  municipalities: "/municipalities",
  municipalityBySlug: (slug: string) => `/municipalities/${slug}`,
};
