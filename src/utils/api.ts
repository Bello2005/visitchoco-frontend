/**
 * Construye una URL de API asegurándose de que no haya barras duplicadas y que tenga el prefijo /api
 * @param path La ruta de la API (debe comenzar con /)
 * @returns La URL completa de la API
 */
export const buildApiUrl = (path: string): string => {
  const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"; // fallback
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const apiPath = cleanPath.startsWith("/api/") ? cleanPath : `/api${cleanPath}`;
  
  return `${baseUrl}${apiPath}`;
};
