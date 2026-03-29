import { motion, AnimatePresence } from "framer-motion";

interface MapLoadingScreenProps {
  visible: boolean;
}

export function MapLoadingScreen({ visible }: MapLoadingScreenProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="map-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "#0a1f0f" }}
        >
          {/* Spinner central */}
          <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>

            {/* Anillo exterior — rotación lenta */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle
                  cx="60" cy="60" r="55"
                  stroke="rgba(16,185,129,0.18)"
                  strokeWidth="1"
                  strokeDasharray="6 10"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Anillo medio — rotación inversa */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute"
              style={{ inset: 10 }}
            >
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <circle
                  cx="50" cy="50" r="45"
                  stroke="rgba(52,211,153,0.28)"
                  strokeWidth="1.5"
                  strokeDasharray="14 8"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Arco que se dibuja — stroke animation */}
            <motion.div
              className="absolute"
              style={{ inset: 18 }}
            >
              <svg width="84" height="84" viewBox="0 0 84 84" fill="none">
                <motion.circle
                  cx="42" cy="42" r="38"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, rotate: -90 }}
                  animate={{ pathLength: [0, 0.75, 0], rotate: [-90, 270] }}
                  transition={{
                    pathLength: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 1.8, repeat: Infinity, ease: "linear" },
                  }}
                  style={{ transformOrigin: "42px 42px" }}
                />
              </svg>
            </motion.div>

            {/* Tres puntos orbitando */}
            {[0, 120, 240].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ inset: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.12,
                }}
              >
                <div
                  className="absolute"
                  style={{
                    width: 6, height: 6,
                    borderRadius: "50%",
                    backgroundColor: i === 0 ? "#34d399" : i === 1 ? "#6ee7b7" : "#a7f3d0",
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${deg}deg) translateY(-52px) translate(-50%, -50%)`,
                    boxShadow: `0 0 6px ${i === 0 ? "#34d399" : "#6ee7b7"}`,
                  }}
                />
              </motion.div>
            ))}

            {/* Monograma central */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex items-center justify-center rounded-2xl bg-emerald-600"
              style={{ width: 44, height: 44, boxShadow: "0 0 20px rgba(16,185,129,0.35)" }}
            >
              <span className="text-white font-black text-sm tracking-tight select-none">VC</span>
            </motion.div>
          </div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-white font-bold text-lg tracking-tight leading-none">
              Visit<span className="text-emerald-400">Chocó</span>
            </p>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.25em] mt-1.5">
              Naturaleza · Cultura · Mar
            </p>
          </motion.div>

          {/* Texto de carga con puntos animados */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex items-center gap-2"
          >
            <span className="text-white/40 text-xs tracking-wide">
              Cargando el territorio
            </span>
            <span className="flex gap-1">
              {[0, 0.2, 0.4].map((delay) => (
                <motion.span
                  key={delay}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay }}
                  className="inline-block w-1 h-1 rounded-full bg-emerald-500"
                />
              ))}
            </span>
          </motion.div>

          {/* Barra de progreso indeterminada — bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-white/5">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/3 rounded-full"
              style={{ background: "linear-gradient(to right, transparent, #10b981, transparent)" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
