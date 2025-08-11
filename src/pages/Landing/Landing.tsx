// src/pages/Landing.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Landing/Landing.css"; // Import the CSS for the landing page

export function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Efecto de partículas para el fondo
    const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Colores inspirados en Chocó
    const colors = [
      { r: 0, g: 82, b: 77 }, // Verde jungla
      { r: 0, g: 128, b: 128 }, // Verde agua
      { r: 210, g: 180, b: 140 }, // Arena
      { r: 255, g: 215, b: 0 }, // Oro
      { r: 0, g: 104, b: 139 }, // Azul océano
    ];

    // Sistema de partículas
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: { r: number; g: number; b: number };

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.6)`;
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 10000);

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Conectar partículas cercanas
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${particles[i].color.r}, ${
              particles[i].color.g
            }, ${particles[i].color.b}, ${0.7 - distance / 120})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Fondo animado */}
      <canvas id="hero-canvas" className="hero-canvas"></canvas>

      {/* Capa de overlay para contraste */}
      <div className="hero-overlay"></div>

      {/* Navegación */}
      <nav className="main-nav">
        <div className="nav-logo">
          <span className="logo-icon">🌴</span>
          <span className="logo-text">VisitChocó</span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/login")}>
            Ingresar
          </button>
          <button
            className="nav-link primary"
            onClick={() => navigate("/login")}
          >
            Registrarse
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-line">Descubre el</span>
            <span className="title-line highlight">Paraíso Escondido</span>
            <span className="title-line">de Colombia</span>
          </h1>
          <p className="hero-subtitle">
            Donde la selva, el mar y la cultura se unen en una experiencia
            inolvidable
          </p>
          <div className="hero-cta">
            <button
              className="cta-button primary"
              onClick={() => navigate("/login")}
            >
              Comienza tu aventura
            </button>
            <button className="cta-button secondary">
              Explora los destinos
            </button>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="floating-bird"></div>
          <div className="floating-leaf"></div>
        </div>
      </section>

      {/* Sección de características */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Por qué visitar Chocó</h2>
          <div className="section-divider"></div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌿</div>
            <h3 className="feature-title">Biodiversidad Única</h3>
            <p className="feature-text">
              Hogar del 10% de las especies del planeta en solo el 0.1% de su
              superficie
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏝️</div>
            <h3 className="feature-title">Playas Paradisíacas</h3>
            <p className="feature-text">
              Arenas doradas y aguas cristalinas en el Pacífico colombiano
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎶</div>
            <h3 className="feature-title">Cultura Vibrante</h3>
            <p className="feature-text">
              Tradiciones afrocolombianas que vibran en cada rincón
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🍫</div>
            <h3 className="feature-title">Sabores Auténticos</h3>
            <p className="feature-text">
              Gastronomía que cuenta historias con cada bocado
            </p>
          </div>
        </div>
      </section>

      {/* Sección de galería */}
      <section className="gallery-section">
        <div className="gallery-container">
          <div className="gallery-item main">
            <div className="image-overlay">
              <h3>Bahía Solano</h3>
              <p>Donde las ballenas cantan</p>
            </div>
          </div>
          <div className="gallery-item secondary">
            <div className="image-overlay">
              <h3>Nuquí</h3>
              <p>Selva y mar en armonía</p>
            </div>
          </div>
          <div className="gallery-item secondary">
            <div className="image-overlay">
              <h3>Capurganá</h3>
              <p>Paraíso sin carros</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de testimonios */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">Historias que inspiran</h2>
          <div className="section-divider"></div>
        </div>

        <div className="testimonials-slider">
          <div className="testimonial-card">
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">
              Chocó me robó el corazón. Sus paisajes, su gente y su energía son
              simplemente mágicos.
            </p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>María Fernández</h4>
                <p>Viajera de Argentina</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="final-cta">
        <h2 className="cta-title">¿Listo para tu aventura en Chocó?</h2>
        <p className="cta-subtitle">
          Regístrate ahora y recibe nuestro itinerario exclusivo con los mejores
          lugares
        </p>
        <button
          className="cta-button primary large"
          onClick={() => navigate("/login")}
        >
          Empieza ahora
        </button>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🌴</span>
            <span className="logo-text">VisitChocó</span>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Explorar</h4>
              <a href="#">Destinos</a>
              <a href="#">Experiencias</a>
              <a href="#">Gastronomía</a>
            </div>
            <div className="link-group">
              <h4>Recursos</h4>
              <a href="#">Guías de viaje</a>
              <a href="#">Blog</a>
              <a href="#">FAQs</a>
            </div>
            <div className="link-group">
              <h4>Compañía</h4>
              <a href="#">Nosotros</a>
              <a href="#">Contacto</a>
              <a href="#">Trabaja con nosotros</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} VisitChocó. Todos los derechos
            reservados.
          </p>
          <div className="social-icons">
            <a href="#" className="social-icon">
              📱
            </a>
            <a href="#" className="social-icon">
              📸
            </a>
            <a href="#" className="social-icon">
              📘
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
