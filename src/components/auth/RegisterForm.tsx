import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { useState } from "react";
import { useForm } from "../../hooks/useForm";

interface RegisterFormProps {
  onSubmit: (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onGoToLogin?: () => void;
}

const validateEmail = (email: string) => {
  const re =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email);
};
const validatePassword = (password: string) => password.length >= 8;
const validateFirstName = (name: string) => name.trim().length > 1;
const validateLastName = (name: string) => name.trim().length > 1;
const validateConfirmPassword = (password: string, confirm: string) =>
  password === confirm && confirm.length > 0;

export const RegisterForm = ({
  onSubmit,
  loading = false,
  error,
  onGoToLogin,
}: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { values, touched, errors, handleChange, handleBlur } = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationRules: {
      firstName: validateFirstName,
      lastName: validateLastName,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (confirm, vals = { password: "" }) =>
        validateConfirmPassword(vals.password, confirm),
    },
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    // Obtener valores directamente del formulario (para soportar autocompletado móvil)
    const form = e.currentTarget;
    const firstName =
      (form.elements.namedItem("firstName") as HTMLInputElement)?.value || "";
    const lastName =
      (form.elements.namedItem("lastName") as HTMLInputElement)?.value || "";
    const email =
      (form.elements.namedItem("email") as HTMLInputElement)?.value || "";
    const password =
      (form.elements.namedItem("password") as HTMLInputElement)?.value || "";
    const confirmPassword =
      (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value ||
      "";
    const valid =
      validateFirstName(firstName) &&
      validateLastName(lastName) &&
      validateEmail(email) &&
      validatePassword(password) &&
      validateConfirmPassword(password, confirmPassword);
    if (!valid) return;
    await onSubmit({ firstName, lastName, email, password, confirmPassword });
  };

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 sm:space-y-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-emerald-400/50 pr-2"
      >
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5 sm:mb-2">
              Nombre
            </label>
            <div className="relative">
              <input
                type="text"
                name="firstName"
                value={values.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                onBlur={() => handleBlur("firstName")}
                className={`w-full px-4 py-3 bg-white/5 border ${
                  touched.firstName && errors.firstName
                    ? "border-rose-400"
                    : "border-white/10"
                } rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none transition-all text-white placeholder-white/70`}
                placeholder="Tu nombre"
              />
            </div>
            {touched.firstName && errors.firstName && (
              <p className="text-xs text-rose-400 mt-1">
                Ingresa un nombre válido (mínimo 2 letras).
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Apellido
            </label>
            <div className="relative">
              <input
                type="text"
                name="lastName"
                value={values.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                onBlur={() => handleBlur("lastName")}
                className={`w-full px-4 py-3 bg-white/5 border ${
                  touched.lastName && errors.lastName
                    ? "border-rose-400"
                    : "border-white/10"
                } rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none transition-all text-white placeholder-white/70`}
                placeholder="Tu apellido"
              />
            </div>
            {touched.lastName && errors.lastName && (
              <p className="text-xs text-rose-400 mt-1">
                Ingresa un apellido válido (mínimo 2 letras).
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={`w-full px-4 py-3 bg-white/5 border ${
                touched.email && errors.email
                  ? "border-rose-400"
                  : "border-white/10"
              } rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none transition-all text-white placeholder-white/70`}
              placeholder="tu@email.com"
            />
          </div>
          {touched.email && errors.email && (
            <p className="text-xs text-rose-400 mt-1">
              Ingresa un correo electrónico válido.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              className={`w-full px-4 py-3 bg-white/5 border ${
                touched.password && errors.password
                  ? "border-rose-400"
                  : "border-white/10"
              } rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none transition-all text-white placeholder-white/70`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="text-xs text-rose-400 mt-1">Mínimo 8 caracteres</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              className={`w-full px-4 py-3 bg-white/5 border ${
                touched.confirmPassword && errors.confirmPassword
                  ? "border-rose-400"
                  : "border-white/10"
              } rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none transition-all text-white placeholder-white/70`}
              placeholder="••••••••"
            />
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-xs text-rose-400 mt-1">
              Las contraseñas no coinciden.
            </p>
          )}
        </div>
        <motion.button
          type="submit"
          className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg font-medium shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
        >
          <span>{loading ? "Creando cuenta..." : "Crear cuenta premium"}</span>
          <FiArrowRight className="text-xl" />
        </motion.button>
        {(error ||
          (submitAttempted &&
            (errors.firstName ||
              errors.lastName ||
              errors.email ||
              errors.password ||
              errors.confirmPassword))) && (
          <p className="text-xs text-rose-400 mt-2 text-center">
            {error ||
              (errors.firstName && "Nombre inválido") ||
              (errors.lastName && "Apellido inválido") ||
              (errors.email && "Correo inválido") ||
              (errors.password && "Contraseña inválida") ||
              (errors.confirmPassword && "Las contraseñas no coinciden")}
          </p>
        )}
      </motion.form>
      {/* Enlace para ir a login */}
      <div className="mt-4 text-center">
        <span className="text-white/70 text-sm">¿Ya tienes cuenta? </span>
        <button
          type="button"
          className="text-emerald-400 hover:text-blue-400 font-medium text-sm transition-colors underline"
          onClick={onGoToLogin}
        >
          Inicia sesión
        </button>
      </div>
    </>
  );
};
