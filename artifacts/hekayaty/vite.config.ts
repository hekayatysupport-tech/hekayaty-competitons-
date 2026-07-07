import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const isReplit = process.env.REPL_ID !== undefined;

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    ...(isReplit && process.env.NODE_ENV !== 'production'
      ? [
          (async () => {
            const { default: runtimeErrorOverlay } = await import('@replit/vite-plugin-runtime-error-modal');
            return runtimeErrorOverlay();
          })(),
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT || '5173'),
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: Number(process.env.PORT || '5173'),
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
