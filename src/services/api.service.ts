import axios from "axios";
import { API_BASE_URL } from "../config/api.config";

// Crear una instancia de axios con la configuración base
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptores para logging y manejo de errores
api.interceptors.request.use(
  (config) => {
    console.log("=== REQUEST ===");
    console.log("URL:", config.url);
    console.log("Method:", config.method);
    return config;
  },
  (error) => {
    console.error("Error en la petición:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    console.log("=== RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    return response;
  },
  (error) => {
    // Aquí puedes manejar errores globalmente
    if (error.response) {
      // El servidor respondió con un código de error
      console.error("Error de API:", error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error("No se recibió respuesta del servidor");
    } else {
      // Algo sucedió al configurar la petición
      console.error("Error al configurar la petición:", error.message);
    }
    return Promise.reject(error);
  }
);
