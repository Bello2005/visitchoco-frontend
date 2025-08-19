import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const UserDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    if (!token || Number(role) === 1) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-emerald-400">
          ¡Bienvenido, usuario!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Secciones del dashboard de usuario */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Mi Perfil</h2>
            <p className="text-gray-300">Actualiza tu información personal.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Mis Lugares Favoritos
            </h2>
            <p className="text-gray-300">
              Explora los lugares que has guardado.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Explorar</h2>
            <p className="text-gray-300">
              Descubre nuevos destinos en el Chocó.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
