import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const documentServiceTarget = env.VITE_DOCUMENT_SERVICE_URL?.trim() || 'http://localhost:8081';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
    server: {
      proxy: {
        '/api/v1/documents': {
          target: documentServiceTarget,
          changeOrigin: true,
        },
      },
    },
  };
})
