import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Solo el build de GitHub Pages sirve desde /proActivo/; dev y un build
  // local normal (npm run build) siguen en la raíz para no romper el flujo
  // habitual. El workflow de deploy exporta GITHUB_PAGES=true antes de
  // construir — ver .github/workflows/deploy-pages.yml.
  base: process.env.GITHUB_PAGES ? '/proActivo/' : '/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
