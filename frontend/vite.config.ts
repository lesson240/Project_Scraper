// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { fileURLToPath } from "url";
import svgLoader from 'vite-svg-loader'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), svgLoader()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // @ => src 폴더
    },
  },
  // 무한 재시작 방지 설정
  server: {
    watch: {
      // 환경변수 파일 변경 시 재시작 방지
      ignored: [
        '**/.env*',
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**'
      ]
    },
    // 파일 변경 감지 지연
    hmr: {
      overlay: false
    }
  },
  // 환경변수 설정
  define: {
    // 환경변수 접근을 위한 전역 변수 정의
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
});
