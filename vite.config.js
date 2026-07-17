import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset paths: the compiled /dist folder works from any mount
  // point — Vercel, static hosting, or an <iframe> embed on an existing site
  base: './',
  plugins: [react()],
})
