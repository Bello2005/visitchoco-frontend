import React from "react";
import { useNavigate } from "react-router-dom";

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="title-line text-gray-900">Descubre el</span>
          <span className="title-line text-emerald-600">Paraíso Escondido</span>
          <span className="title-line text-gray-900">de Colombia</span>
        </h1>
        <p className="hero-subtitle">
          Donde la selva, el mar y la cultura se unen en una experiencia
          inolvidable
        </p>
        <div className="hero-cta">
          <button
            className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-300"
            onClick={() => navigate("/login")}
          >
            Comienza tu aventura
          </button>
          <button className="px-8 py-4 text-emerald-600 font-semibold rounded-full border-2 border-emerald-600 hover:bg-emerald-50 transition-all duration-300">
            Explora los destinos
          </button>
        </div>
      </div>

      <div className="hero-decoration">
        <div className="floating-bird"></div>
        <div className="floating-leaf"></div>
      </div>
    </section>
  );
};
