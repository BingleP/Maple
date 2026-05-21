import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/feed/ctv': {
        target: 'https://www.ctvnews.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/ctv/, ''),
      },
      '/api/feed/globalnews': {
        target: 'https://globalnews.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/globalnews/, ''),
      },
      '/api/feed/thestar': {
        target: 'https://www.thestar.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/thestar/, ''),
      },
      '/api/feed/nationalpost': {
        target: 'https://nationalpost.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/nationalpost/, ''),
      },
      '/api/feed/cbc': {
        target: 'https://www.cbc.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/cbc/, ''),
      },
    },
  },
});
