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
});
