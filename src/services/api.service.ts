import axios from "axios";
import { API_BASE_URL } from "../config/api.config";

const isDev = import.meta.env.DEV;

// Instancia central de axios para toda la aplicación
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inyectar token de autenticación y logging en desarrollo
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (isDev) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo global de errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[API] Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error("[API] Sin respuesta del servidor");
    } else {
      console.error("[API] Error de configuración:", error.message);
    }
    return Promise.reject(error);
  }
);
