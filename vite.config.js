import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset paths: the compiled /dist folder works from any mount
  // point — Vercel, static hosting, or an <iframe> embed on an existing site
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // split the heavy engines into parallel-loading vendor chunks
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          deck: ['deck.gl', '@deck.gl/react'],
          maps: ['maplibre-gl', 'mapbox-gl', 'react-map-gl'],
        },
      },
    },
  },
})
