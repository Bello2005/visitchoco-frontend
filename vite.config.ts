import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    // ...otros settings...
    allowedHosts: ["718652bd4b2d.ngrok-free.app"],
  },
  plugins: [react()],
});
