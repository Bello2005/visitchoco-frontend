// URL base para el backend
export const API_BASE_URL = "https://visitchoco-backend.vercel.app";

// Rutas específicas
export const API_ROUTES = {
  municipalities: "/api/municipalities",
  municipalityBySlug: (slug: string) => `/api/municipalities/${slug}`,
};
