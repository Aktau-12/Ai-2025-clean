// coretalents-frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  // Загружаем все переменные из .env
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tsconfigPaths()  // ← автоматически подтягивает пути из tsconfig.json
    ],
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
        '/habits': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/rating': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/hero': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/mbti': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      // чтобы process.env не попал в бандл
      'process.env': {},
    },
  }
})

