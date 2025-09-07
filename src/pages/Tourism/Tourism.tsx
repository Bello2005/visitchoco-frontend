import React from "react";
import { MainNav } from "../../components/landing/MainNav";
import { useNavigate } from "react-router-dom";

const Tourism: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <MainNav active="turismo" onLogin={() => navigate("/login")} />
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Turismo en el Chocó
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Aquí puedes agregar tarjetas para diferentes destinos turísticos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Destinos Populares
              </h2>
              <p className="text-gray-600">
                Explora los mejores lugares turísticos del Chocó
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tourism;
