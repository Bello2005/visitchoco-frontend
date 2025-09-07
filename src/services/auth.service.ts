interface AuthResponse {
  message: string;
  error?: string;
  role?: string;
  isAuthenticated?: boolean;
}

export class AuthService {
  async getDashboardData(role: "admin" | "user"): Promise<AuthResponse> {
    try {
      console.log("[AUTH] Obteniendo datos del dashboard para rol:", role);
      const baseUrl = "https://visitchoco-backend.vercel.app";
      const url = `${baseUrl}/api/auth/${role}/dashboard`;
      console.log("[AUTH] URL del dashboard:", url);

      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("[AUTH] No se encontró token en localStorage");
        throw new Error("No se encontró token de autenticación");
      }

      console.log("[AUTH] Iniciando petición al dashboard...");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("[AUTH] Estado de la respuesta:", response.status, response.statusText);
      console.log("[AUTH] Headers de la respuesta:", Object.fromEntries(response.headers.entries()));

      const textResponse = await response.text();
      console.log("[AUTH] Respuesta como texto:", textResponse);

      try {
        const jsonResponse = JSON.parse(textResponse);
        console.log("[AUTH] Respuesta parseada como JSON:", jsonResponse);
        
        if (!response.ok) {
          throw new Error(jsonResponse.message || "Error al obtener datos del dashboard");
        }
        
        return jsonResponse;
      } catch (parseError) {
        console.error("[AUTH] Error al parsear respuesta JSON:", parseError);
        throw new Error("Error al procesar la respuesta del servidor");
      }
    } catch (error) {
      return {
        message: "",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  isAuthenticated(): boolean {
    return localStorage.getItem("authToken") !== null;
  }

  getRole(): string | null {
    return localStorage.getItem("userRole");
  }
}
