import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";

function renderWithRouter(token: string | null, role: string | null, requiredRole?: "admin" | "user") {
  if (token) localStorage.setItem("authToken", token);
  if (role) localStorage.setItem("userRole", role);

  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/protected"
          element={
            <PrivateRoute requiredRole={requiredRole}>
              <div>Protected content</div>
            </PrivateRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("PrivateRoute", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("redirige a /login si no hay token", () => {
    renderWithRouter(null, null);
    expect(screen.getByText("Login page")).toBeTruthy();
    expect(screen.queryByText("Protected content")).toBeNull();
  });

  it("muestra el contenido si hay token sin requerir rol", () => {
    renderWithRouter("some-token", "user");
    expect(screen.getByText("Protected content")).toBeTruthy();
  });

  it("redirige a /login si el rol no coincide", () => {
    renderWithRouter("some-token", "user", "admin");
    expect(screen.getByText("Login page")).toBeTruthy();
    expect(screen.queryByText("Protected content")).toBeNull();
  });

  it("muestra el contenido si el rol coincide", () => {
    renderWithRouter("some-token", "admin", "admin");
    expect(screen.getByText("Protected content")).toBeTruthy();
  });
});
