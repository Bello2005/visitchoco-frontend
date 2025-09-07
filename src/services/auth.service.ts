interface AuthResponse {
  message: string;
  error?: string;
}

export class AuthService {
  async getDashboardData(role: "admin" | "user"): Promise<AuthResponse> {
    try {
      console.log("[AUTH] Obteniendo datos del dashboard para rol:", role);
      // Construir la URL manualmente para asegurarnos de que sea correcta
      const baseUrl = "https://visitchoco-backend.vercel.app";
      const url = `${baseUrl}/api/auth/${role}/dashboard`;
      console.log("[AUTH] URL del dashboard:", url);

      const token = localStorage.getItem("authToken");
      console.log("[AUTH] Token almacenado:", token ? "Presente" : "No encontrado");

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      console.log("[AUTH] Headers de la petición:", {
        ...headers,
        Authorization: "Bearer [FILTERED]"
      });

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
        credentials: "include"
      });

      console.log("[AUTH] Respuesta del dashboard:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[AUTH] Error del dashboard:", errorText);
        throw new Error("Error de autenticación");
      }

      return await response.json();
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
