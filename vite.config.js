import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Servido na raiz do subdomínio (onboarding.axlemarketingroup.online), então base '/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
