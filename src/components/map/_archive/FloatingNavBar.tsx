import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface FloatingNavBarProps {
  onSearchOpen: () => void;
  onExplorerToggle: () => void;
  isExplorerOpen: boolean;
  className?: string;
}

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  onSearchOpen,
  onExplorerToggle,
  isExplorerOpen,
  className = "",
}) => {
  return (
    <motion.div
      className={`absolute top-4 left-1/2 -translate-x-1/2 ${className}`}
      style={{ zIndex: 2000 }}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 22 }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 pr-2 border-r border-gray-200/60"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">VC</span>
          </div>
          <span className="text-sm font-semibold text-gray-800 hidden sm:block">
            VisitChocó
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/animales" label="Animales" icon="🦋" />
          <NavLink to="/turismo" label="Turismo" icon="🏖️" />
          <NavLink to="/fiesta" label="Fiestas" icon="🎭" />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-gray-200/60" />

        {/* Explorar toggle */}
        <motion.button
          onClick={onExplorerToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isExplorerOpen
              ? "bg-teal-500 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100/80"
          }`}
          whileTap={{ scale: 0.95 }}
          aria-label="Explorar el Chocó"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          <span className="hidden sm:block">Explorar</span>
        </motion.button>

        {/* Search */}
        <motion.button
          onClick={onSearchOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
          whileTap={{ scale: 0.95 }}
          aria-label="Buscar"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="hidden sm:block text-xs text-gray-400">
            Buscar lugar...
          </span>
        </motion.button>

        {/* Auth link */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors duration-200 shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="hidden sm:block">Entrar</span>
        </Link>
      </div>
    </motion.div>
  );
};

const NavLink: React.FC<{ to: string; label: string; icon: string }> = ({
  to,
  label,
  icon,
}) => (
  <Link
    to={to}
    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-150 font-medium"
  >
    <span>{icon}</span>
    <span>{label}</span>
  </Link>
);
