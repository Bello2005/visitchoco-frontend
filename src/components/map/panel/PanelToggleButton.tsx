import React from "react";
import { motion } from "framer-motion";

interface PanelToggleButtonProps {
  onClick: () => void;
  className?: string;
}

export const PanelToggleButton: React.FC<PanelToggleButtonProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`absolute top-4 left-4 ${className}`}
      style={{ zIndex: 1500 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Abrir panel"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
        }}
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </div>
    </motion.button>
  );
};
