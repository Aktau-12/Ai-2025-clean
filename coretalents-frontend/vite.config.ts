// coretalents-frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Загружаем все переменные из .env
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Проксируем эндпоинты API на бэкенд
        '/auth': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/users': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/tests': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      // чтобы process.env не попадал в бандл
      'process.env': {},
    },
  }
})
