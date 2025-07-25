// src/pages/Register.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Register/Register.css"; // We'll create this CSS file next

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Background animation effect (same as login)
  useEffect(() => {
    const canvas = document.getElementById("register-bg") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Colors inspired by Chocó: greens, blues, golds
    const colors = [
      { r: 0, g: 82, b: 77 }, // Dark green (jungle)
      { r: 0, g: 128, b: 128 }, // Teal (rivers)
      { r: 210, g: 180, b: 140 }, // Tan (beaches)
      { r: 255, g: 215, b: 0 }, // Gold (mineral wealth)
      { r: 0, g: 104, b: 139 }, // Deep blue (Pacific Ocean)
    ];

    // Particle system
    const particles: Particle[] = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 10000);

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
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connect particles that are close
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${particles[i].color.r}, ${particles[i].color.g}, ${particles[i].color.b}, ${1 - distance / 100})`;
            ctx.lineWidth = 0.5;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );
      const body = await res.text();
      
      if (!res.ok) {
        let message = "Registro fallido";
        try {
          const json = JSON.parse(body);
          message = json.message || message;
        } catch {}
        throw new Error(message);
      }
      
      setSuccess("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
      setLoading(false);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registro fallido");
      }
    }
  };

  return (
    <div className="register-container">
      <canvas id="register-bg" className="register-bg"></canvas>
      
      <div className="register-card">
        <div className="register-header">
          <h1>Únete a Chocó</h1>
          <p>Descubre la magia de nuestro paraíso</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="register-error">{error}</div>}
          {success && <div className="register-success">{success}</div>}
          
          <div className={`form-group ${activeInput === "name" ? "active" : ""}`}>
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setActiveInput("name")}
              onBlur={() => setActiveInput(null)}
              required
              disabled={loading}
            />
            <div className="form-underline"></div>
          </div>
          
          <div className={`form-group ${activeInput === "email" ? "active" : ""}`}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setActiveInput("email")}
              onBlur={() => setActiveInput(null)}
              required
              disabled={loading}
            />
            <div className="form-underline"></div>
          </div>
          
          <div className={`form-group ${activeInput === "password" ? "active" : ""}`}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setActiveInput("password")}
              onBlur={() => setActiveInput(null)}
              required
              disabled={loading}
            />
            <div className="form-underline"></div>
          </div>
          
          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner">
                <div className="double-bounce1"></div>
                <div className="double-bounce2"></div>
              </span>
            ) : (
              "Registrarse"
            )}
          </button>
          
          <div className="register-footer">
            <button 
              type="button" 
              className="login-button"
              onClick={() => navigate("/login")}
              disabled={loading}
            >
              ¿Ya tienes cuenta? <span>Inicia sesión</span>
            </button>
          </div>
        </form>
        
        <div className="register-decoration">
          <div className="decoration-bird decoration-bird-1"></div>
          <div className="decoration-bird decoration-bird-2"></div>
          <div className="decoration-wave"></div>
        </div>
      </div>
    </div>
  );
}