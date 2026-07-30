// URL base para el backend
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://visitchoco-backend.vercel.app";

// Environment
export const IS_DEVELOPMENT = import.meta.env.VITE_APP_ENV === 'development';

// Rutas específicas
export const API_ROUTES = {
  municipalities: "/api/municipalities",
  municipalityBySlug: (slug: string) => `/api/municipalities/${slug}`,
};
