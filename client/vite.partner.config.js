import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// KaamSetu Worker & Partner Portal Website Configuration (Port 5175)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_APP_TYPE': JSON.stringify('partner'),
  },
  server: {
    host: true, // Expose on local Wi-Fi for mobile phone access
    port: 5175,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
