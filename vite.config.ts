import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the built app works from any folder (GitHub Pages, a file server, etc.).
export default defineConfig({
  base: './',
  plugins: [react()],
})
