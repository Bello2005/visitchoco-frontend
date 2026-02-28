import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface AuthState {
  token: string | null;
  role: "admin" | "user" | null;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "LOGIN"; payload: { token: string; role: string } }
  | { type: "LOGOUT" };

interface AuthContextValue extends AuthState {
  login: (payload: { token: string; role: string }) => void;
  logout: () => void;
}

// ── Reducer ─────────────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        token: action.payload.token,
        role: (action.payload.role as "admin" | "user") ?? null,
        isAuthenticated: true,
      };
    case "LOGOUT":
      return { token: null, role: null, isAuthenticated: false };
    default:
      return state;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitialState(): AuthState {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole") as "admin" | "user" | null;
  return {
    token,
    role,
    isAuthenticated: token !== null,
  };
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialState);

  const login = useCallback(({ token, role }: { token: string; role: string }) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", role);
    dispatch({ type: "LOGIN", payload: { token, role } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
