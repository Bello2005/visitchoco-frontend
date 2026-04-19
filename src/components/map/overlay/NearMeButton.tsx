import React from "react";
import { motion } from "framer-motion";
import { Locate, LocateFixed, Loader2 } from "lucide-react";
import type { GeoStatus } from "../../../hooks/useGeolocation";

interface NearMeButtonProps {
  status: GeoStatus;
  onClick: () => void;
  className?: string;
}

export const NearMeButton: React.FC<NearMeButtonProps> = ({
  status,
  onClick,
  className = "",
}) => {
  const isActive = status === "granted";
  const isLoading = status === "prompt";
  const isError = status === "denied" || status === "error" || status === "unsupported";

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg shadow-gray-900/10 transition-colors duration-200 ${
        isActive
          ? "bg-teal-500 text-white hover:bg-teal-600"
          : isError
          ? "bg-white text-rose-400 hover:bg-rose-50"
          : "bg-white text-gray-700 hover:bg-gray-50"
      } ${className}`}
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      aria-label="Cerca de mí"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 size={16} strokeWidth={2.25} className="animate-spin" />
      ) : isActive ? (
        <LocateFixed size={16} strokeWidth={2.25} />
      ) : (
        <Locate size={16} strokeWidth={2.25} />
      )}
    </motion.button>
  );
};
