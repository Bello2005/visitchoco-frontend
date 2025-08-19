import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCompass, FaUmbrellaBeach, FaLeaf } from "react-icons/fa";
import Lottie from "lottie-react";
import jungleAnimation from "./animations/jungle.json";
import riverAnimation from "./animations/river.json";

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center px-4 overflow-hidden relative">
      {/* Elementos decorativos animados */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-10 left-10 opacity-20"
      >
        <FaLeaf className="text-8xl text-emerald-600" />
      </motion.div>

      <motion.div
        animate={{
          x: [0, 15, 0],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 right-10 opacity-20"
      >
        <FaUmbrellaBeach className="text-8xl text-amber-400" />
      </motion.div>

      {/* Animación de jungla */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-20">
        <Lottie animationData={jungleAnimation} loop={true} />
      </div>

      {/* Animación de río */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-15">
        <Lottie animationData={riverAnimation} loop={true} />
      </div>

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden p-12 border border-white/20"
      >
        {/* Efecto de vidrio esmerilado */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-md z-0"></div>

        {/* Patrón de hojas decorativas */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-1/4 w-8 h-8 bg-emerald-500 rounded-full"></div>
          <div className="absolute top-1/3 right-1/5 w-6 h-6 bg-teal-400 rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/5 w-10 h-10 bg-amber-300 rounded-full"></div>
        </div>

        <div className="relative z-10">
          {/* Número 404 animado */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-8"
          >
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 inline-block">
              404
            </h1>
          </motion.div>

          {/* Brillo animado */}
          <motion.div
            animate={{
              x: [-100, 300],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-white/0 via-white/40 to-white/0"
          ></motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-gray-800 mb-6"
          >
            ¡Ups! Te has perdido en la selva
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-600 mb-10 max-w-lg mx-auto"
          >
            La página que buscas se ha escondido como un tucán en la espesura.
            Pero no te preocupes, podemos guiarte de vuelta a casa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <span>Volver al inicio</span>
              <FaCompass className="transition-transform group-hover:rotate-45" />
            </Link>

            <button className="px-8 py-4 bg-transparent text-emerald-600 font-semibold rounded-full border-2 border-emerald-400/50 hover:border-emerald-400 transition-all duration-300 hover:bg-white/20">
              Explorar destinos
            </button>
          </motion.div>

          {/* Elemento decorativo inferior */}
          <motion.div
            animate={{
              scaleX: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mt-12 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto w-1/2"
          ></motion.div>
        </div>
      </motion.div>

      {/* Efecto de partículas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100],
              x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2]
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              background: `rgba(${Math.random() > 0.5 ? 16 : 0}, ${Math.floor(Math.random() * 100 + 156)}, ${Math.floor(Math.random() * 50 + 100)}, 0.5)`,
              borderRadius: '50%'
            }}
            className="absolute"
          />
        ))}
      </div>
    </div>
  );
};