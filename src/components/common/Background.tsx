import { motion } from "framer-motion";

export const Background = () => {
  return (
    <div className="absolute inset-0 z-0">
      {/* Gradiente principal */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002a4d] via-[#003c1f] to-[#0a3410]" />

      {/* Patrón étnico sutil */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/african-kente.png')",
          backgroundSize: "300px",
        }}
      />

      {/* Reflejos de agua animados */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background:
                "radial-gradient(circle, rgba(173,216,230,0.2) 0%, rgba(173,216,230,0) 70%)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Olas en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 h-full bg-repeat-x"
          style={{
            backgroundImage:
              "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/85486/wave.svg')",
            backgroundSize: "contain",
            animation: "wave 20s linear infinite",
          }}
        />
        <div
          className="absolute bottom-4 left-0 right-0 h-full bg-repeat-x opacity-70"
          style={{
            backgroundImage:
              "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/85486/wave.svg')",
            backgroundSize: "contain",
            animation: "wave 15s linear infinite reverse",
          }}
        />
      </div>
    </div>
  );
};
