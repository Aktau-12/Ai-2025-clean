
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
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "^/users/.*": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "^/tests/.*": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "^/coretalents/.*": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "^/mbti/.*": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "^/hero-progress/.*": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "^/rating/.*": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
