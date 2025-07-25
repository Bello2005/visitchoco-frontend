/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // puedes extender tu tema aquí
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    // añade más plugins si los quieres
  ],
};
