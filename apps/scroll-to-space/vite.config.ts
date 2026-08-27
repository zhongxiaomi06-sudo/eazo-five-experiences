import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react()],
    base: './',
    publicDir: 'content',
    define: {
      'process.env': JSON.stringify({
        NODE_ENV: mode === 'production' ? 'production' : 'development',
        VITE_EAZO_APP_ID: env.VITE_EAZO_APP_ID ?? 'scroll-to-space',
        VITE_EAZO_PLATFORM_API_BASE: env.VITE_EAZO_PLATFORM_API_BASE ?? 'https://eazo.ai',
      }),
    },
    build: { sourcemap: true, assetsInlineLimit: 4096, chunkSizeWarningLimit: 1400 },
  };
});
