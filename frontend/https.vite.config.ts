import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    },
    port: 5173,
    proxy: {
      '/api': {
  target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
