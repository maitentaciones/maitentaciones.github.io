import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// El backend corre en 8001 por defecto; se puede cambiar con BACKEND_URL.
const backend = process.env.BACKEND_URL ?? 'http://127.0.0.1:8001'

// GitHub Pages publica en una subcarpeta (usuario.github.io/repo/). El workflow
// pasa BASE_PATH con el nombre del repo; en local queda en la raíz.
const base = process.env.BASE_PATH ?? '/'

/**
 * GitHub Pages no sabe de rutas de React: al entrar directo a /catalogo busca
 * un archivo que no existe y devuelve 404. Sirviendo la misma página en 404.html
 * la ruta la resuelve React igual que siempre.
 */
function spaFallback() {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      try {
        copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
      } catch {
        /* no hay build que copiar */
      }
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), spaFallback()],
  server: {
    port: 5173,
    proxy: {
      '/api': backend,
    },
  },
})
