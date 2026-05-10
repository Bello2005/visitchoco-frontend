import { useState, useEffect } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../../components/brand/Logo";
import { AuthTabs } from "../../components/auth/AuthTabs";
import { LoginForm } from "../../components/auth/LoginForm";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { cn } from "../../lib/cn";
import { buildApiUrl } from "../../utils/api";

const STATS = ["46 530 km²", "31 municipios", "577 aves"];

const ChocoLuxuryLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => setLoading(false);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "register" && activeTab !== "register") setActiveTab("register");
    else if (tabParam !== "register" && activeTab !== "login") setActiveTab("login");
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setSearchParams(tab === "register" ? { tab: "register" } : {});
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    const isMobile = window.innerWidth < 640;
    try {
      const res = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.text();
      if (!res.ok) {
        let message = "Login fallido";
        try { message = JSON.parse(body).message || message; } catch {}
        if (isMobile) { alert(message); } else {
          toast.error(message, { position: "top-right", autoClose: 3500, theme: "colored", icon: () => <span style={{ fontSize: 24 }}>🌧️</span> });
        }
        throw new Error(message);
      }
      const { token, role } = JSON.parse(body);
      login({ token, role });
      setLoading(false);
      const welcomeMessage = role === "admin" ? "¡Bienvenido, administrador!" : "¡Bienvenido, usuario!";
      if (isMobile) {
        alert(welcomeMessage);
        window.location.href = role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      } else {
        toast.success(welcomeMessage, { position: "top-right", autoClose: 3000, theme: "colored", icon: () => <span style={{ fontSize: 24 }}>🐋</span> });
        setTimeout(() => { navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard"); setLoading(false); }, 1200);
      }
    } catch { setLoading(false); }
  };

  const handleRegister = async (values: { firstName: string; lastName: string; email: string; password: string; confirmPassword: string }) => {
    setLoading(true);
    const isMobile = window.innerWidth < 640;
    try {
      const res = await fetch(buildApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${values.firstName} ${values.lastName}`, email: values.email, password: values.password }),
      });
      const body = await res.text();
      if (!res.ok) {
        let message = "Registro fallido";
        try { message = JSON.parse(body).message || message; } catch {}
        if (isMobile) { alert(message); } else {
          toast.error(message, { position: "top-right", autoClose: 3500, theme: "colored", icon: () => <span style={{ fontSize: 24 }}>🦀</span> });
        }
        throw new Error(message);
      }
      setLoading(false);
      if (isMobile) {
        alert("¡Registro exitoso! Ahora puedes iniciar sesión");
        setActiveTab("login"); setSearchParams({});
      } else {
        toast.success("¡Registro exitoso! Ahora puedes iniciar sesión", { position: "top-right", autoClose: 3000, theme: "colored", icon: () => <span style={{ fontSize: 24 }}>🌴</span> });
        setTimeout(() => { setActiveTab("login"); setSearchParams({}); setLoading(false); }, 1200);
      }
    } catch { setLoading(false); }
  };

  return (
    <>
      {window.innerWidth >= 640 && (
        <ToastContainer
          position="top-right"
          autoClose={3500}
          transition={Slide}
          style={{ width: "90vw", maxWidth: 400 }}
          toastStyle={{ fontSize: "1.1rem", borderRadius: 12, minWidth: 200, maxWidth: "90vw" }}
        />
      )}

      {/* Shell editorial */}
      <section className="relative min-h-screen overflow-hidden bg-carbon-950">
        {/* Imagen de fondo */}
        <img
          src="/images/hero/AGC_20250826_175454037.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay direccional */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg, rgba(7,18,11,0.96) 0%, rgba(7,18,11,0.72) 52%, rgba(7,18,11,0.45) 100%)",
          }}
          aria-hidden
        />

        {/* Grid dos columnas */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

          {/* ─── Columna izquierda — editorial ─────────────────── */}
          <div className="hidden lg:flex flex-col justify-between px-16 pt-36 pb-16">
            <div>
              <Logo className="text-white mb-12" />

              <p className={cn(
                "text-eyebrow text-atrato-400 mb-5",
              )}>
                VisitChocó · acceso
              </p>

              <h1 className="font-display text-display text-white leading-[0.96] mb-8">
                Una guía<br />
                al departamento<br />
                <span className="text-atrato-400">más biodiverso</span><br />
                del país.
              </h1>

              <p className="text-body-lg text-white/60 max-w-md leading-relaxed">
                Mapa en tiempo real, biodiversidad documentada, cultura afro e indígena,
                historia y turismo — con datos verificables.
              </p>
            </div>

            {/* Stats — bottom of left col */}
            <div className="flex gap-8 font-mono text-[11px] tracking-[0.2em] uppercase text-white/35">
              {STATS.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>

          {/* ─── Columna derecha — formulario ──────────────────── */}
          <div className="flex items-center justify-center px-6 lg:px-16 py-16 lg:py-24">
            <div className="w-full max-w-[420px]">
              {/* Logo solo en móvil */}
              <div className="lg:hidden mb-8">
                <Logo className="text-white" />
              </div>

              {/* Card glassmorphism */}
              <div
                className={cn(
                  "rounded-3xl p-8 md:p-10",
                  "border border-white/[0.08]",
                  "backdrop-blur-2xl",
                )}
                style={{
                  background: "rgba(7,18,11,0.72)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.45)",
                }}
              >
                <p className="text-eyebrow text-atrato-400 mb-2">
                  {activeTab === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </p>
                <h2 className="font-display text-h2 text-white mb-8 leading-tight">
                  {activeTab === "login" ? "Continúa explorando." : "Únete al mapa."}
                </h2>

                <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />

                {activeTab === "login" ? (
                  <LoginForm
                    onSubmit={handleLogin}
                    loading={loading}
                    onGoToRegister={() => handleTabChange("register")}
                  />
                ) : (
                  <RegisterForm
                    onSubmit={handleRegister}
                    loading={loading}
                    onGoToLogin={() => handleTabChange("login")}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export { ChocoLuxuryLogin as Login };
