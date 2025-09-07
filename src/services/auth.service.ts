import { buildApiUrl } from "../utils/api";

interface AuthResponse {
  message: string;
  error?: string;
}

export class AuthService {
  private getHeaders() {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getDashboardData(role: "admin" | "user"): Promise<AuthResponse> {
    try {
      const response = await fetch(buildApiUrl(`/auth/${role}/dashboard`), {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
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
