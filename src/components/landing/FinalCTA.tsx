import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaMapMarkedAlt,
  FaLeaf,
  FaUmbrellaBeach,
} from "react-icons/fa";

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 py-32 sm:py-40 overflow-hidden min-h-[600px] flex items-center z-10 isolate">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/src/assets/noise.png')] opacity-5"></div>
        <div className="absolute -top-1/2 left-0 w-[800px] h-[800px] bg-emerald-400/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-1/2 right-0 w-[800px] h-[800px] bg-teal-400/20 blur-[100px] rounded-full"></div>
      </div>

      {/* Floating icons */}
      <FaLeaf className="opacity-20 blur-[1px] text-emerald-400 text-6xl absolute top-1/4 left-[15%] animate-float" />
      <FaUmbrellaBeach className="opacity-20 blur-[1px] text-amber-300 text-7xl absolute top-1/3 right-[20%] animate-float-delay" />
      <FaMapMarkedAlt className="opacity-20 blur-[1px] text-teal-400 text-5xl absolute bottom-1/4 left-[30%] animate-float-delay-2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            ¿Listo para tu
            <br />
            <span className="text-emerald-400">aventura en Chocó?</span>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-gray-200/90 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Regístrate ahora y recibe nuestro itinerario exclusivo con los
            mejores lugares, además de un 10% de descuento en tu primera
            experiencia.
          </motion.p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="text-lg px-10 py-5 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center space-x-3 group"
            >
              <span>Empieza ahora</span>
              <FaArrowRight className="ml-2 transform transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-lg px-10 py-5 text-emerald-400 font-semibold rounded-full border-2 border-emerald-400 hover:bg-emerald-50/10 transition-all duration-300"
            >
              Ver itinerarios de muestra
            </motion.button>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-400 text-sm"
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={`https://randomuser.me/api/portraits/${
                      i % 2 === 0 ? "women" : "men"
                    }/${i}0.jpg`}
                    alt="User"
                    className="trust-indicator-avatar w-8 h-8 rounded-full"
                  />
                ))}
              </div>
              <span>+5,000 viajeros felices</span>
            </div>

            <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>4.9/5 en todas las plataformas</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating animated circles */}
      <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              width: `${10 + Math.random() * 20}px`,
              height: `${10 + Math.random() * 20}px`,
            }}
            className="absolute bottom-0 rounded-full bg-white/10"
          />
        ))}
      </div>
    </section>
  );
};
