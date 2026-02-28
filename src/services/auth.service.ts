import { api } from "./api.service";

interface AuthResponse {
  message: string;
  error?: string;
  role?: string;
  isAuthenticated?: boolean;
}

export class AuthService {
  async getDashboardData(role: "admin" | "user"): Promise<AuthResponse> {
    const { data } = await api.get<AuthResponse>(`/api/${role}/dashboard`);
    return data;
  }

  isAuthenticated(): boolean {
    return localStorage.getItem("authToken") !== null;
  }

  getRole(): string | null {
    return localStorage.getItem("userRole");
  }
}
