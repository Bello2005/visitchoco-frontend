import { buildApiUrl } from "../utils/api";

interface AuthResponse {
  message: string;
  error?: string;
}

export class AuthService {
  private getHeaders() {
    const token = localStorage.getItem("authToken");
    console.log("[AUTH] Token para headers:", token);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("[AUTH] Headers construidos:", headers);
    return headers;
  }

  async getDashboardData(role: "admin" | "user"): Promise<AuthResponse> {
    try {
      console.log("[AUTH] Obteniendo datos del dashboard para rol:", role);
      const url = buildApiUrl(`/auth/${role}/dashboard`);
      console.log("[AUTH] URL del dashboard:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
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
