import React from "react";
import "../../styles/components/gallery.css";

export const GallerySection: React.FC = () => (
  <section className="gallery-section bg-gradient-to-b from-white to-emerald-50/30">
    <div className="gallery-container">
      {/* Bahía Solano - Imagen Principal */}
      <div className="gallery-item main">
        <img
          src="https://i.ytimg.com/vi/QwDCiR-BeeQ/maxresdefault.jpg"
          alt="Bahía Solano"
        />
        <div className="image-overlay">
          <h3>Bahía Solano</h3>
          <p>Donde las ballenas cantan</p>
        </div>
      </div>

      {/* Nuquí */}
      <div className="gallery-item">
        <img
          src="https://aventurecolombia.com/wp-content/uploads/2021/04/Nuqui-Choco-Pacifique-%C2%A9anonimo.jpg"
          alt="Nuquí"
        />
        <div className="image-overlay">
          <h3>Nuquí</h3>
          <p>Selva y mar en armonía</p>
        </div>
      </div>

      {/* Capurganá */}
      <div className="gallery-item">
        <img
          src="https://raw.githubusercontent.com/JhamG9/api-viaja/main/uploads/capurgana/capurgana-playa.webp"
          alt="Capurganá"
        />
        <div className="image-overlay">
          <h3>Capurganá</h3>
          <p>Paraíso sin carros</p>
        </div>
      </div>
    </div>
  </section>
);
