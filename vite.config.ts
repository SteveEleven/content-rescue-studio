import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev: proxy /api/* to the backend in server/index.mjs (node server/index.mjs, port 3000).
// If the backend is down, the proxy errors → client silently falls back to the demo pack.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } },
  },
})
