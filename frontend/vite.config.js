// vite.config.js
// Vite build configuration for the Ticket & Asset Management frontend.
// Sets up React plugin, dev server port, and API proxy rules so that
// /api/tickets/* → ticket-service (5001) and /api/assets/* → asset-service (5002)
// without CORS issues during local development.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,

    proxy: {
        '/api/auth': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/auth/, '/auth'),
        },
        '/api/tickets': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (_, req) => {
              console.log('[PROXY →]', req.method, req.url)
            })
            proxy.on('error', (err) => {
              console.log('[PROXY ERR]', err.message)
            })
          }
        },
        '/api/projects': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/api/assets': {
          target: 'https://asset-service-ifek.onrender.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      }
    }
  })
