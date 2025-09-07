import { useState, useEffect } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RiHotelLine } from "react-icons/ri";
import { BiLeaf } from "react-icons/bi";
import { IoIosWater } from "react-icons/io";
import { TbBeach } from "react-icons/tb";
import { Background } from "../../components/common/Background";
import { Footer } from "../../components/landing/Footer";
import { Logo } from "../../components/brand/Logo";
import { AuthTabs } from "../../components/auth/AuthTabs";
import { FeatureGrid } from "../../components/features/FeatureGrid";
import { LoginForm } from "../../components/auth/LoginForm";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { useAudio } from "../../hooks/useAudio";
import { useFeatureRotation } from "../../hooks/useFeatureRotation";
import { buildApiUrl } from "../../utils/api";

const ChocoLuxuryLogin = () => {
  // Reset loading al desmontar (por si el usuario navega manualmente)
  useEffect(() => {
    return () => setLoading(false);
  }, []);
  // const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [loading, setLoading] = useState(false);
  // Eliminado manejo de error local, solo se usan toasts

  // Actualiza el tab cuando cambia el parámetro en la URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "register" && activeTab !== "register") {
      setActiveTab("register");
    } else if (tabParam !== "register" && activeTab !== "login") {
      setActiveTab("login");
    }
  }, [searchParams, activeTab]);

  // Cuando cambia el tab, actualiza el parámetro en la URL
  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setSearchParams(tab === "register" ? { tab: "register" } : {});
  };

  useEffect(() => {
    // Solo en móvil (menos de 1024px)
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, []);

  const features = [
    {
      icon: <RiHotelLine className="text-3xl" />,
      title: "Alojamientos Exclusivos",
      description: "Descubre eco-lodges de lujo en medio de la selva",
    },
    {
      icon: <BiLeaf className="text-3xl" />,
      title: "Ecoturismo Responsable",
      description:
        "Experiencias sostenibles que preservan nuestra biodiversidad",
    },
    {
      icon: <IoIosWater className="text-3xl" />,
      title: "Aventuras Acuáticas",
      description: "Navega por los ríos más biodiversos del planeta",
    },
    {
      icon: <TbBeach className="text-3xl" />,
      title: "Playas Paradisíacas",
      description: "Arenas doradas y aguas cristalinas en el Pacífico",
    },
  ];
  const activeFeature = useFeatureRotation({ featuresLength: features.length });
  const { isPlaying, toggleAudio } = useAudio(
    "/audio/prueba/ambientSounds.mp3"
  );

  // Login handler
  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    const isMobile = window.innerWidth < 640;
    const apiUrl = buildApiUrl("/auth/login");
    console.log("[LOGIN] Iniciando login", values, { isMobile });
    console.log("[LOGIN] API URL:", apiUrl);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      console.log("[LOGIN] Respuesta recibida", res);
      const body = await res.text();
      console.log("[LOGIN] Body recibido", body);
      if (!res.ok) {
        let message = "Login failed";
        try {
          const json = JSON.parse(body);
          message = json.message || message;
        } catch (e) {
          console.log("[LOGIN] Error parseando JSON de error", e);
        }
        console.log("[LOGIN] Error de login", message);
        if (isMobile) {
          alert(message);
        } else {
          toast.error(message, {
            position: "top-right",
            autoClose: 3500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            icon: () => <span style={{ fontSize: 24 }}>🌧️</span>,
          });
        }
        throw new Error(message);
      }
      const { token, role } = JSON.parse(body);
      console.log("[LOGIN] Login exitoso", { token, role });
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);
      console.log("[LOGIN] Token y role guardados en localStorage");
      setLoading(false);
      // Convertir el rol a número para comparación consistente
      const roleNumber = Number(role);
      const welcomeMessage =
        roleNumber === 1
          ? "¡Bienvenido, administrador!"
          : "¡Bienvenido, usuario!";
      if (isMobile) {
        alert(welcomeMessage);
        console.log("[LOGIN] Redirigiendo a dashboard", roleNumber);
        if (roleNumber === 1) {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/user/dashboard";
        }
        setLoading(false);
      } else {
        toast.success(welcomeMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          icon: () => <span style={{ fontSize: 24 }}>🐋</span>,
        });
        setTimeout(() => {
          console.log("[LOGIN] Redirigiendo a dashboard", roleNumber);
          if (roleNumber === 1) {
            navigate("/admin/dashboard");
          } else {
            navigate("/user/dashboard");
          }
          setLoading(false);
        }, 1200);
      }
    } catch (err) {
      console.log("[LOGIN] Error de red o excepción:", err);
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    const isMobile = window.innerWidth < 640;
    const apiUrl = buildApiUrl("/auth/register");
    console.log("[REGISTER] Iniciando registro", values, { isMobile });
    console.log("[REGISTER] API URL:", apiUrl);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          password: values.password,
        }),
      });
      console.log("[REGISTER] Respuesta recibida", res);
      const body = await res.text();
      console.log("[REGISTER] Body recibido", body);
      if (!res.ok) {
        let message = "Registro fallido";
        try {
          const json = JSON.parse(body);
          message = json.message || message;
        } catch (e) {
          console.log("[REGISTER] Error parseando JSON de error", e);
        }
        console.log("[REGISTER] Error de registro", message);
        if (isMobile) {
          alert(message);
        } else {
          toast.error(message, {
            position: "top-right",
            autoClose: 3500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            icon: () => <span style={{ fontSize: 24 }}>🦀</span>,
          });
        }
        throw new Error(message);
      }
      setLoading(false);
      if (isMobile) {
        alert("¡Registro exitoso! Ahora puedes iniciar sesión");
        console.log("[REGISTER] Cambio a login tab tras registro exitoso");
        setActiveTab("login");
        setSearchParams({});
        setLoading(false);
      } else {
        toast.success("¡Registro exitoso! Ahora puedes iniciar sesión", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          icon: () => <span style={{ fontSize: 24 }}>🌴</span>,
        });
        setTimeout(() => {
          setActiveTab("login");
          setSearchParams({});
          setLoading(false);
        }, 1200);
      }
    } catch (err) {
      console.log("[REGISTER] Error de red o excepción:", err);
      setLoading(false);
    }
  };

  return (
    <>
      {window.innerWidth >= 640 && (
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          transition={Slide}
          style={{
            width: "90vw",
            maxWidth: 400,
          }}
          toastStyle={{
            fontSize: "1.1rem",
            borderRadius: 12,
            minWidth: 200,
            maxWidth: "90vw",
          }}
        />
      )}
      <div className="relative w-full h-screen overflow-hidden bg-[#001220] text-white">
        <Background />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-2 sm:py-4 mb-72 sm:mb-56 md:mb-32 login-form-section-mobile-spacing">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-2 lg:gap-16 items-center">
            {/* Sección izquierda - Branding de lujo */}
            <div className="hidden lg:block space-y-8">
              <div className="flex items-center space-x-3">
                <Logo size="md" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Descubre el{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  lujo salvaje
                </span>{" "}
                del Pacífico
              </h1>
              <p className="text-lg text-white/80 max-w-lg">
                Donde la selva se encuentra con el mar, te ofrecemos
                experiencias de turismo de lujo que transformarán tu percepción
                de Colombia.
              </p>
              <FeatureGrid features={features} activeFeature={activeFeature} />
            </div>
            {/* Sección derecha - Formulario de lujo */}
            <div
              className="p-6 sm:p-8 md:p-10 rounded-2xl backdrop-blur-2xl bg-white/20 border border-white/20 shadow-2xl w-full max-w-md mx-auto lg:mx-0 my-8 sm:my-4 lg:my-0 focus-within:shadow-emerald-400/30 transition-shadow"
              style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
            >
              {/* Logo para móvil, solo encima del form y nunca en escritorio */}
              <div className="block lg:hidden flex justify-center mb-4">
                <Logo size="sm" />
              </div>
              <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />
              {activeTab === "login" ? (
                <LoginForm
                  onSubmit={handleLogin}
                  loading={loading}
                  // Pasa función para ir a registro
                  onGoToRegister={() => handleTabChange("register")}
                />
              ) : (
                <RegisterForm
                  onSubmit={handleRegister}
                  loading={loading}
                  // Pasa función para ir a login
                  onGoToLogin={() => handleTabChange("login")}
                />
              )}
            </div>
          </div>
        </div>
        {/* Audio ambiental oculto */}

        <Footer isPlaying={isPlaying} onToggleAudio={toggleAudio} />
        {/* Estilos para animaciones y scrollbars personalizados */}
        <style>{`
          @media (max-width: 640px) {
            .login-form-section-mobile-spacing {
              margin-bottom: 7.5rem !important;
            }
          }
          @media (max-width: 640px) {
            .Toastify__toast-container {
              left: 0 !important;
              right: 0 !important;
              margin: 0 auto !important;
              width: 98vw !important;
              max-width: 98vw !important;
            }
            .Toastify__toast {
              min-width: 90vw !important;
              max-width: 98vw !important;
              font-size: 1.05rem !important;
            }
          }
          @keyframes wave {
            0% { background-position-x: 0; }
            100% { background-position-x: 1000px; }
          }
          @keyframes pulse {
            0% { opacity: 0.1; transform: scale(1); }
            100% { opacity: 0.05; transform: scale(1.5); }
          }
          input:-webkit-autofill::placeholder {
            color: #38bdf8 !important;
            opacity: 1 !important;
          }
          input:-webkit-autofill {
            -webkit-text-fill-color: #fff !important;
            transition: background-color 9999s ease-in-out 0s;
          }
          input[type="checkbox"] {
            background-color: transparent !important;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            border: 1.5px solid #d1fae5;
            border-radius: 0.375rem;
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
            box-shadow: none;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          input[type="checkbox"]:checked {
            background-color: #34d399 !important;
            border-color: #34d399 !important;
          }
          input[type="checkbox"]:focus {
            box-shadow: 0 0 0 2px #6ee7b7;
            border-color: #34d399;
          }
          input[type="checkbox"]::-webkit-check-indeterminate,
          input[type="checkbox"]::-webkit-check-checked,
          input[type="checkbox"]::-webkit-check-unchecked {
            background: transparent !important;
          }
          input[type="checkbox"]:checked:after {
            content: '';
            display: block;
            width: 0.5rem;
            height: 0.9rem;
            border: solid #fff;
            border-width: 0 0.2rem 0.2rem 0;
            margin: 0.1rem 0 0 0.35rem;
            transform: rotate(45deg);
          }
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: rgba(52, 211, 153, 0.5);
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: rgba(52, 211, 153, 0.7);
          }
        `}</style>
      </div>
    </>
  );
};

export { ChocoLuxuryLogin as Login };
