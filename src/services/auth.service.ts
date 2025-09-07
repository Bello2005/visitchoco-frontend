interface AuthResponse {
  message: string;
  error?: string;
}

export class AuthService {
  private getHeaders() {
    const token = localStorage.getItem("authToken");
    console.log("[AUTH] Token en localStorage:", token);
    
    if (!token) {
      console.error("[AUTH] No se encontró token en localStorage");
      return {
        "Content-Type": "application/json"
      };
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    console.log("[AUTH] Headers construidos:", headers);
    return headers;
  }

  async getDashboardData(role: "admin" | "user"): Promise<AuthResponse> {
    try {
      console.log("[AUTH] Obteniendo datos del dashboard para rol:", role);
      // Construir la URL manualmente para asegurarnos de que sea correcta
      const baseUrl = "https://visitchoco-backend.vercel.app";
      const url = `${baseUrl}/api/auth/${role}/dashboard`;
      console.log("[AUTH] URL del dashboard:", url);

      const headers = this.getHeaders();
      console.log("[AUTH] Headers de la petición:", headers);

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
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
