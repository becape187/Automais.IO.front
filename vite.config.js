import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/hubs': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true, // Habilitar WebSocket para SignalR
      },
    },
  },
  build: {
    minify: 'esbuild', // Usar esbuild ao invés de terser (mais rápido e menos problemas)
    rollupOptions: {
      output: {
        // Manter nomes de variáveis mais legíveis para debug
        manualChunks: undefined,
      },
    },
  },
})

