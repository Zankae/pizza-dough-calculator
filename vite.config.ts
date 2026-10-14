import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS === 'true' && repository ? `/${repository}/` : '/';
export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    registerType: 'prompt', injectRegister: null, manifest: false,
    workbox: {
      globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest}'],
      cleanupOutdatedCaches: true, navigateFallback: `${base}index.html`,
      clientsClaim: true, skipWaiting: false,
    },
  })],
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'], include: ['src/**/*.test.{ts,tsx}'] },
});
