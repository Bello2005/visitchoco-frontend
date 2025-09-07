import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth.service";

const authService = new AuthService();

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = authService.getRole();
    if (!authService.isAuthenticated() || role !== "1") {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      const response = await authService.getDashboardData('admin');
      if (response.error) {
        setError(response.error);
        if (response.error === 'Error de autenticación') {
          navigate("/login");
        }
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-emerald-400">
          ¡Hola admin!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Aquí puedes agregar las tarjetas o secciones del dashboard */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Gestión de Usuarios</h2>
            <p className="text-gray-300">
              Administra los usuarios registrados en la plataforma.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Contenido</h2>
            <p className="text-gray-300">
              Gestiona el contenido de la plataforma.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Estadísticas</h2>
            <p className="text-gray-300">
              Revisa las estadísticas de la plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
