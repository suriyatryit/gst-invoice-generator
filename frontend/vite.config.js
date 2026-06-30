import { defineConfig } from 'vite'
import react from '@vitejs/react-swc' // or '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/gst-invoice-generator/', // <-- MAKE SURE THIS LINE IS PRESENT
})
