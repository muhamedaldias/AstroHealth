import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Dev: the browser talks to http://localhost:5173 and /api is proxied to the backend on :8000.
// Prod: the backend serves apps/web/dist itself, so the same relative "/api" paths just work.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { port: 5173, proxy: { "/api": "http://localhost:8000" } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
