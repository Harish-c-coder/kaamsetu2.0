import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// KaamSetu Customer Marketplace Website Configuration (Port 5174)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_APP_TYPE': JSON.stringify('customer'),
  },
  server: {
    host: true, // Expose on local Wi-Fi for mobile phone access
    port: 5174,
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
