import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";

// Componente de prueba que expone el contexto
function TestConsumer() {
  const { isAuthenticated, role, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="role">{role ?? "none"}</span>
      <button onClick={() => login({ token: "test-token", role: "user" })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("inicia sin autenticación cuando no hay token en localStorage", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(screen.getByTestId("role").textContent).toBe("none");
  });

  it("inicia autenticado cuando hay token en localStorage", () => {
    localStorage.setItem("authToken", "existing-token");
    localStorage.setItem("userRole", "admin");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("role").textContent).toBe("admin");
  });

  it("login guarda token en localStorage y actualiza el estado", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText("Login"));

    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("role").textContent).toBe("user");
    expect(localStorage.getItem("authToken")).toBe("test-token");
    expect(localStorage.getItem("userRole")).toBe("user");
  });

  it("logout limpia localStorage y desautentica", async () => {
    localStorage.setItem("authToken", "existing-token");
    localStorage.setItem("userRole", "user");
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText("Logout"));

    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(screen.getByTestId("role").textContent).toBe("none");
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("userRole")).toBeNull();
  });
});
