import React from "react";
import { motion } from "framer-motion";
import { FaCompass, FaLeaf, FaUmbrellaBeach } from "react-icons/fa";

type SpinnerVariant = "compass" | "nature" | "beach" | "dots" | "bars";

interface LoadingSpinnerProps {
  variant?: SpinnerVariant;
  message?: string;
  fullScreen?: boolean;
  overlayOpacity?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = "compass",
  message = "Cargando la magia de Chocó...",
  fullScreen = true,
  overlayOpacity = 80
}) => {
  const overlayClass = fullScreen 
    ? "fixed inset-0 z-50 flex items-center justify-center"
    : "relative w-full h-full flex items-center justify-center";

  const variants = {
    compass: (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-5xl text-emerald-600"
      >
        <FaCompass />
      </motion.div>
    ),
    nature: (
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-5xl text-teal-500"
      >
        <FaLeaf />
      </motion.div>
    ),
    beach: (
      <div className="relative h-16 w-16">
        <motion.div
          animate={{
            y: [0, -15, 0],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute text-4xl text-amber-400"
        >
          <FaUmbrellaBeach />
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.9, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute inset-0 rounded-full border-2 border-amber-300"
        />
      </div>
    ),
    dots: (
      <div className="flex space-x-3">
        {[0, 0.2, 0.4].map((delay) => (
          <motion.div
            key={delay}
            animate={{
              y: [0, -15, 0],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay
            }}
            className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600"
          />
        ))}
      </div>
    ),
    bars: (
      <div className="flex space-x-1.5 h-12 items-end">
        {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
          <motion.div
            key={delay}
            animate={{
              height: ["40%", "90%", "40%"],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay
            }}
            style={{ width: `${8 + i * 2}px` }}
            className="bg-gradient-to-b from-emerald-400 to-teal-500 rounded-t-sm"
          />
        ))}
      </div>
    )
  };

  return (
    <div 
      className={`${overlayClass} backdrop-blur-sm`}
      style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center space-y-6 p-8 rounded-2xl"
      >
        <div className="relative">
          {variants[variant]}
          {variant === "compass" && (
            <motion.div
              animate={{ 
                rotate: -360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 rounded-full border-2 border-emerald-300 border-dashed"
            />
          )}
        </div>
        
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-gray-700 text-center max-w-xs"
          >
            {message}
          </motion.p>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-gray-500 mt-2"
        >
          Por favor espere...
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;