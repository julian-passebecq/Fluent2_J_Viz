import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', include: ['tests/unit/**/*.test.ts'], restoreMocks: true },
  build: { rollupOptions: { input: { studio: 'index.html', standalone: 'standalone.html' } } },
});
