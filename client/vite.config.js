import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/concesionarias_landing_v2/',
  server: {
    port: 3000,
  },
});
