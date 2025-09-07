import React from "react";
import { MainNav } from "../../components/landing/MainNav";
import { useNavigate } from "react-router-dom";

const Festival: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <MainNav active="fiesta" onLogin={() => navigate("/login")} />
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Fiestas y Festivales
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Aquí puedes agregar tarjetas para diferentes festivales y celebraciones */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Eventos Culturales
              </h2>
              <p className="text-gray-600">
                Descubre las celebraciones y tradiciones del Chocó
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Festival;
