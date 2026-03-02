module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          deep: "#0B4F6C",
          mid: "#1B7A8C",
          light: "#4DB6C8",
        },
        jungle: {
          deep: "#064E3B",
          mid: "#065F46",
          light: "#10B981",
        },
        gold: {
          warm: "#D97706",
          light: "#FCD34D",
          sand: "#FEF3C7",
        },
      },
      backdropBlur: {
        "3xl": "64px",
      },
      animation: {
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "fade-up": "fadeUp 0.3s ease-out",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.6) inset",
        "glass-lg": "0 16px 48px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.5) inset",
      },
    },
  },
  plugins: [],
  important: true,
};
