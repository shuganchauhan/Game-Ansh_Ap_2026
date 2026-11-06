import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_TARGET = process.env.VITE_BACKEND_TARGET || 'https://game-ansh-ap-2026.onrender.com';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three'],
          'gsap-vendor': ['gsap'],
          'swiper-vendor': ['swiper'],
          'socket-vendor': ['socket.io-client'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: BACKEND_TARGET,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: BACKEND_TARGET,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
