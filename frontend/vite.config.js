import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Backend y frontend son proyectos separados: en dev, Vite proxea /api al
// backend FastAPI para evitar problemas de CORS sin acoplar ambos.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
