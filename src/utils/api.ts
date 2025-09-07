/**
 * Construye una URL de API asegurándose de que no haya barras duplicadas
 * @param path La ruta de la API (debe comenzar con /)
 * @returns La URL completa de la API
 */
export const buildApiUrl = (path: string): string => {
  const baseUrl = import.meta.env.VITE_API_URL.endsWith('/')
    ? import.meta.env.VITE_API_URL.slice(0, -1)
    : import.meta.env.VITE_API_URL;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
