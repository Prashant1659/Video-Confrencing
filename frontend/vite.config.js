import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    allowedHosts:['09ed522a52b7.ngrok-free.app']
  }
})
