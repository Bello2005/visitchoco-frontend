/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.css"],
  theme: {
    extend: {
      colors: {
        "choco-dark": "#1A3A2F",
        "choco-medium": "#2D6A4F",
        "choco-light": "#52B788",
        "choco-gold": "#F4A261",
        "choco-gold-dark": "#E76F51",
        "choco-blue": "#3A86FF",
        "choco-blue-dark": "#2667CC",
        "choco-sand": "#E9C46A",
      },
    },
  },
  plugins: [
    // @ts-ignore
    require("@tailwindcss/forms"),
    require("tailwind-scrollbar"),
  ],
  important: true,
  corePlugins: {
    preflight: true,
  },
};
