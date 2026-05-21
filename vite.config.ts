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
      '/api/feed/globeandmail': {
        target: 'https://www.theglobeandmail.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/globeandmail/, ''),
      },
      '/api/feed/macleans': {
        target: 'https://www.macleans.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/macleans/, ''),
      },
      '/api/feed/ipolitics': {
        target: 'https://www.ipolitics.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/ipolitics/, ''),
      },
      '/api/feed/canadianpress': {
        target: 'https://www.thecanadianpress.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/canadianpress/, ''),
      },
      '/api/feed/bnnbloomberg': {
        target: 'https://www.bnnbloomberg.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/bnnbloomberg/, ''),
      },
      '/api/feed/aptnnews': {
        target: 'https://www.aptnnews.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/aptnnews/, ''),
      },
      '/api/feed/thenarwhal': {
        target: 'https://thenarwhal.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/thenarwhal/, ''),
      },
      '/api/feed/citynews': {
        target: 'https://www.citynews.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed\/citynews/, ''),
      },
    },
  },
});
