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
  // "preview" es lo que corre `vite preview` (usado en Docker para servir
  // el build de produccion, sin nginx — ver frontend/Dockerfile). Mismo
  // rol que "server.proxy" arriba, pero el backend ya no esta en
  // localhost sino en otro contenedor: BACKEND_URL la pone
  // docker-compose.yml, con "http://backend:8000" (nombre del servicio
  // en la red interna) como default si no se define.
  preview: {
    host: true, // escuchar en 0.0.0.0, no solo localhost — imprescindible
    // dentro de un contenedor para que el mapeo de puerto de Docker
    // pueda alcanzarlo.
    port: 4173,
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://backend:8000",
        changeOrigin: true,
        // Un analisis real (transcripcion + 2 embeddings + clasificacion
        // + LLM), en CPU y con poca RAM, puede tardar varios minutos —
        // bastante mas que cualquier timeout por defecto. Antes esto
        // vivia en nginx.conf (proxy_read_timeout); ahora es esto.
        timeout: 300000,
        proxyTimeout: 300000,
      },
    },
  },
});
