import { motion } from "framer-motion";
import { FC } from "react";

interface AuthTabsProps {
  activeTab: "login" | "register";
  onTabChange: (tab: "login" | "register") => void;
}

export const AuthTabs: FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex mb-10 border-b border-white/10">
      <div className="relative flex w-full">
        <button
          className={`pb-4 px-6 font-medium flex-1 text-center relative z-10 ${
            activeTab === "login"
              ? "text-white"
              : "text-white/50 hover:text-white/80"
          }`}
          onClick={() => onTabChange("login")}
        >
          Iniciar Sesión
        </button>
        <button
          className={`pb-4 px-6 font-medium flex-1 text-center relative z-10 ${
            activeTab === "register"
              ? "text-white"
              : "text-white/50 hover:text-white/80"
          }`}
          onClick={() => onTabChange("register")}
        >
          Registrarse
        </button>
        <motion.div
          layoutId="tabIndicator"
          className="absolute bottom-0 h-0.5 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
          initial={false}
          animate={{
            left: activeTab === "login" ? 0 : "50%",
            width: "50%",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{ right: "auto" }}
        />
      </div>
    </div>
  );
};
