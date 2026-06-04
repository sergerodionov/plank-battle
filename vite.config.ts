import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// On the production build (GitHub Pages) the app is served from /plank-battle/.
// Local dev stays at the root so `npm run dev` opens http://localhost:5173/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/plank-battle/' : '/',
  plugins: [react()],
}))
