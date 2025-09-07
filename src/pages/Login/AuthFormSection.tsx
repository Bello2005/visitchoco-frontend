
import { Logo } from "../../components/brand/Logo";
import { AuthTabs } from "../../components/auth/AuthTabs";
import { LoginForm } from "../../components/auth/LoginForm";
import { RegisterForm } from "../../components/auth/RegisterForm";

interface Props {
  activeTab: "login" | "register";
  loading: boolean;
  handleTabChange: (tab: "login" | "register") => void;
  handleLogin: (values: { email: string; password: string }) => Promise<void>;
  handleRegister: (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
}

export function AuthFormSection({
  activeTab,
  loading,
  handleTabChange,
  handleLogin,
  handleRegister,
}: Props) {
  return (
    <div
      className="p-6 sm:p-8 md:p-10 rounded-2xl backdrop-blur-2xl bg-white/20 border border-white/20 shadow-2xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto lg:mx-0 my-8 sm:my-4 lg:my-0 focus-within:shadow-emerald-400/30 transition-shadow"
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
  );
}
