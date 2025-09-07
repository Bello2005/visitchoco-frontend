// URL base para el backend
export const API_BASE_URL = "https://visitchoco-backend.vercel.app/api";

// Rutas específicas
export const API_ROUTES = {
  municipalities: "/municipalities",
  municipalityBySlug: (slug: string) => `/municipalities/${slug}`,
};
