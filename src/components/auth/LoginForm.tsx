import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useState } from "react";
import { useForm } from "../../hooks/useForm";

interface LoginFormProps {
  onSubmit: (values: { email: string; password: string }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onGoToRegister?: () => void;
}

const validateEmail = (email: string) => {
  const re =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email);
};

const validatePassword = (password: string) => password.length >= 8;

export const LoginForm = ({
  onSubmit,
  loading = false,
  error,
  onGoToRegister,
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const { values, touched, errors, handleChange, handleBlur } = useForm({
    initialValues: { email: "", password: "" },
    validationRules: {
      email: validateEmail,
      password: validatePassword,
    },
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    // Obtener valores directamente del formulario (para soportar autocompletado móvil)
    const form = e.currentTarget;
    const email =
      (form.elements.namedItem("email") as HTMLInputElement)?.value || "";
    const password =
      (form.elements.namedItem("password") as HTMLInputElement)?.value || "";
    const valid = validateEmail(email) && validatePassword(password);
    if (!valid) return;
    await onSubmit({ email, password });
  };

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        autoComplete="on"
        className="space-y-7"
      >
        {/* Campo Email */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-2 tracking-wide">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-white/50" />
            </div>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              required
              className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                touched.email && errors.email
                  ? "border-rose-400"
                  : "border-white/20"
              } rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:outline-none transition-all duration-200`}
              placeholder="tu@email.com"
              autoComplete="username"
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-2 tracking-wide">
            Contraseña
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-white/50" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              required
              className={`w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:outline-none transition-all duration-200`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/80 hover:text-white transition-colors"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Recordar contraseña */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="checkbox-custom"
            />
            <label
              htmlFor="remember-me"
              className="ml-3 block text-sm text-white/80 select-none font-medium tracking-wide"
            >
              Recordar sesión
            </label>
          </div>
          <a
            href="#"
            className="text-sm text-emerald-400 hover:text-blue-400 transition-colors font-medium"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Botón de Login */}
        <motion.button
          type="submit"
          className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg font-medium shadow-lg"
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          disabled={loading}
        >
          <span>{loading ? "Entrando..." : "Entrar"}</span>
          <FiArrowRight className="text-xl" />
        </motion.button>

        {(error || (submitAttempted && (errors.email || errors.password))) && (
          <p className="text-xs text-rose-400 mt-2 text-center">
            {error ||
              (errors.email && "Correo inválido") ||
              (errors.password && "Contraseña inválida")}
          </p>
        )}
      </motion.form>
      {/* Enlace para ir a registro */}
      <div className="mt-4 text-center">
        <span className="text-white/70 text-sm">¿No tienes cuenta? </span>
        <button
          type="button"
          className="text-emerald-400 hover:text-blue-400 font-medium text-sm transition-colors underline"
          onClick={onGoToRegister}
        >
          Regístrate
        </button>
      </div>
    </>
  );
};
