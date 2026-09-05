import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  test: { environment: 'jsdom', include: ['tests/unit/**/*.test.ts'], restoreMocks: true },
  build: { manifest: true, sourcemap: true, rollupOptions: { input: { studio: 'index.html', standalone: 'standalone.html' } } },
});
