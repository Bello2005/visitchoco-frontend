import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    // ...otros settings...
    allowedHosts: ["718652bd4b2d.ngrok-free.app"],
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          leaflet: ["leaflet", "react-leaflet"],
          swiper: ["swiper", "swiper/react"],
          icons: ["react-icons"],
          lottie: ["lottie-web"],
          utils: ["framer-motion", "react-toastify", "react-responsive"],
        }
      }
    },
    chunkSizeWarningLimit: 800
  }
});
