/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A API da Caixa bloqueia CORS no navegador → usamos o proxy de dev do Vite.
// Só funciona em `npm run dev` (build/preview não terá proxy — limitação conhecida).
const CAIXA_API = 'https://servicebus2.caixa.gov.br/portaldeloterias/api'

export default defineConfig({
  plugins: [react()],
  build: {
    // recharts (~500 kB) é isolado num chunk próprio de propósito; o aviso
    // padrão de 500 kB não se aplica a esse vendor cacheável separadamente.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // separa a lib de gráficos (recharts/d3) num chunk próprio → bundle
        // inicial menor e melhor cache entre deploys.
        manualChunks: {
          recharts: ['recharts'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/loterias': {
        target: CAIXA_API,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/loterias/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (ms-manager dev proxy)',
          Accept: 'application/json',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
