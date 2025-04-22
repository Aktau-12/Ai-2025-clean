
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    open: true,
    historyApiFallback: true,
    proxy: {
      "^/auth/.*": {
        target: import.meta.env.VITE_API_URL,
        changeOrigin: true,
      },
      "^/users/.*": {
        target: import.meta.env.VITE_API_URL,
        changeOrigin: true,
      },
      "^/tests/.*": {
        target: import.meta.env.VITE_API_URL,
        changeOrigin: true,
      },
      "^/coretalents/.*": {
        target: import.meta.env.VITE_API_URL,
        changeOrigin: true,
      },
      "^/mbti/.*": {
        target: import.meta.env.VITE_API_URL,
        changeOrigin: true,
      },
      "^/hero-progress/.*": {
        target: import.meta.env.VITE_API_URL,
        changeOrigin: true,
      },
      "^/rating/.*": {
        target: import.meta.env.VITE_API_URL,
        changeOrigin: true,
      },
    },
  },
});
