import { motion } from "framer-motion";
import { FaSoundcloud } from "react-icons/fa";

interface FooterProps {
  isPlaying: boolean;
  onToggleAudio: () => void;
}

export const Footer = ({ isPlaying, onToggleAudio }: FooterProps) => {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-20 py-4 sm:py-4 md:py-6 px-4 sm:px-4 md:px-10 border-t border-white/10 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          <button
            onClick={onToggleAudio}
            className={`flex items-center space-x-2 ${
              isPlaying ? "text-emerald-400" : "text-white/60 hover:text-white"
            }`}
            type="button"
          >
            <FaSoundcloud className="text-xl" />
            <span className="text-sm hidden sm:inline">
              {isPlaying
                ? "Escuchando: Ritmos del Pacífico"
                : "Activar sonidos ambientales"}
            </span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 md:space-x-8 text-center sm:text-left">
          <a
            href="#"
            className="text-[10px] sm:text-xs md:text-sm text-white/60 hover:text-white transition-colors"
          >
            Términos de servicio
          </a>
          <a
            href="#"
            className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
          >
            Política de privacidad
          </a>
          <a
            href="#"
            className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
          >
            Contacto
          </a>
          <div className="text-xs sm:text-sm text-white/40">
            © 2023 Visit Chocó. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </motion.div>
  );
};
