import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
};

export function PrivateRoute({ children, requiredRole }: Props) {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
