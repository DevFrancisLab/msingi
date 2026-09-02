import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // The dev server talks to FastAPI directly over CORS (see src/api/client.ts
  // and VITE_API_BASE_URL), not through a Vite proxy — the backend allows
  // this origin by default (backend/app/core/config.py:cors_origins).
  server: {
    port: 5173,
  },
})
