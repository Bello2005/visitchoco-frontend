import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.5rem", md: "2rem", lg: "3rem" },
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        atrato: {
          50:  "var(--atrato-50)",
          100: "var(--atrato-100)",
          200: "var(--atrato-200)",
          400: "var(--atrato-400)",
          500: "var(--atrato-500)",
          700: "var(--atrato-700)",
          900: "var(--atrato-900)",
          950: "var(--atrato-950)",
        },
        condoto: {
          300: "var(--condoto-300)",
          400: "var(--condoto-400)",
          500: "var(--condoto-500)",
          600: "var(--condoto-600)",
        },
        chirimia: {
          400: "var(--chirimia-400)",
          500: "var(--chirimia-500)",
          700: "var(--chirimia-700)",
        },
        pacifico: {
          300: "var(--pacifico-300)",
          400: "var(--pacifico-400)",
          600: "var(--pacifico-600)",
          900: "var(--pacifico-900)",
        },
        niebla:    "var(--niebla)",
        carbon:    { 900: "var(--carbon-900)", 950: "var(--carbon-950)" },
        accent:    { DEFAULT: "var(--accent-fg)", bg: "var(--accent-bg)", line: "var(--accent-line)" },
        // Legacy colors — keep while old components still use them
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
      fontFamily: {
        display: ["'Fraunces Variable'", "ui-serif", "Georgia", "serif"],
        sans:    ["'Geist Variable'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["'Geist Mono Variable'", "ui-monospace", "SFMono-Regular", "monospace"],
        // Legacy
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
      fontSize: {
        "eyebrow":     ["0.75rem", { lineHeight: "1", letterSpacing: "0.22em", fontWeight: "600" }],
        "micro":       ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.05em" }],
        "body-sm":     ["0.875rem", { lineHeight: "1.55" }],
        "body":        ["1rem",     { lineHeight: "1.6"  }],
        "body-lg":     ["1.125rem", { lineHeight: "1.65" }],
        "h3":          ["clamp(1.25rem, 1.5vw, 1.5rem)",  { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        "h2":          ["clamp(1.75rem, 3vw, 2.5rem)",    { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "h1":          ["clamp(2.25rem, 4.5vw, 3.5rem)",  { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display":     ["clamp(2.75rem, 6vw, 5rem)",      { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display-xl":  ["clamp(3.5rem, 9vw, 8rem)",       { lineHeight: "0.94", letterSpacing: "-0.04em", fontWeight: "700" }],
        "display-2xl": ["clamp(4rem, 12vw, 11rem)",       { lineHeight: "0.9",  letterSpacing: "-0.045em", fontWeight: "700" }],
      },
      letterSpacing: {
        tightest: "-0.045em",
        eyebrow:  "0.22em",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "soft":  "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        "lift":  "0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.06)",
        "ring-accent": "0 0 0 1px var(--accent-line), 0 8px 24px var(--accent-bg)",
        // Legacy
        glass: "0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.6) inset",
        "glass-lg": "0 16px 48px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.5) inset",
      },
      backdropBlur: {
        "3xl": "64px",
      },
      animation: {
        "fade-in": "fade-in 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "rise":    "rise 480ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer 1800ms linear infinite",
        // Legacy
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "fade-up": "fadeUp 0.3s ease-out",
        "fiesta-marquee": "fiesta-marquee 25s linear infinite",
        "fiesta-confetti-drop": "fiesta-confetti-drop 3s ease-in forwards",
        "float": "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 3s infinite",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "rise":    { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "shimmer": { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fiesta-marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fiesta-confetti-drop": {
          "0%": { transform: "translateY(-100px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "stand":    "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [animate],
};

export default config;
